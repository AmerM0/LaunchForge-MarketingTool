import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { runBrandArchitectWorkflow } from "@/lib/langgraph/workflow";
import { checkActiveSubscription } from "@/lib/stripe/subscriptionCheck";

export const maxDuration = 300; // 5 min — requires Vercel Pro plan
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();

  // 1. Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Subscription gate
  const isActive = await checkActiveSubscription(user.id, supabase);
  if (!isActive) {
    return NextResponse.json(
      { error: "Active subscription required", redirect: "/pricing" },
      { status: 403 }
    );
  }

  // 3. Parse request body
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

  // 4. Mark project as generating
  await supabase
    .from("projects")
    .update({ status: "generating" })
    .eq("id", projectId)
    .eq("user_id", user.id);

  const startTime = Date.now();

  try {
    // 5. Run the 6-node LangGraph workflow (~90s)
    const brandKit = await runBrandArchitectWorkflow({
      product_idea,
      niche,
      target_audience,
      budget_range,
      competitors,
      usp,
      brand_stage: "new", // Always new brand for simplified form
    });

    const generationTimeMs = Date.now() - startTime;

    // 6. Save brand kit to Supabase
    const { data: savedKit, error: saveError } = await supabase
      .from("brand_kits")
      .upsert({
        project_id:        projectId,
        user_id:           user.id,
        market_analysis:   brandKit.market_analysis  as any,
        positioning:       brandKit.positioning       as any,
        offer:             brandKit.offer             as any,
        copy:              brandKit.copy              as any,
        ad_strategy:       brandKit.ad_strategy       as any,
        launch_plan:       brandKit.launch_plan       as any,
        generation_time_ms: generationTimeMs,
        model_version:     "claude-sonnet-4-20250514",
      })
      .select()
      .single();

    if (saveError) throw saveError;

    // 7. Mark project as complete
    await supabase
      .from("projects")
      .update({ status: "complete" })
      .eq("id", projectId);

    return NextResponse.json({ brandKit: savedKit }, { status: 200 });
  } catch (err) {
    console.error("[Generate API] Error:", err);

    // Mark project as failed
    await supabase
      .from("projects")
      .update({ status: "failed" })
      .eq("id", projectId);

    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 500 }
    );
  }
}
