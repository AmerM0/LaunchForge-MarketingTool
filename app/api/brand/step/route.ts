import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { runStep } from "@/lib/langgraph/workflow";
import { checkActiveSubscription } from "@/lib/stripe/subscriptionCheck";
import type { BrandKitState } from "@/lib/langgraph/schemas/nodeSchemas";

// Each individual step runs one LLM call — max ~90s even for the longest node.
// Well within Vercel Pro's 300s function timeout.
export const maxDuration = 120;
export const runtime     = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Subscription gate (skip in dev) ───────────────────────────────────────
    if (process.env.NODE_ENV !== "development") {
      const isActive = await checkActiveSubscription(user.id, supabase);
      if (!isActive) {
        return NextResponse.json(
          { error: "Active subscription required", redirect: "/pricing" },
          { status: 403 }
        );
      }
    }

    // ── Parse body ────────────────────────────────────────────────────────────
    const body = await req.json();
    const { step, state } = body as { step: 1 | 2 | 3 | 4 | 5 | 6; state: BrandKitState };

    if (!step || step < 1 || step > 6) {
      return NextResponse.json({ error: "step must be 1–6" }, { status: 400 });
    }
    if (!state?.product_idea || !state?.niche || !state?.target_audience) {
      return NextResponse.json({ error: "Missing required state fields" }, { status: 400 });
    }

    // ── Run the single agent node ─────────────────────────────────────────────
    console.log(`[Step API] Running step ${step}/6 for user ${user.id}`);
    const result = await runStep(step, state);
    console.log(`[Step API] Step ${step}/6 complete`);

    return NextResponse.json({ step, result });

  } catch (err: any) {
    console.error("[Step API] Error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Step failed — please retry" },
      { status: 500 }
    );
  }
}
