import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

/**
 * Pricing plans config.
 * Update the priceId values with your real Stripe Price IDs after
 * creating products in the Stripe Dashboard.
 */
export const PLANS = {
  starter: {
    name: "Starter",
    price: "$49",
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID!,
    description: "Perfect for solo founders and first-time brand builders.",
    features: [
      "5 brand kits per month",
      "All 6 AI agent nodes",
      "Market analysis + positioning",
      "Ad strategy + launch plan",
      "PDF export",
      "Email support",
    ],
  },
  pro: {
    name: "Pro",
    price: "$99",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!,
    description: "For serious ecommerce brands scaling fast.",
    features: [
      "Unlimited brand kits",
      "All 6 AI agent nodes",
      "Priority generation queue",
      "PDF + Notion export",
      "Team collaboration (3 seats)",
      "Priority support",
      "Custom brand templates",
    ],
  },
  agency: {
    name: "Agency",
    price: "$249",
    priceId: process.env.NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID!,
    description: "For agencies managing multiple client brands.",
    features: [
      "Unlimited brand kits",
      "White-label reports",
      "API access",
      "Unlimited team seats",
      "Dedicated account manager",
      "Custom AI fine-tuning",
      "SLA + uptime guarantee",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
