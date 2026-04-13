import { createServerClient } from "@/lib/supabase/server";
import PricingCards from "@/components/pricing/PricingCards";
import { PLANS } from "@/lib/stripe/client";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";

const TRUST_ITEMS = [
  "7-day free trial",
  "Cancel anytime",
  "No hidden fees",
  "Instant access",
];

export default async function PricingPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-background mesh-bg relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-violet-600/8 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 md:py-24">

        {/* Back link */}
        <div className="mb-10">
          <Link
            href={user ? "/dashboard" : "/"}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {user ? "Back to Dashboard" : "Back to Home"}
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-300 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Simple, transparent pricing
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-5">
            One price. <span className="gradient-text-purple">Full brand strategy.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            6 specialized AI agents build your complete ecommerce brand — market analysis,
            positioning, offer architecture, copy, ad strategy, and a 90-day launch plan.
            In under 4 minutes.
          </p>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6">
            {TRUST_ITEMS.map((item) => (
              <span key={item} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing cards */}
        <PricingCards plans={PLANS} user={user} />

        {/* FAQ / comparison note */}
        <div className="mt-16 text-center glass-card rounded-2xl p-8 max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-foreground mb-2">
            A strategy firm would charge $15,000–$50,000 for this.
          </p>
          <p className="text-sm text-muted-foreground">
            AI Brand Architect gives you the same caliber output — market sizing, ICP, brand
            positioning, offer architecture, ad creatives, and launch plan — in under 4 minutes,
            for a fraction of the cost.
          </p>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          Questions?{" "}
          <a href="mailto:support@yourdomain.com" className="text-violet-400 hover:text-violet-300 transition-colors">
            Contact us
          </a>
        </p>
      </div>
    </main>
  );
}
