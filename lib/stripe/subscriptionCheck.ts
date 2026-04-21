import { redirect } from "next/navigation";
import type { PlanKey } from "./client";

// Duck-typed minimal interface — works with any Supabase client variant
// (server client, browser client, admin client) regardless of version generics
interface QueryableClient {
  from(table: string): any;
}

/**
 * Returns true only if the user has an active or trialing subscription
 * that hasn't expired yet. Used in both Server Components and API routes.
 */
export async function checkActiveSubscription(
  userId: string,
  supabase: QueryableClient
): Promise<boolean> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", userId)
    .in("status", ["active", "trialing"])
    .order("current_period_end", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return false;

  const now = new Date();
  const periodEnd = new Date(data.current_period_end ?? 0);
  return periodEnd > now;
}

/**
 * Use this in layout.tsx (Dashboard RSC layout).
 * Redirects to /pricing if user has no active subscription.
 */
export async function requireActiveSubscription(
  userId: string,
  supabase: QueryableClient
): Promise<void> {
  const isActive = await checkActiveSubscription(userId, supabase);
  if (!isActive) redirect("/pricing");
}

/**
 * Returns the user's current plan key ('starter' | 'pro' | 'agency' | null).
 * Matches the subscription's price_id against the PLANS env vars.
 * Returns null if the user has no active subscription.
 */
export async function getUserPlanKey(
  userId: string,
  supabase: QueryableClient
): Promise<PlanKey | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("price_id, status, current_period_end")
    .eq("user_id", userId)
    .in("status", ["active", "trialing"])
    .order("current_period_end", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  // Check the period hasn't expired
  const now = new Date();
  if (new Date(data.current_period_end ?? 0) <= now) return null;

  const priceId = data.price_id as string;

  // Match against env vars — avoids importing the Stripe client (server-only)
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID) return "starter";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID)     return "pro";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID)  return "agency";

  // Unknown price ID (e.g. legacy plan) — default to starter limits to be safe
  return "starter";
}

/**
 * Plan monthly kit limits.
 * Keep in sync with PLANS.monthlyKitLimit in lib/stripe/client.ts.
 */
const MONTHLY_KIT_LIMITS: Record<PlanKey, number> = {
  starter: 5,
  pro:     Infinity,
  agency:  Infinity,
};

/**
 * Checks whether the user is allowed to generate another brand kit this month.
 * Only enforces limits for the Starter plan.
 *
 * @returns { allowed, count, limit, planKey }
 */
export async function checkMonthlyKitUsage(
  userId: string,
  admin: QueryableClient
): Promise<{ allowed: boolean; count: number; limit: number; planKey: PlanKey | null }> {
  const planKey = await getUserPlanKey(userId, admin);

  // No active subscription at all — the main subscription gate handles this
  if (!planKey) {
    return { allowed: false, count: 0, limit: 0, planKey: null };
  }

  const limit = MONTHLY_KIT_LIMITS[planKey];

  // Pro / Agency — unlimited
  if (limit === Infinity) {
    return { allowed: true, count: 0, limit: Infinity, planKey };
  }

  // Starter — count brand kits created since the start of the current calendar month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count, error } = await admin
    .from("brand_kits")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", monthStart);

  if (error) {
    // If the count query fails, be permissive rather than blocking the user
    console.error("[checkMonthlyKitUsage] Count query failed:", error);
    return { allowed: true, count: 0, limit, planKey };
  }

  const used = count ?? 0;
  return { allowed: used < limit, count: used, limit, planKey };
}
