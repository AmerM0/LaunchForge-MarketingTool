"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Sparkles, ArrowRight, Zap, Building2, Shield } from "lucide-react";
import { PLANS } from "@/lib/stripe/client";
import type { User } from "@supabase/supabase-js";

interface PricingCardsProps {
  plans: typeof PLANS;
  user: User | null;
}

const PLAN_ICONS = {
  starter: Zap,
  pro:     Sparkles,
  agency:  Building2,
} as const;

export default function PricingCards({ plans, user }: PricingCardsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string, planKey: string) => {
    if (!user) {
      router.push("/signup");
      return;
    }
    setLoading(planKey);
    try {
      const res = await fetch("/api/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ priceId }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Could not start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const entries = Object.entries(plans) as [keyof typeof PLANS, typeof plans[keyof typeof PLANS]][];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-7">
      {entries.map(([key, plan]) => {
        const isPro     = key === "pro";
        const isLoading = loading === key;
        const PlanIcon  = PLAN_ICONS[key] ?? Sparkles;

        return (
          <div
            key={key}
            className={`relative flex flex-col rounded-2xl p-7 ${
              isPro
                ? "card-glow-border glow-purple"
                : "glass-card"
            }`}
          >
            {/* Popular badge */}
            {isPro && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-violet-500/30">
                  <Sparkles className="w-3 h-3" />
                  Most Popular
                </span>
              </div>
            )}

            {/* Plan icon + name */}
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isPro
                  ? "bg-gradient-to-br from-violet-500/30 to-indigo-500/20 border border-violet-500/30"
                  : "bg-white/5 border border-white/10"
              }`}>
                <PlanIcon className={`w-4 h-4 ${isPro ? "text-violet-300" : "text-muted-foreground"}`} />
              </div>
              <div>
                <h3 className="font-bold text-base">{plan.name}</h3>
                <p className="text-xs text-muted-foreground">{plan.description}</p>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className={`text-4xl font-black ${isPro ? "gradient-text-purple" : ""}`}>
                  {plan.price}
                </span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
            </div>

            {/* Features */}
            <ul className="flex-1 space-y-2.5 mb-7">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      isPro ? "text-violet-400" : "text-emerald-500"
                    }`}
                  />
                  <span className={isPro ? "text-foreground/90" : "text-muted-foreground"}>{f}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              disabled={isLoading}
              onClick={() => handleCheckout(plan.priceId, key)}
              className={`w-full inline-flex items-center justify-center gap-2 font-semibold rounded-xl px-6 py-3 text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                isPro
                  ? "btn-gradient text-white"
                  : "bg-white/5 border border-white/10 text-foreground hover:bg-white/10 hover:border-white/20"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirecting…
                </>
              ) : (
                <>
                  Get Started
                  {isPro && <ArrowRight className="w-4 h-4" />}
                </>
              )}
            </button>

            {/* Money-back guarantee note */}
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/70 mt-2.5">
              <Shield className="w-3 h-3" />
              30-day money-back guarantee
            </p>
          </div>
        );
      })}
    </div>
  );
}
