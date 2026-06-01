import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { checkActiveSubscription } from "@/lib/stripe/subscriptionCheck";

export const maxDuration = 60;
export const runtime = "nodejs";

// ─────────────────────────────────────────────────────────────────────────────
// fal.ai endpoints
// ─────────────────────────────────────────────────────────────────────────────
//
// Text → Image  :  fal-ai/flux-pro/v1.1          ($0.04/img, best quality)
// Image → Image :  fal-ai/flux/dev/image-to-image ($0.02/img, prompt-guided
//                  style transfer that preserves the product's structure)
// ─────────────────────────────────────────────────────────────────────────────

const FAL_TXT2IMG = "https://fal.run/fal-ai/flux-pro/v1.1";
const FAL_IMG2IMG = "https://fal.run/fal-ai/flux/dev/image-to-image";

// ── Types ────────────────────────────────────────────────────────────────────

type AspectRatio =
  | "square_hd"
  | "square"
  | "portrait_4_3"
  | "portrait_16_9"
  | "landscape_4_3"
  | "landscape_16_9";

interface FalImage {
  url: string;
  width: number;
  height: number;
  content_type: string;
}

interface FalResponse {
  images: FalImage[];
  timings?: { inference?: number };
  seed?: number;
}

// ── fal.ai calls ─────────────────────────────────────────────────────────────

function falHeaders(): HeadersInit {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) throw new Error("FAL_KEY environment variable is not set");
  return {
    "Content-Type": "application/json",
    Authorization: `Key ${apiKey}`,
  };
}

