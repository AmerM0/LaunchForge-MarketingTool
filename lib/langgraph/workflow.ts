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

const llm = new ChatAnthropic({
  model: "claude-sonnet-4-20250514",
  temperature: 0.6,
  maxTokens: 16000,
});

async function structuredLLMCall<T>(
  schema: z.ZodSchema<T>,
  systemPrompt: string,
  userPrompt: string,
  retries = 2
): Promise<T> {
  const structuredLLM = llm.withStructuredOutput(schema, {
    name: "output",
    method: "functionCalling",  // "json_mode" is not a valid @langchain/anthropic option
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
      console.warn(`[LangGraph] Retry ${attempt + 1}/${retries}`);
      await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
  throw new Error("LLM call exhausted retries");
}

// ═══════════════════════════════════════════════════════════
// NODE 1 — Market Intelligence Analyst
// ═══════════════════════════════════════════════════════════
async function marketAnalystNode(state: BrandKitState): Promise<Partial<BrandKitState>> {
  console.log("[Node 1/6] Market Intelligence Analyst...");

  const brandContext = state.brand_stage === "established"
    ? `IMPORTANT — THIS IS AN ESTABLISHED BRAND:
       Current Monthly Revenue: ${state.current_monthly_revenue ?? "Not provided"}
       Current Ad Spend: ${state.current_ad_spend ?? "Not provided"}
       Main Problem They're Facing: ${state.main_problem ?? "Not specified"}
       Your analysis must diagnose WHY they are struggling and what the market shift is.`
    : `IMPORTANT — THIS IS A NEW BRAND: Focus on opportunity sizing and validation signals.`;

  const result = await structuredLLMCall(
    MarketAnalysisSchema,
    `You are a senior market intelligence analyst who has built research decks for category-defining DTC brands like AG1, Gymshark, and Liquid Death, and consulted for Fortune 500 strategy teams.

Your analysis is data-informed, specific, and actionable. You never give generic answers.

STANDARDS YOU MUST MEET:
- Market sizing uses bottoms-up reasoning (search volume × conversion estimates), not vague statements
- Competitor analysis includes real brand weaknesses found in their Trustpilot/Reddit/Amazon reviews
- Pain points include the EXACT emotional language customers use ("I'm so frustrated that..." — real forum language)
- Every trend has a specific implication and time horizon
- Persona includes exactly where they spend time online and what content they consume
- Market readiness score includes honest reasoning, not cheerleading

Return ONLY valid JSON. No markdown. No preamble.`,
    `Conduct a comprehensive market intelligence analysis:

PRODUCT/SERVICE: ${state.product_idea}
NICHE: ${state.niche}
TARGET AUDIENCE: ${state.target_audience}
BUSINESS MODEL: ${state.business_model ?? "ecommerce or service — infer from context"}
GEOGRAPHIC MARKET: ${state.geographic_market ?? "English-speaking markets (US, UK, AU, CA)"}
MONTHLY AD BUDGET: ${state.budget_range ?? "Unknown — assume bootstrap <$3k/month"}
KNOWN COMPETITORS: ${state.competitors?.join(", ") ?? "Not specified — identify the top 3-5 yourself"}
UNIQUE ANGLE: ${state.usp ?? "Not specified — identify the best angle from the product description"}

${brandContext}

Deliver insights a $500/hr consultant would be proud of. Be specific, be direct, name real brands, quote real customer language.`
  );

  return { market_analysis: result, current_node: "positioning_expert" };
}

// ═══════════════════════════════════════════════════════════
// NODE 2 — Brand Positioning Strategist
// ═══════════════════════════════════════════════════════════
async function positioningExpertNode(state: BrandKitState): Promise<Partial<BrandKitState>> {
  console.log("[Node 2/6] Brand Positioning Strategist...");

  const repositioningContext = state.brand_stage === "established"
    ? `REPOSITIONING CONTEXT: This brand already exists and is struggling. 
       Your positioning work must diagnose what's broken about their current positioning 
       and prescribe a specific pivot — not a rebrand, a repositioning.
       The competitor counter-positioning section is especially critical.`
    : `NEW BRAND CONTEXT: This brand is starting from scratch. 
       Own a category niche they can dominate — not a crowded generic position.`;

  const result = await structuredLLMCall(
    PositioningSchema,
    `You are a brand strategist who has positioned brands that went on to 8-figure exits. 
You've studied under April Dunford (Obviously Awesome), worked with StrawberryFrog, and advised DTC brands at Series A.

Your positioning work is strategic and commercially sharp — not branding fluff.

WHAT GREAT POSITIONING LOOKS LIKE:
- A category you can OWN, not just participate in (e.g. "the anti-bank", "the first X for Y")
- Counter-positioning that makes switching from a competitor feel obvious
- A brand voice that's distinct enough to be recognisable without a logo
- Colors chosen for market differentiation AND psychological impact — not aesthetics alone
- Taglines that can run on a billboard AND a Facebook ad
- The differentiation strategy names a specific competitor and explains why you win

Return ONLY valid JSON. No markdown. No preamble.`,
    `Develop complete brand positioning strategy:

PRODUCT/SERVICE: ${state.product_idea}
NICHE: ${state.niche}
TARGET AUDIENCE: ${state.target_audience}

MARKET INTELLIGENCE:
- Market Sizing: ${JSON.stringify(state.market_analysis?.market_sizing)}
- Key Pain Points: ${JSON.stringify(state.market_analysis?.pain_points?.slice(0,4))}
- Competitor Landscape: ${JSON.stringify(state.market_analysis?.competitor_landscape)}
- Primary Persona: ${JSON.stringify(state.market_analysis?.target_personas?.[0])}
- White Space Indicators: ${JSON.stringify(state.market_analysis?.key_trends?.slice(0,3))}

${repositioningContext}

Be bold. Name the category. Own the niche. Give the brand a distinct identity that makes it unmistakeable.`
  );

  return { positioning: result, current_node: "offer_architect" };
}

// ═══════════════════════════════════════════════════════════
// NODE 3 — Offer & Revenue Architect
// ═══════════════════════════════════════════════════════════
async function offerArchitectNode(state: BrandKitState): Promise<Partial<BrandKitState>> {
  console.log("[Node 3/6] Offer & Revenue Architect...");

  const result = await structuredLLMCall(
    OfferSchema,
    `You are a revenue architect trained directly under Alex Hormozi's $100M Offers and $100M Leads methodologies, 
with additional expertise in pricing psychology (Robert Cialdini, Rafi Mohammed) and subscription economics.

You have designed offer stacks for 50+ 7-figure businesses across ecommerce and service models.

YOUR OFFER ARCHITECTURE PRINCIPLES:
1. The core offer must have an irresistible one-liner with a specific, measurable outcome
2. The value stack makes the price feel like a steal — calculate the real ratio
3. The guarantee removes ALL psychological risk — it must be specific, not generic ("30-day money back" is weak)
4. Upsells have realistic take rates — don't inflate. 10-30% is realistic for most
5. Pricing tiers create anchoring — the middle tier should be bought 60%+ of the time by design
6. LTV and payback period reasoning is essential for knowing how much to spend on ads
7. For established brands: diagnose why the current offer isn't converting and fix it

Return ONLY valid JSON. No markdown. No preamble.`,
    `Design a complete offer and revenue architecture:

BRAND: ${state.positioning?.brand_name_suggestions?.[0]?.name ?? "The Brand"}
PRODUCT/SERVICE: ${state.product_idea}
NICHE: ${state.niche}
BUSINESS MODEL: ${state.business_model ?? "infer from product"}

TARGET PERSONA (primary):
${JSON.stringify(state.market_analysis?.target_personas?.[0])}

POSITIONING:
Value Proposition: ${state.positioning?.value_proposition}
Differentiation: ${state.positioning?.differentiation_strategy}
Brand Archetype: ${state.positioning?.brand_archetype?.primary}

TOP CUSTOMER OBJECTIONS: ${state.market_analysis?.target_personas?.[0]?.objections?.join(", ")}
THEIR DREAM OUTCOME: ${state.market_analysis?.target_personas?.[0]?.dream_outcome}

OFFER DIAGNOSIS FOR ESTABLISHED BRAND: ${state.brand_stage === "established" ? state.main_problem ?? "struggling with conversions" : "N/A — new brand"}

Build an offer so good it feels wrong to say no. Every element must serve a commercial purpose.`
  );

  return { offer: result, current_node: "copywriter" };
}

// ═══════════════════════════════════════════════════════════
// NODE 4 — Direct Response Copywriter
// ═══════════════════════════════════════════════════════════
async function copywriterNode(state: BrandKitState): Promise<Partial<BrandKitState>> {
  console.log("[Node 4/6] Direct Response Copywriter...");

  const result = await structuredLLMCall(
    CopySchema,
    `You are a direct-response copywriter with $100M+ in attributable sales across ecommerce, SaaS, and info products.
You've studied Gary Halbert, David Ogilvy, Eugene Schwartz, and worked at leading performance agencies.

YOUR COPY STANDARDS:
- Headlines pass the "stop the scroll" test — they trigger emotion or curiosity in 2 seconds
- Email subjects hit a specific psychological trigger (curiosity gap, fear, desire, social proof)
- Welcome email sequences build know/like/trust across 5 emails — not just product pushes
- UGC scripts sound like a real person speaking, not a brand — first person, casual, specific
- Ad hooks are written for the first 3 seconds of video — they interrupt the pattern
- Every piece of copy speaks to ONE person having ONE problem — not everyone
- The big idea is a specific mechanism or insight, not a generic promise
- Abandoned cart emails have escalating urgency — not three versions of "you forgot something"
- For established brands: the copy must address why current customers aren't buying and what needs to change

Return ONLY valid JSON. No markdown. No preamble.`,
    `Write a complete copy system for:

BRAND: ${state.positioning?.brand_name_suggestions?.[0]?.name ?? "The Brand"}
TONE OF VOICE: ${state.positioning?.tone_of_voice?.join(", ")}
TONE EXAMPLES — DO SAY: ${state.positioning?.tone_examples?.do_say?.join(" | ")}
TONE EXAMPLES — DON'T SAY: ${state.positioning?.tone_examples?.dont_say?.join(" | ")}

OFFER:
Core Product: ${state.offer?.core_product?.name} — ${state.offer?.core_product?.one_liner}
Price: ${state.offer?.core_product?.price_point}
Guarantee: ${state.offer?.guarantee?.exact_wording}
Total Stack Value: ${state.offer?.value_stack?.total_stack_value}

PRIMARY PERSONA:
Dream Outcome: ${state.market_analysis?.target_personas?.[0]?.dream_outcome}
Daily Frustrations: ${state.market_analysis?.target_personas?.[0]?.daily_frustrations?.join(", ")}
Objections: ${state.market_analysis?.target_personas?.[0]?.objections?.join(", ")}
Emotional Language They Use: ${state.market_analysis?.pain_points?.map(p => p.emotional_language).join(" | ")}

Write copy that makes this persona feel completely understood and makes buying feel like the obvious next step.`
  );

  return { copy: result, current_node: "ad_strategist" };
}

// ═══════════════════════════════════════════════════════════
// NODE 5 — Performance Media Buyer & Ad Strategist
// ═══════════════════════════════════════════════════════════
async function adStrategistNode(state: BrandKitState): Promise<Partial<BrandKitState>> {
  console.log("[Node 5/6] Performance Media Buyer & Ad Strategist...");

  const monthlyBudget = state.budget_range ?? "$1,000–$3,000/month";
  const brandPhase = state.brand_stage === "established"
    ? `ESTABLISHED BRAND IN TROUBLE:
       Current Revenue: ${state.current_monthly_revenue ?? "unknown"}
       Current Ad Spend: ${state.current_ad_spend ?? "unknown"}
       Problem: ${state.main_problem ?? "underperforming ads"}
       
       Your strategy must diagnose what went wrong and provide a reset playbook:
       - Audit what to turn off immediately
       - Define the testing reset protocol  
       - Build back to profitability phase by phase`
    : `NEW BRAND — NO HISTORY:
       Start with a tight testing phase before scaling.
       Budget conservation is critical. Kill losers fast, scale winners slowly.`;

  const result = await structuredLLMCall(
    AdStrategySchema,
    `You are a senior performance media buyer and growth strategist with 8 years managing $30M+ in paid media.
You've worked at leading DTC agencies and in-house at 7-figure ecommerce brands.
You are expert in Meta Ads (including post-iOS14 measurement), Google Ads (Search, Shopping, PMax), TikTok, and email/SMS automations.

YOU GIVE REAL MEDIA BUYING ADVICE — NOT GENERALITIES:
- Specific adset structures with actual daily budgets, not ranges
- Testing methodologies with clear kill criteria (not "monitor performance")
- Exact audience types, lookalike percentages, and interest stacks
- CBO vs ABO reasoning based on the current phase
- Real CPM/CPC benchmarks for the specific niche
- Scaling rules with specific thresholds (e.g. "increase budget 20% every 72h when ROAS >2.5")
- Retargeting windows and audience exclusions
- Creative fatigue management with frequency caps and rotation schedules

CURRENT MEDIA LANDSCAPE CONTEXT (2025):
- Meta: Broad audience + strong creative is outperforming over-targeted campaigns
- Advantage+ Shopping Campaigns (ASC) now primary vehicle for most ecom brands
- Creative is the targeting — hook quality determines CPM
- TikTok Shop is a major acquisition channel for under-35 demographics
- Email/SMS automation typically drives 20-35% of ecom revenue
- Google PMax needs strong audience signals to work — feed quality is everything
- First-party data and email list quality matters more than ever post-iOS

Return ONLY valid JSON. No markdown. No preamble.`,
    `Build a complete performance marketing strategy for a media buyer to execute:

BRAND: ${state.positioning?.brand_name_suggestions?.[0]?.name ?? "The Brand"}
NICHE: ${state.niche}
PRODUCT: ${state.product_idea}
MONTHLY AD BUDGET: ${monthlyBudget}
GEOGRAPHIC TARGET: ${state.geographic_market ?? "US + UK primary"}

UNIT ECONOMICS:
Product Price: ${state.offer?.core_product?.price_point}
Estimated LTV: ${state.offer?.core_product?.ltv_estimate}
Target CAC: ${state.offer?.core_product?.payback_period}
Gross Margin: ${state.offer?.core_product?.gross_margin_pct}

PRIMARY PERSONA:
${JSON.stringify(state.market_analysis?.target_personas?.[0])}
Where They Spend Time Online: ${state.market_analysis?.target_personas?.[0]?.where_they_spend_time?.join(", ")}

AVAILABLE CREATIVE ANGLES (from copywriter):
Hooks: ${state.copy?.ad_copy_bank?.short_hooks?.slice(0, 5).join(" | ")}
UGC Scripts Available: ${state.copy?.ad_copy_bank?.ugc_scripts?.length ?? 0}

${brandPhase}

Be specific enough that a media buyer can execute this on Monday morning without asking a single clarifying question.`
  );

  return { ad_strategy: result, current_node: "launch_planner" };
}

// ═══════════════════════════════════════════════════════════
// NODE 6 — Growth & Launch Strategist
// ═══════════════════════════════════════════════════════════
async function launchPlannerNode(state: BrandKitState): Promise<Partial<BrandKitState>> {
  console.log("[Node 6/6] Growth & Launch Strategist...");

  const result = await structuredLLMCall(
    LaunchPlanSchema,
    `You are a growth strategist and launch expert who has taken 15+ brands from zero to 6 figures, 
and helped 8 established brands recover from declining revenue.

You build plans that are EXECUTABLE — not aspirational. Every task has an owner, a tool, and a time estimate.
You understand cash flow constraints, realistic conversion rates, and the psychological pressure of a launch.

YOUR PLAN STANDARDS:
- Pre-launch validation gates prevent wasted ad spend — pass/fail criteria are specific
- Tech stack checklist is prioritised by what actually matters at each stage
- Day-by-day launch plan accounts for what to do when things go wrong (contingency for every day)
- KPIs have a clear "action if below target" — not just a number to watch
- Financial model has 3 scenarios (conservative/base/optimistic) with honest assumptions
- The contingency playbook is the most important section — have a plan for every failure mode
- For established brands: the plan rebuilds trust before scaling spend

Return ONLY valid JSON. No markdown. No preamble.`,
    `Build a complete 90-day growth and execution plan:

BRAND: ${state.positioning?.brand_name_suggestions?.[0]?.name ?? "The Brand"}
PRODUCT: ${state.product_idea}
BRAND STAGE: ${state.brand_stage ?? "new brand"}

OFFER:
Core Product: ${state.offer?.core_product?.name} at ${state.offer?.core_product?.price_point}
Revenue Model: ${state.offer?.revenue_model?.model_type}
Monthly Recurring Potential: ${state.offer?.revenue_model?.monthly_recurring_potential}

AD CHANNELS PRIORITISED:
Primary: ${state.ad_strategy?.strategy_overview?.recommended_primary_channel}
Monthly Budget: ${state.budget_range ?? "unknown — assume $1-3k/month"}
Break-even ROAS: ${state.ad_strategy?.strategy_overview?.break_even_roas}
Target CAC: ${state.ad_strategy?.strategy_overview?.target_cac}

EMAIL AUTOMATION FLOWS PLANNED: ${state.ad_strategy?.email_and_sms?.automation_flows?.map(f => f.flow_name).join(", ")}

ESTABLISHED BRAND CONTEXT: ${state.brand_stage === "established"
  ? `Revenue: ${state.current_monthly_revenue}, Problem: ${state.main_problem}`
  : "New brand — focus on validation and first revenue"}

Build a plan a solo founder or small team can actually execute. Account for the reality that things will go wrong.`
  );

  return { launch_plan: result, current_node: "complete" };
}

// ═══════════════════════════════════════════════════════════
// GRAPH ASSEMBLY
// ═══════════════════════════════════════════════════════════
const workflow = new StateGraph<BrandKitState>({
  channels: {
    product_idea:             { reducer: (_: any, b: any) => b },
    niche:                    { reducer: (_: any, b: any) => b },
    target_audience:          { reducer: (_: any, b: any) => b },
    budget_range:             { reducer: (_: any, b: any) => b },
    competitors:              { reducer: (_: any, b: any) => b },
    usp:                      { reducer: (_: any, b: any) => b },
    brand_stage:              { reducer: (_: any, b: any) => b },
    current_monthly_revenue:  { reducer: (_: any, b: any) => b },
    current_ad_spend:         { reducer: (_: any, b: any) => b },
    main_problem:             { reducer: (_: any, b: any) => b },
    business_model:           { reducer: (_: any, b: any) => b },
    geographic_market:        { reducer: (_: any, b: any) => b },
    market_analysis:          { reducer: (_: any, b: any) => b },
    positioning:              { reducer: (_: any, b: any) => b },
    offer:                    { reducer: (_: any, b: any) => b },
    copy:                     { reducer: (_: any, b: any) => b },
    ad_strategy:              { reducer: (_: any, b: any) => b },
    launch_plan:              { reducer: (_: any, b: any) => b },
    current_node:             { reducer: (_: any, b: any) => b },
    errors:                   { reducer: (a: string[], b: string[]) => [...(a ?? []), ...(b ?? [])] },
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

export async function runBrandArchitectWorkflow(
  input: Pick<BrandKitState,
    "product_idea" | "niche" | "target_audience" |
    "budget_range" | "competitors" | "usp" |
    "brand_stage" | "current_monthly_revenue" |
    "current_ad_spend" | "main_problem" |
    "business_model" | "geographic_market">
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
