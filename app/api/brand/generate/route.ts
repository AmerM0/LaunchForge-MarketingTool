import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createAdminClient } from "@/lib/supabase/server";
import { runBrandArchitectWorkflow } from "@/lib/langgraph/workflow";
import { checkActiveSubscription, checkMonthlyKitUsage } from "@/lib/stripe/subscriptionCheck";

export const maxDuration = 300; // 5 min — requires Vercel Pro plan
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let step = "init";

  try {
    // ── STEP 1: Auth ──────────────────────────────────────────────────────────
    step = "auth";
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin client used for all DB ops after auth (bypasses RLS + survives JWT expiry)
    const admin = createAdminClient();

    // ── STEP 2: Subscription gate (skip in dev) ───────────────────────────────
    step = "subscription-check";
    if (process.env.NODE_ENV !== "development") {
      const isActive = await checkActiveSubscription(user.id, supabase);
      if (!isActive) {
        return NextResponse.json(
          { error: "Active subscription required", redirect: "/pricing" },
          { status: 403 }
        );
      }
    }

    // ── STEP 2b: Monthly kit usage limit (Starter = 5/month) ─────────────────
    step = "usage-check";
    if (process.env.NODE_ENV !== "development") {
      const { allowed, limit, planKey } = await checkMonthlyKitUsage(user.id, admin);
      if (!allowed) {
        return NextResponse.json(
          {
            error: `You've used all ${limit} brand kits included in your ${planKey ?? "current"} plan this month. Upgrade to Pro for unlimited brand kits.`,
            redirect: "/pricing",
          },
          { status: 429 }
        );
      }
    }

    // ── STEP 3: Parse request body ────────────────────────────────────────────
    step = "parse-body";
    const body = await req.json();
    const {
      projectId,
      product_idea,
      niche,
      target_audience,
      budget_range,
      competitors,
      usp,
    } = body;

    if (!projectId || !product_idea || !niche || !target_audience) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ── STEP 4: Mark project as generating (non-blocking) ─────────────────────
    step = "mark-generating";
    await admin
      .from("projects")
      .update({ status: "generating" })
      .eq("id", projectId)
      .eq("user_id", user.id);

    // ── STEP 5: Run the 6-node LangGraph workflow ─────────────────────────────
    step = "workflow";
    const startTime = Date.now();
    console.log("[Generate API] Starting workflow...");

    const brandKit = await runBrandArchitectWorkflow({
      product_idea,
      niche,
      target_audience,
      budget_range,
      competitors,
      usp,
      brand_stage: "new",
    });

    const generationTimeMs = Date.now() - startTime;
    console.log(`[Generate API] Workflow completed in ${generationTimeMs}ms`);

    // ── STEP 6: Save brand kit (use admin client to bypass RLS + token expiry) ─
    step = "save-brand-kit";
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
        generation_time_ms: generationTimeMs,
      })
      .select()
      .single();

    if (saveError) {
      // Log the exact save error but don't kill the response —
      // the user waited 3+ minutes, give them their data anyway.
      console.error("[Generate API] brand_kits save failed:", saveError);

      // Still mark project as complete since the workflow succeeded
      await admin
        .from("projects")
        .update({ status: "complete" })
        .eq("id", projectId);

      // Return the raw workflow output so the frontend can still display it
      return NextResponse.json({ brandKit: brandKit as any }, { status: 200 });
    }

    // ── STEP 7: Mark project as complete ──────────────────────────────────────
    step = "mark-complete";
    await admin
      .from("projects")
      .update({ status: "complete" })
      .eq("id", projectId);

    return NextResponse.json({ brandKit: savedKit }, { status: 200 });

  } catch (err: any) {
    console.error(`[Generate API] FAILED at step="${step}":`, err);

    const message =
      err?.message ??
      err?.error_description ??
      (typeof err === "string" ? err : "Unknown error");

    return NextResponse.json(
      { error: `[${step}] ${message}` },
      { status: 500 }
    );
  }
}
