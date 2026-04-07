import { StateGraph, END, START } from "@langchain/langgraph";
import { ChatAnthropic } from "@langchain/anthropic";
import { z } from "zod";
import {
  BrandKitState,
  MarketAnalysisSchema,
  PositioningSchema,
  OfferSchema,
  CopySchema,
  AdStrategySchema,
  LaunchPlanSchema,
} from "./schemas/nodeSchemas";

// ─── LLM Client ───────────────────────────────────────────
const llm = new ChatAnthropic({
  model: "claude-sonnet-4-20250514",
  temperature: 0.7,
  maxTokens: 4096,
});

// ─── Shared helper: call LLM with structured output + retries ─
async function structuredLLMCall<T>(
  schema: z.ZodSchema<T>,
  systemPrompt: string,
  userPrompt: string,
  retries = 2
): Promise<T> {
  const structuredLLM = llm.withStructuredOutput(schema, {
    name: "output",
    method: "json_mode",
  });

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await structuredLLM.invoke([
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt },
      ]);
      return schema.parse(result);
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`[LangGraph] Retry ${attempt + 1} of ${retries}`);
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); // exponential backoff
    }
  }
  throw new Error("LLM call exhausted all retries");
}

// ═══════════════════════════════════════════════════════════
// NODE 1 — Market Analyst
// ═══════════════════════════════════════════════════════════
async function marketAnalystNode(state: BrandKitState): Promise<Partial<BrandKitState>> {
  console.log("[Node 1/6] Market Analyst running...");

  const result = await structuredLLMCall(
    MarketAnalysisSchema,
    `You are an elite ecommerce market analyst with 15 years of experience at McKinsey and leading DTC brands.
Analyze markets with rigorous, data-backed depth. Be specific with numbers and percentages.
Return ONLY valid JSON matching the schema. No markdown, no preamble.`,
    `Perform a comprehensive market analysis for:

Product Idea: ${state.product_idea}
Niche: ${state.niche}
Target Audience: ${state.target_audience}
Budget Range: ${state.budget_range ?? "Not specified"}
Competitors: ${state.competitors?.join(", ") ?? "Not specified — identify top 3 yourself"}
Unique Selling Point: ${state.usp ?? "Not specified — identify it from the product idea"}

Identify real competitor weaknesses and actionable market gaps.
Score market readiness honestly from 1-10.`
  );

  return { market_analysis: result, current_node: "positioning_expert" };
}

// ═══════════════════════════════════════════════════════════
// NODE 2 — Positioning Expert
// ═══════════════════════════════════════════════════════════
async function positioningExpertNode(state: BrandKitState): Promise<Partial<BrandKitState>> {
  console.log("[Node 2/6] Positioning Expert running...");

  const result = await structuredLLMCall(
    PositioningSchema,
    `You are a world-class brand strategist who has built 7-figure DTC brands.
You understand brand psychology, color theory, and Jungian archetypes at a deep level.
Return ONLY valid JSON matching the schema. No markdown, no preamble.`,
    `Based on this market analysis, develop a complete brand positioning strategy:

PRODUCT: ${state.product_idea}
NICHE: ${state.niche}
TARGET AUDIENCE: ${state.target_audience}

MARKET ANALYSIS:
${JSON.stringify(state.market_analysis, null, 2)}

Be bold and distinctive with brand name suggestions.
Include specific hex codes in the color palette with deep psychological rationale.
The differentiation strategy must exploit a real gap found in the market analysis.`
  );

  return { positioning: result, current_node: "offer_architect" };
}

// ═══════════════════════════════════════════════════════════
// NODE 3 — Offer Architect
// ═══════════════════════════════════════════════════════════
async function offerArchitectNode(state: BrandKitState): Promise<Partial<BrandKitState>> {
  console.log("[Node 3/6] Offer Architect running...");

  const result = await structuredLLMCall(
    OfferSchema,
    `You are a conversion optimization expert trained in Alex Hormozi's $100M Offers methodology.
You build irresistible offer stacks that maximize LTV and AOV.
Return ONLY valid JSON matching the schema. No markdown, no preamble.`,
    `Design an irresistible offer architecture for:

BRAND: ${state.positioning?.brand_name_suggestions[0]}
PRODUCT: ${state.product_idea}
NICHE: ${state.niche}

TARGET PERSONA:
${JSON.stringify(state.market_analysis?.target_persona, null, 2)}

POSITIONING:
Value Proposition: ${state.positioning?.value_proposition}
Differentiation: ${state.positioning?.differentiation_strategy}

Use Hormozi's value equation. Price points must be psychologically anchored.
The guarantee must eliminate ALL perceived risk of purchase.`
  );

  return { offer: result, current_node: "copywriter" };
}

// ═══════════════════════════════════════════════════════════
// NODE 4 — Copywriter
// ═══════════════════════════════════════════════════════════
async function copywriterNode(state: BrandKitState): Promise<Partial<BrandKitState>> {
  console.log("[Node 4/6] Copywriter running...");

  const result = await structuredLLMCall(
    CopySchema,
    `You are a direct-response copywriter who has written $50M+ in sales copy.
You understand AIDA, PAS, and StoryBrand frameworks. Every word earns its place.
Return ONLY valid JSON matching the schema. No markdown, no preamble.`,
    `Write high-converting copy for:

BRAND: ${state.positioning?.brand_name_suggestions[0]}
TAGLINE: ${state.positioning?.tagline_options?.[0]}
VALUE PROP: ${state.positioning?.value_proposition}
TONE: ${state.positioning?.tone_of_voice?.join(", ")}
CORE OFFER: ${state.offer?.core_product?.name} — ${state.offer?.core_product?.description}

PAIN POINTS TO ADDRESS: ${state.market_analysis?.pain_points?.join(", ")}
OBJECTIONS TO OVERCOME: ${state.market_analysis?.target_persona?.objections?.join(", ")}

The hero headline must stop scrolling cold. The welcome email must tell a story.
Email subjects must have >40% open rate potential.`
  );

  return { copy: result, current_node: "ad_strategist" };
}

