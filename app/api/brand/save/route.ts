import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createAdminClient } from "@/lib/supabase/server";
import { checkMonthlyKitUsage } from "@/lib/stripe/subscriptionCheck";
import type { BrandKitState } from "@/lib/langgraph/schemas/nodeSchemas";

export const maxDuration = 30;
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

    const admin = createAdminClient();

    // ── Monthly limit check (Starter = 5/month) ───────────────────────────────
    if (process.env.NODE_ENV !== "development") {
      const { allowed, limit, planKey } = await checkMonthlyKitUsage(user.id, admin);
      if (!allowed) {
        return NextResponse.json(
          {
            error: `You've used all ${limit} brand kits in your ${planKey ?? "current"} plan this month. Upgrade to Pro for unlimited brand kits.`,
            redirect: "/pricing",
          },
          { status: 429 }
        );
      }
    }

    // ── Parse body ────────────────────────────────────────────────────────────
    const body = await req.json();
    const { projectId, brandKit } = body as { projectId: string; brandKit: BrandKitState };

    if (!projectId || !brandKit) {
      return NextResponse.json({ error: "Missing projectId or brandKit" }, { status: 400 });
    }

    // ── Save brand kit ────────────────────────────────────────────────────────
    const startTime = Date.now();

    const { data: savedKit, error: saveError } = await admin
      .from("brand_kits")
      .insert({
        project_id:         projectId,
        user_id:            user.id,
        market_analysis:    brandKit.market_analysis  as any,
        positioning:        brandKit.positioning       as any,
        offer:              brandKit.offer             as any,
        copy:               brandKit.copy              as any,
        ad_strategy:        brandKit.ad_strategy       as any,
        launch_plan:        brandKit.launch_plan       as any,
        generation_time_ms: Date.now() - startTime,
      })
      .select()
      .single();

    if (saveError) {
      console.error("[Save API] brand_kits insert failed:", saveError);
      // Non-fatal — mark complete anyway and return raw kit
      await admin.from("projects").update({ status: "complete" }).eq("id", projectId);
      return NextResponse.json({ brandKit }, { status: 200 });
    }

    // ── Mark project complete ─────────────────────────────────────────────────
    await admin.from("projects").update({ status: "complete" }).eq("id", projectId);

    return NextResponse.json({ brandKit: savedKit });

  } catch (err: any) {
    console.error("[Save API] Error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Save failed" },
      { status: 500 }
    );
  }
}