async function txt2img(
  prompt: string,
  aspectRatio: AspectRatio,
  numImages: number
): Promise<FalImage[]> {
  const res = await fetch(FAL_TXT2IMG, {
    method: "POST",
    headers: falHeaders(),
    body: JSON.stringify({
      prompt,
      image_size: aspectRatio,
      num_inference_steps: 28,
      num_images: numImages,
      enable_safety_checker: true,
      output_format: "jpeg",
      guidance_scale: 3.5,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`fal.ai txt2img ${res.status}: ${err}`);
  }

  const data: FalResponse = await res.json();
  return data.images ?? [];
}

async function img2img(
  imageUrl: string,
  prompt: string,
  aspectRatio: AspectRatio,
  numImages: number,
  strength: number
): Promise<FalImage[]> {
  const res = await fetch(FAL_IMG2IMG, {
    method: "POST",
    headers: falHeaders(),
    body: JSON.stringify({
      image_url: imageUrl,
      prompt,
      strength,                   // 0.65 Subtle → 0.80 Balanced → 0.92 Creative
      image_size: aspectRatio,
      num_inference_steps: 28,
      num_images: numImages,
      enable_safety_checker: true,
      output_format: "jpeg",
      guidance_scale: 3.5,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`fal.ai img2img ${res.status}: ${err}`);
  }

  const data: FalResponse = await res.json();
  return data.images ?? [];
}

// ── Prompt builder ────────────────────────────────────────────────────────────

interface PromptInputs {
  productDescription: string;
  photographyStyle: string;
  mood: string;
  useCase: string;
  brandName?: string;
  scene?: string;
  colorContext?: string;
  additionalDetails?: string;
  isImg2Img?: boolean;
}

function buildPrompt(inputs: PromptInputs): string {
  const {
    productDescription,
    photographyStyle,
    mood,
    useCase,
    brandName,
    scene,
    colorContext,
    additionalDetails,
    isImg2Img,
  } = inputs;

  const parts: string[] = [];

  // For img2img, lead with style intention (product is already in the image)
  if (isImg2Img) {
    parts.push(`Transform this product photo into ${stylePhrase(photographyStyle)}`);
    if (productDescription.trim()) parts.push(`featuring ${productDescription.trim()}`);
  } else {
    parts.push(productDescription.trim());
    if (brandName) parts.push(`for the brand "${brandName}"`);
    parts.push(stylePhrase(photographyStyle));
  }

  // Mood
  parts.push(moodPhrase(mood));

  // Use case — critical for precise generation
  parts.push(useCasePhrase(useCase));

  // Scene
  if (scene?.trim()) parts.push(`set in ${scene.trim()}`);

  // Brand colors
  if (colorContext?.trim()) parts.push(`featuring brand colors: ${colorContext.trim()}`);

  // Extra details
  if (additionalDetails?.trim()) parts.push(additionalDetails.trim());

  // Quality tail
  parts.push(
    "professional commercial photography, ultra-sharp focus, 8k resolution, " +
    "advertising ready, studio quality lighting"
  );

  return parts.join(", ");
}

function stylePhrase(style: string): string {
  const map: Record<string, string> = {
    product_white: "clean product shot on pure white background, studio lighting, perfect e-commerce product photography",
    lifestyle:     "lifestyle photography with natural environment, authentic real-world usage, warm natural light",
    flat_lay:      "flat lay composition photographed from directly above, styled arrangement on a clean surface, perfect symmetry",
    editorial:     "editorial fashion photography, dramatic cinematic lighting, high-end luxury magazine aesthetic",
    environmental: "product photographed in its natural environment, immersive contextual setting, depth of field",
    macro:         "extreme close-up macro photography, intricate texture details visible, razor sharp focus on product surface",
    campaign:      "cinematic campaign hero shot, wide-angle brand story, aspirational brand feel, golden hour light",
  };
  return map[style] ?? style;
}

function moodPhrase(mood: string): string {
  const map: Record<string, string> = {
    luxury:       "luxurious premium atmosphere, rich deep tones, sophisticated elegance, aspirational feel",
    minimal:      "minimalist aesthetic, clean white negative space, modern simplicity, Scandinavian design sensibility",
    vibrant:      "vibrant bold colors, energetic dynamic composition, eye-catching saturated palette",
    natural:      "natural organic warmth, earthy tones, sustainability feel, handcrafted authenticity",
    dark:         "dark moody atmosphere, dramatic high-contrast shadows, noir cinematic mystery, deep blacks",
    playful:      "playful cheerful energy, bright friendly colors, fun and approachable personality",
    professional: "clean professional confidence, sharp corporate credibility, trustworthy and authoritative",
  };
  return map[mood] ?? mood;
}

function useCasePhrase(useCase: string): string {
  const map: Record<string, string> = {
    ad_creative:     "optimized for paid advertising, strong product prominence, immediate visual impact, performance ad creative, clear focal point, minimal clutter",
    instagram_post:  "optimized for Instagram feed, scroll-stopping aesthetic, square crop friendly, high engagement visual, lifestyle feel",
    product_listing: "e-commerce product listing optimized, full product visibility, clean neutral background, all product details visible, buyer-focused composition",
    email_banner:    "email marketing banner, wide horizontal composition, clean header visual, brand-safe design, elegant and readable",
    story_reel:      "vertical 9:16 story format, full-bleed portrait composition, bold visual for mobile story, quick attention-grabbing",
    general:         "versatile brand visual, balanced composition, multi-use marketing asset",
  };
  return map[useCase] ?? "high-quality brand photography";
}

// ── Route handler ─────────────────────────────────────────────────────────────

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

    // Subscription (skip in dev)
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
      brandName,
      productDescription,
      photographyStyle,
      mood,
      useCase = "general",
      scene,
      colorContext,
      additionalDetails,
      aspectRatio = "square_hd",
      numImages = 2,
      // Image-to-image fields
      imageData,   // base64 data URI — e.g. "data:image/jpeg;base64,..."
      strength = 0.80,
    } = body;

    if (!productDescription && !imageData) {
      return NextResponse.json(
        { error: "Provide either a product description or a reference image" },
        { status: 400 }
      );
    }
    if (!photographyStyle || !mood) {
      return NextResponse.json(
        { error: "Missing required fields: photographyStyle, mood" },
        { status: 400 }
      );
    }

    const clampedNum      = Math.min(Math.max(Number(numImages), 1), 4);
    const clampedStrength = Math.min(Math.max(Number(strength), 0.5), 0.99);
    const isImg2Img       = Boolean(imageData);

    const prompt = buildPrompt({
      productDescription: productDescription ?? "",
      photographyStyle,
      mood,
      useCase,
      brandName,
      scene,
      colorContext,
      additionalDetails,
      isImg2Img,
    });

    console.log(
      `[Visuals API] mode=${isImg2Img ? "img2img" : "txt2img"} ` +
      `useCase=${useCase} num=${clampedNum} user=${user.id}`
    );
    console.log(`[Visuals API] Prompt: ${prompt.slice(0, 140)}…`);

    let images: FalImage[];

    if (isImg2Img) {
      images = await img2img(
        imageData,
        prompt,
        aspectRatio as AspectRatio,
        clampedNum,
        clampedStrength
      );
    } else {
      images = await txt2img(prompt, aspectRatio as AspectRatio, clampedNum);
    }

    return NextResponse.json({ images, prompt });

  } catch (err: any) {
    console.error("[Visuals API] Error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Image generation failed" },
      { status: 500 }
    );
  }
}