// ═══════════════════════════════════════════════════════════
// NODE 5 — Ad Strategist
// ═══════════════════════════════════════════════════════════
async function adStrategistNode(state: BrandKitState): Promise<Partial<BrandKitState>> {
  console.log("[Node 5/6] Ad Strategist running...");

  const result = await structuredLLMCall(
    AdStrategySchema,
    `You are a performance marketing expert who has managed $20M+ in ad spend across Meta, Google, and TikTok.
You build channel mixes that make sense for the budget and audience.
Return ONLY valid JSON matching the schema. No markdown, no preamble.`,
    `Develop a complete paid + organic acquisition strategy for:

BRAND: ${state.positioning?.brand_name_suggestions[0]}
NICHE: ${state.niche}
MONTHLY BUDGET: ${state.budget_range ?? "Bootstrap (<$5k/month)"}

TARGET PERSONA: ${JSON.stringify(state.market_analysis?.target_persona, null, 2)}
COMPETITOR WEAKNESSES: ${JSON.stringify(state.market_analysis?.competitor_landscape, null, 2)}
COPY HOOKS AVAILABLE: "${state.copy?.hero_headline}" | "${state.copy?.above_fold_cta}"

Meta ad creatives must use proven hook formulas (Pattern Interrupt, Problem-Agitate-Solve, Social Proof).
Google keywords: mix commercial intent with long-tail.
Content strategy: specify exact content types, not vague advice.`
  );

  return { ad_strategy: result, current_node: "launch_planner" };
}

// ═══════════════════════════════════════════════════════════
// NODE 6 — Launch Planner
// ═══════════════════════════════════════════════════════════
async function launchPlannerNode(state: BrandKitState): Promise<Partial<BrandKitState>> {
  console.log("[Node 6/6] Launch Planner running...");

  const result = await structuredLLMCall(
    LaunchPlanSchema,
    `You are a launch strategist who has orchestrated 7-figure product launches.
You understand launch sequencing, urgency, and community building.
Return ONLY valid JSON matching the schema. No markdown, no preamble.`,
    `Create a 90-day launch plan for:

BRAND: ${state.positioning?.brand_name_suggestions[0]}
PRODUCT: ${state.product_idea}
CORE OFFER: ${JSON.stringify(state.offer?.core_product, null, 2)}
AD CHANNELS: ${state.ad_strategy?.recommended_channels?.map(c => c.channel).join(", ")}

Revenue projections must be conservative but realistic for a new brand.
The pre-launch phase must include validation checkpoints (not just tasks).
KPIs must include both leading indicators (CTR, open rate) and lagging (revenue, LTV).
Day-by-day launch week plan must have specific, actionable tasks — not generic advice.`
  );

  return { launch_plan: result, current_node: "complete" };
}

// ═══════════════════════════════════════════════════════════
// GRAPH ASSEMBLY
// ═══════════════════════════════════════════════════════════
const workflow = new StateGraph<BrandKitState>({
  channels: {
    product_idea:    { reducer: (_: any, b: any) => b },
    niche:           { reducer: (_: any, b: any) => b },
    target_audience: { reducer: (_: any, b: any) => b },
    budget_range:    { reducer: (_: any, b: any) => b },
    competitors:     { reducer: (_: any, b: any) => b },
    usp:             { reducer: (_: any, b: any) => b },
    market_analysis: { reducer: (_: any, b: any) => b },
    positioning:     { reducer: (_: any, b: any) => b },
    offer:           { reducer: (_: any, b: any) => b },
    copy:            { reducer: (_: any, b: any) => b },
    ad_strategy:     { reducer: (_: any, b: any) => b },
    launch_plan:     { reducer: (_: any, b: any) => b },
    current_node:    { reducer: (_: any, b: any) => b },
    errors:          { reducer: (a: string[], b: string[]) => [...(a ?? []), ...(b ?? [])] },
  },
})
  .addNode("market_analyst",     marketAnalystNode)
  .addNode("positioning_expert", positioningExpertNode)
  .addNode("offer_architect",    offerArchitectNode)
  .addNode("copywriter",         copywriterNode)
  .addNode("ad_strategist",      adStrategistNode)
  .addNode("launch_planner",     launchPlannerNode)
  .addEdge(START,                "market_analyst")
  .addEdge("market_analyst",     "positioning_expert")
  .addEdge("positioning_expert", "offer_architect")
  .addEdge("offer_architect",    "copywriter")
  .addEdge("copywriter",         "ad_strategist")
  .addEdge("ad_strategist",      "launch_planner")
  .addEdge("launch_planner",     END);

export const brandArchitectGraph = workflow.compile();

// ─── Public API ───────────────────────────────────────────
export async function runBrandArchitectWorkflow(
  input: Pick<BrandKitState,
    "product_idea" | "niche" | "target_audience" |
    "budget_range" | "competitors" | "usp">
): Promise<BrandKitState> {
  const initialState: BrandKitState = {
    ...input,
    current_node: "market_analyst",
    errors: [],
  };

  console.log("[LangGraph] Starting brand architect workflow...");
  const finalState = await brandArchitectGraph.invoke(initialState);
  console.log("[LangGraph] Workflow complete.");

  return finalState as BrandKitState;
}
