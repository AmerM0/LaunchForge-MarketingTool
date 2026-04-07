"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2 } from "lucide-react";
import { PLANS } from "@/lib/stripe/client";
import type { User } from "@supabase/supabase-js";

interface PricingCardsProps {
  plans: typeof PLANS;
  user: User | null;
}

export default function PricingCards({ plans, user }: PricingCardsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string, planKey: string) => {
    if (!user) {
      router.push(`/signup`);
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
      {entries.map(([key, plan]) => {
        const isPro      = key === "pro";
        const isLoading  = loading === key;

        return (
          <div
            key={key}
            className={`relative flex flex-col rounded-2xl border p-7 ${
              isPro
                ? "border-primary shadow-xl shadow-primary/10 bg-primary/[0.02]"
                : "bg-card"
            }`}
          >
            {isPro && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-4">
                Most Popular
              </Badge>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
            </div>

            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-muted-foreground text-sm">/month</span>
            </div>

            <ul className="flex-1 space-y-3 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              className="w-full"
              variant={isPro ? "default" : "outline"}
              disabled={isLoading}
              onClick={() => handleCheckout(plan.priceId, key)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Redirecting...
                </>
              ) : (
                "Start 7-Day Free Trial"
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              No credit card required to start
            </p>
          </div>
        );
      })}
    </div>
  );
}
