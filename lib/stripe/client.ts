import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

/**
 * Pricing plans config.
 * ─────────────────────────────────────────────────────────────────────────────
 * FEATURE POLICY: Only list features that are actually built and functional.
 * Misleading feature copy causes chargebacks and destroys trust.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const PLANS = {
  starter: {
    name:        "Starter",
    price:       "$69.99",
    priceId:     process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID!,
    description: "For solo founders testing a new brand or product idea.",
    monthlyKitLimit: 5,          // enforced server-side in generate route
    features: [
      "5 brand kits per month",
      "All 6 AI specialist agents",
      "Market analysis & competitor deep-dive",
      "Brand positioning & identity system",
      "Offer architecture & revenue model",
      "Ad strategy & media buying playbook",
      "90-day growth & launch plan",
      "Email support",
    ],
  },
  pro: {
    name:        "Pro",
    price:       "$119.99",
    priceId:     process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!,
    description: "For serious ecommerce brands iterating fast.",
    monthlyKitLimit: Infinity,   // unlimited
    features: [
      "Unlimited brand kits",
      "All 6 AI specialist agents",
      "Market analysis & competitor deep-dive",
      "Brand positioning & identity system",
      "Offer architecture & revenue model",
      "Ad strategy & media buying playbook",
      "90-day growth & launch plan",
      "Priority email support",
    ],
  },
  agency: {
    name:        "Agency",
    price:       "$279.99",
    priceId:     process.env.NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID!,
    description: "For agencies building brand strategies for multiple clients.",
    monthlyKitLimit: Infinity,   // unlimited
    features: [
      "Unlimited brand kits",
      "All 6 AI specialist agents",
      "Market analysis & competitor deep-dive",
      "Brand positioning & identity system",
      "Offer architecture & revenue model",
      "Ad strategy & media buying playbook",
      "90-day growth & launch plan",
      "1-on-1 onboarding strategy call",
      "Priority email & chat support",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
