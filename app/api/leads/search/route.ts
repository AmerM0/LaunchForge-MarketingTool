import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { checkActiveSubscription } from "@/lib/stripe/subscriptionCheck";

export const maxDuration = 30;
export const runtime     = "nodejs";

// ─────────────────────────────────────────────────────────────────────────────
// Google Places API (New) — Text Search
// Docs: https://developers.google.com/maps/documentation/places/web-service/text-search
//
// Single call returns name, address, phone, website, types, rating, status.
// Cost: ~$0.017 per request (max 20 results per call).
// ─────────────────────────────────────────────────────────────────────────────

const PLACES_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";

// Fields we request — only pay for what we ask for in the new billing model
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.types",
  "places.businessStatus",
  "places.rating",
  "places.userRatingCount",
].join(",");

export interface Lead {
  id:          string;
  name:        string;
  category:    string;
  phone:       string;
  address:     string;
  city:        string;
  country:     string;
  website:     string;
  rating:      number | null;
  reviewCount: number | null;
  status:      string;
}

interface PlacesResult {
  id:                      string;
  displayName?:            { text: string };
  formattedAddress?:       string;
  nationalPhoneNumber?:    string;
  internationalPhoneNumber?: string;
  websiteUri?:             string;
  types?:                  string[];
  businessStatus?:         string;
  rating?:                 number;
  userRatingCount?:        number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatCategory(types: string[]): string {
  if (!types?.length) return "Business";
  // Pick the most descriptive non-generic type
  const skip = new Set([
    "establishment", "point_of_interest", "business", "store",
    "food", "service", "health", "finance", "place_of_worship",
  ]);
  const best = types.find((t) => !skip.has(t)) ?? types[0];
  return best
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractCity(address: string): string {
  // "123 Main St, Austin, TX 78701, USA" → "Austin, TX"
  const parts = address.split(",").map((p) => p.trim());
  if (parts.length >= 3) return parts[parts.length - 3] + ", " + parts[parts.length - 2].replace(/\s\d{5}.*/, "");
  return parts[parts.length - 2] ?? "";
}

function extractCountry(address: string): string {
  const parts = address.split(",").map((p) => p.trim());
  return parts[parts.length - 1] ?? "";
}

function normalizeLead(p: PlacesResult): Lead {
  const address = p.formattedAddress ?? "";
  return {
    id:          p.id,
    name:        p.displayName?.text ?? "Unknown",
    category:    formatCategory(p.types ?? []),
    phone:       p.nationalPhoneNumber ?? p.internationalPhoneNumber ?? "",
    address,
    city:        extractCity(address),
    country:     extractCountry(address),
    website:     p.websiteUri ?? "",
    rating:      p.rating ?? null,
    reviewCount: p.userRatingCount ?? null,
    status:      p.businessStatus ?? "OPERATIONAL",
  };
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // Auth
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Subscription gate (skip in dev)
    if (process.env.NODE_ENV !== "development") {
      const isActive = await checkActiveSubscription(user.id, supabase);
      if (!isActive) {
        return NextResponse.json(
          { error: "Active subscription required", redirect: "/pricing" },
          { status: 403 }
        );
      }
    }

    // Parse body
    const body = await req.json();
    const {
      niche,
      location,
      maxResults = 20,
      radius,     // optional, in metres (default: Google picks best)
      language = "en",
    } = body as {
      niche:      string;
      location:   string;
      maxResults: number;
      radius?:    number;
      language?:  string;
    };

    if (!niche?.trim() || !location?.trim()) {
      return NextResponse.json(
        { error: "niche and location are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_PLACES_API_KEY is not configured on the server" },
        { status: 500 }
      );
    }

    const clampedMax = Math.min(Math.max(Number(maxResults), 1), 20);

    // Build the text query — natural language works best with Google Places
    const textQuery = `${niche.trim()} in ${location.trim()}`;

    const requestBody: Record<string, any> = {
      textQuery,
      maxResultCount: clampedMax,
      languageCode: language,
    };

    if (radius) requestBody.locationBias = {
      circle: {
        center: {},  // Google will geocode the location from textQuery
        radius,
      },
    };

    console.log(`[Leads API] Searching: "${textQuery}" max=${clampedMax}`);

    const res = await fetch(PLACES_SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type":   "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Leads API] Google Places error:", res.status, errText);
      throw new Error(`Google Places API ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const places: PlacesResult[] = data.places ?? [];

    const leads: Lead[] = places.map(normalizeLead);

    console.log(`[Leads API] Returned ${leads.length} leads for "${textQuery}"`);

    return NextResponse.json({
      leads,
      query:     textQuery,
      total:     leads.length,
      withPhone: leads.filter((l) => l.phone).length,
      withSite:  leads.filter((l) => l.website).length,
    });

  } catch (err: any) {
    console.error("[Leads API] Error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Lead search failed" },
      { status: 500 }
    );
  }
}
