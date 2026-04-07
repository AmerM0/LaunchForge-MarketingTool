import { createServerClient } from "@/lib/supabase/server";
import PricingCards from "@/components/pricing/PricingCards";
import { PLANS } from "@/lib/stripe/client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function PricingPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="mb-6">
          <Link
            href={user ? "/dashboard" : "/"}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {user ? "Back to Dashboard" : "Back to Home"}
          </Link>
        </div>

        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            6 specialized AI agents build your complete ecommerce brand strategy —
            market analysis, positioning, offer, copy, ads, and launch plan — in
            under 2 minutes.
          </p>
          <p className="text-sm text-muted-foreground mt-3 font-medium">
            ✓ 7-day free trial &nbsp;·&nbsp; ✓ Cancel anytime &nbsp;·&nbsp; ✓ No hidden fees
          </p>
        </div>

        <PricingCards plans={PLANS} user={user} />

        <p className="text-center text-sm text-muted-foreground mt-12">
          Questions?{" "}
          <a href="mailto:support@yourdomain.com" className="underline">
            Contact us
          </a>
        </p>
      </div>
    </main>
  );
}
