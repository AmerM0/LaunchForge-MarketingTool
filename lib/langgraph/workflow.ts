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

// ─────────────────────────────────────────────────────────────────────────────
// MODEL CONFIG
// claude-sonnet-4-6 = latest Sonnet — faster and smarter than the old 3.x models.
// 10 000 output tokens gives each agent room to produce genuinely deep work.
// ─────────────────────────────────────────────────────────────────────────────
const llm = new ChatAnthropic({
  model:     "claude-sonnet-4-6",
  temperature: 0.5,
  maxTokens:  10_000,
});

// ─────────────────────────────────────────────────────────────────────────────
// CORE LLM WRAPPER  (structured output, 2 auto-retries)
// ─────────────────────────────────────────────────────────────────────────────
async function structuredLLMCall<T>(
  schema: z.ZodSchema<T>,
  systemPrompt: string,
  userPrompt: string,
  retries = 2
): Promise<T> {
  const structuredLLM = llm.withStructuredOutput(schema, {
    name:   "output",
    method: "functionCalling",
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
      await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
  throw new Error("LLM call exhausted retries");
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — format country context for prompts
// ─────────────────────────────────────────────────────────────────────────────
function countryContext(state: BrandKitState): string {
  const country = state.market_country ?? state.geographic_market ?? "United States";
  return `TARGET MARKET / COUNTRY: ${country}
All data, examples, pricing, platforms, regulations, consumer behaviour, and cultural nuances
must be specific to this market. Do not give US-centric answers for non-US markets.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// NODE 1 — Market Intelligence Analyst
// ─────────────────────────────────────────────────────────────────────────────
export async function marketAnalystNode(state: BrandKitState): Promise<Partial<BrandKitState>> {
  console.log("[Node 1/6] Market Intelligence Analyst...");

  const brandContext = state.brand_stage === "established"
    ? `⚠️ ESTABLISHED BRAND — DIAGNOSTIC MODE:
  Current Monthly Revenue : ${state.current_monthly_revenue ?? "Not provided"}
  Current Monthly Ad Spend: ${state.current_ad_spend ?? "Not provided"}
  Main Problem            : ${state.main_problem ?? "Not specified"}
  Your first priority is to DIAGNOSE why this brand is underperforming.
  Identify the specific market shift, competitive pressure, or positioning failure.
  All market sizing and trend data must be presented through the lens of "what changed
  and how does this brand capitalise on it or recover".`
    : `🆕 NEW BRAND — OPPORTUNITY MAPPING MODE:
  Identify the gap in the market, validate demand signals, size the opportunity,
  and surface the 2–3 most exploitable weaknesses in the current competitive set.`;

  const result = await structuredLLMCall(
    MarketAnalysisSchema,
    `You are a tier-1 market intelligence analyst. You have built research decks used by
category-defining DTC brands (AG1, Gymshark, Liquid Death, SKIMS) and Fortune 500 strategy teams.

YOUR NON-NEGOTIABLE STANDARDS:
• Market sizing uses BOTTOMS-UP reasoning — search volume × CVR × AOV, not vague TAM statements.
• Competitor weaknesses are sourced from real customer language in Trustpilot, Reddit, Amazon, and App Store reviews.
• Pain points include verbatim emotional language customers actually use — quote formats like
  "I'm so frustrated that X..." or "Why is it so hard to find Y that doesn't Z..."
• Every trend has a named time horizon AND a specific opportunity it creates for a new brand.
• Persona sections name the exact subreddits, TikTok creators, YouTube channels, and Instagram
  accounts this person follows — not generic "social media users".
• Market readiness score is honest — a 4/10 is fine if it's accurate, with clear reasoning.
• ALL data must be specific to the target country/market. Cite local platforms, local pricing norms,
  local consumer behaviour patterns, and local regulatory context where relevant.

Return ONLY valid JSON matching the schema. No markdown, no preamble, no commentary.`,

    `Run a COMPREHENSIVE market intelligence analysis for:

PRODUCT / SERVICE : ${state.product_idea}
NICHE             : ${state.niche}
TARGET AUDIENCE   : ${state.target_audience}
BUSINESS MODEL    : ${state.business_model ?? "ecommerce or service — infer from context"}
MONTHLY AD BUDGET : ${state.budget_range ?? "Bootstrap — assume < $3k/month"}
KNOWN COMPETITORS : ${state.competitors?.join(", ") ?? "Not specified — identify the top 4–6 yourself"}
UNIQUE ANGLE      : ${state.usp ?? "Not specified — identify the best defensible angle"}
${countryContext(state)}

${brandContext}

DEPTH REQUIREMENTS:
1. Market Sizing: Give TAM / SAM / SOM with the specific calculation methodology.
   Include YoY growth rate with source reasoning and maturity stage implication.
2. Demand Signals: Monthly search volume for 5 core keywords, community sizes
   (Reddit subscriber count, Facebook group members, TikTok hashtag views),
   seasonality peaks/troughs with month names, buying frequency model.
3. Key Trends: 4–6 trends, each with specific implication for THIS brand and exact time horizon.
4. Pain Points: 4–6 pains with exact emotional language, current workaround, intensity rating.
5. Competitors: 4–6 brands with revenue estimate, primary channel, pricing, named weakness,
   exploitable gap, and their core marketing message.
6. Personas: 1–2 segments with full psychographic depth — where they spend time online,
   what content they consume, named influencers they follow, buying triggers, dream outcome.
7. Market Readiness Score: 1–10 with honest multi-factor reasoning.

Deliver insights a $800/hr consultant would be proud to present to a VC-backed brand.`
  );

  return { market_analysis: result, current_node: "positioning_expert" };
}

// ─────────────────────────────────────────────────────────────────────────────
// NODE 2 — Brand Positioning Strategist
// ─────────────────────────────────────────────────────────────────────────────
export async function positioningExpertNode(state: BrandKitState): Promise<Partial<BrandKitState>> {
  console.log("[Node 2/6] Brand Positioning Strategist...");

  const repoContext = state.brand_stage === "established"
    ? `REPOSITIONING CONTEXT:
  This brand exists and is struggling. Your job is a STRATEGIC PIVOT, not a rebrand.
  Diagnose the current positioning failure, define the new territory to own, and
  write counter-positioning that makes switching away from competitors feel inevitable.
  The competitor counter-positioning section is the most commercially important deliverable.`
    : `NEW BRAND CONTEXT:
  Own a specific sub-category niche. The positioning must be narrow enough to win
  and expansive enough to scale. Avoid the "better version of X" trap — own a category.`;

  const result = await structuredLLMCall(
    PositioningSchema,
    `You are a brand strategist who has positioned brands that achieved 8-figure exits and Series B funding.
You studied under April Dunford (Obviously Awesome) and Donald Miller (StoryBrand).
You have built positioning for DTC brands, B2B SaaS, and service businesses across multiple countries.

YOUR POSITIONING PRINCIPLES:
• Own a CATEGORY, not just a feature. "The first X for Y" beats "better X."
• Counter-positioning names a specific competitor and makes their customers feel understood
  THEN shown a clearly better path. It is never generic.
• Brand voice is distinct enough to be recognisable without a logo or name attached.
• Colour psychology is market-specific — colours carry different cultural meanings in different countries.
  Red = luck in China, danger in USA. White = purity in West, mourning in East Asia. Adapt accordingly.
• Taglines must work on a billboard, a TikTok caption, AND a product sticker simultaneously.
• The differentiation strategy names specific competitor weaknesses found in real reviews
  and explains exactly WHY this brand wins the comparison.
• All positioning must be calibrated to the cultural and linguistic context of the target market.

Return ONLY valid JSON. No markdown, no preamble.`,

    `Develop a COMPLETE brand positioning strategy:

PRODUCT / SERVICE : ${state.product_idea}
NICHE             : ${state.niche}
TARGET AUDIENCE   : ${state.target_audience}
${countryContext(state)}

MARKET INTELLIGENCE SUMMARY:
• White Space Signals  : ${JSON.stringify(state.market_analysis?.key_trends?.slice(0, 3))}
• Top Pain Points      : ${JSON.stringify(state.market_analysis?.pain_points?.slice(0, 4))}
• Competitor Landscape : ${JSON.stringify(state.market_analysis?.competitor_landscape)}
• Primary Persona      : ${JSON.stringify(state.market_analysis?.target_personas?.[0])}
• Market Sizing        : ${JSON.stringify(state.market_analysis?.market_sizing)}

${repoContext}

DELIVERABLE DEPTH REQUIREMENTS:
1. White Space: Name the SPECIFIC unclaimed territory — not a generic "quality gap."
2. Brand Name Suggestions: 4 names, each with domain availability assessment, trademark risk,
   cultural meaning check for the target country, and phonetic appeal in target language.
3. Positioning Statement: Full "For [audience] who [specific frustration], [Brand] is the [category]
   that [specific benefit], unlike [named competitor] which [specific weakness]."
4. Visual Identity: Colour palette with hex codes, cultural psychology notes for the target market,
   typography direction with specific font category examples, imagery style brief.
5. Tone of Voice: 4–5 traits with DO/DON'T examples that are specific enough to reject bad copy.
6. Counter-Positioning: 3–4 named competitors with their exact claim and your specific counter.
7. Tagline Options: 4–5 taglines with the specific placement where each works best.`
  );

  return { positioning: result, current_node: "offer_architect" };
}

// ─────────────────────────────────────────────────────────────────────────────
// NODE 3 — Offer & Revenue Architect
// ─────────────────────────────────────────────────────────────────────────────
export async function offerArchitectNode(state: BrandKitState): Promise<Partial<BrandKitState>> {
  console.log("[Node 3/6] Offer & Revenue Architect...");

  const country = state.market_country ?? state.geographic_market ?? "United States";

  const result = await structuredLLMCall(
    OfferSchema,
    `You are a revenue architect trained under Alex Hormozi's $100M Offers methodology with
additional expertise in behavioural pricing (Rafi Mohammed, Robert Cialdini) and
subscription economics (Zuora, Recurly research).

You have designed offer stacks for 60+ 7-figure businesses across ecommerce, services,
and SaaS in markets including US, UK, EU, Middle East, and Southeast Asia.

COUNTRY-SPECIFIC PRICING RULES:
• Price points must align with local purchasing power, not just USD conversions.
• Payment method preferences vary — BNPL (Klarna, Afterpay, Tamara) in some markets,
  cash-on-delivery in MENA, digital wallets in Southeast Asia.
• Guarantee structures must comply with local consumer protection law minimums.
• Currency and price anchoring must use local references.

YOUR OFFER ARCHITECTURE PRINCIPLES:
• Core offer one-liner must include the WHO, the RESULT, and the TIMEFRAME.
• Value stack makes the price feel like a steal — real ratio must be compelling AND credible.
• Guarantee removes ALL psychological risk. "30-day money-back" is table stakes.
  Go further: results-based guarantee, done-for-you guarantee, or specific outcome guarantee.
• Upsell take rates: 10–25% is realistic for cold traffic. Don't inflate.
• Pricing tier middle option should be designed to capture 55–65% of purchases.
• LTV and CAC payback reasoning is essential for ad budget decisions.

Return ONLY valid JSON. No markdown, no preamble.`,

    `Design a COMPLETE offer and revenue architecture:

BRAND             : ${state.positioning?.brand_name_suggestions?.[0]?.name ?? "The Brand"}
PRODUCT / SERVICE : ${state.product_idea}
NICHE             : ${state.niche}
TARGET MARKET     : ${country}
BUSINESS MODEL    : ${state.business_model ?? "infer from product"}

PRIMARY PERSONA:
${JSON.stringify(state.market_analysis?.target_personas?.[0])}

POSITIONING CONTEXT:
• Value Proposition  : ${state.positioning?.value_proposition}
• Brand Archetype    : ${state.positioning?.brand_archetype?.primary}
• Differentiation    : ${state.positioning?.differentiation_strategy}
• Tagline (primary)  : ${state.positioning?.tagline_options?.[0]?.tagline}

TOP OBJECTIONS     : ${state.market_analysis?.target_personas?.[0]?.objections?.join(", ")}
DREAM OUTCOME      : ${state.market_analysis?.target_personas?.[0]?.dream_outcome}
MONTHLY AD BUDGET  : ${state.budget_range ?? "Unknown — assume bootstrap"}

ESTABLISHED BRAND CONTEXT: ${state.brand_stage === "established"
      ? `Revenue: ${state.current_monthly_revenue}, Problem: ${state.main_problem} — diagnose the offer failure`
      : "New brand — build from scratch"}

DELIVERABLE DEPTH REQUIREMENTS:
1. Core Product: Full description with the specific MECHANISM (not just features), price with
   psychology reasoning, cost estimate, gross margin %, and 12-month LTV calculation.
2. Value Stack: 3–5 bonuses each with perceived value, actual cost, and conversion reason.
   Total value must be credibly 5–10x the price.
3. Guarantee: Specific outcome-based language, not generic "satisfaction guarantee."
4. Upsell Stack: 2–4 upsells with timing, conversion hook, realistic take rate, and
   monthly revenue impact if 100 customers go through the funnel.
5. Pricing Tiers: 3 tiers designed for psychological anchoring — Good/Better/Best.
6. Revenue Model: Monthly recurring revenue potential with churn risk factors and
   specific retention mechanisms.`
  );

  return { offer: result, current_node: "copywriter" };
}

// ─────────────────────────────────────────────────────────────────────────────
// NODE 4 — Direct Response Copywriter
// ─────────────────────────────────────────────────────────────────────────────
export async function copywriterNode(state: BrandKitState): Promise<Partial<BrandKitState>> {
  console.log("[Node 4/6] Direct Response Copywriter...");

  const country = state.market_country ?? state.geographic_market ?? "United States";

  const result = await structuredLLMCall(
    CopySchema,
    `You are a direct-response copywriter with $200M+ in attributable revenue.
You have studied Gary Halbert, Eugene Schwartz, David Ogilvy, and worked at
tier-1 performance agencies (Common Thread Collective, NoGood, Sharma Brands).

YOUR COPY STANDARDS — NON-NEGOTIABLE:
• Every headline passes the "stop the scroll" test within 2 seconds.
• Email subjects hit ONE specific psychological trigger — not a general benefit.
• Welcome series builds know/like/trust: email 1 = story, 2 = mechanism, 3 = proof,
  4 = offer, 5 = urgency. Not five product push emails.
• UGC scripts sound like a real HUMAN speaking — first person, specific detail,
  natural speech patterns. The word "amazing" is banned.
• Ad hooks are written for the first 3 seconds of video — pattern interrupt FIRST.
• The Big Idea is a SPECIFIC mechanism or counter-intuitive insight, never a generic promise.
• All copy must be culturally calibrated for the target market — idioms, references,
  humour, and social proof formats that resonate locally.
• Abandoned cart emails have escalating urgency with different angles each time.

Return ONLY valid JSON. No markdown, no preamble.`,

    `Write a COMPLETE copy system for:

BRAND             : ${state.positioning?.brand_name_suggestions?.[0]?.name ?? "The Brand"}
TARGET MARKET     : ${country}
TONE OF VOICE     : ${state.positioning?.tone_of_voice?.join(", ")}
DO SAY            : ${state.positioning?.tone_examples?.do_say?.join(" | ")}
DON'T SAY         : ${state.positioning?.tone_examples?.dont_say?.join(" | ")}

OFFER SUMMARY:
• Core Product    : ${state.offer?.core_product?.name} — ${state.offer?.core_product?.one_liner}
• Price           : ${state.offer?.core_product?.price_point}
• Guarantee       : ${state.offer?.guarantee?.exact_wording}
• Total Stack Value: ${state.offer?.value_stack?.total_stack_value}

PRIMARY PERSONA:
• Dream Outcome         : ${state.market_analysis?.target_personas?.[0]?.dream_outcome}
• Daily Frustrations    : ${state.market_analysis?.target_personas?.[0]?.daily_frustrations?.join(", ")}
• Top Objections        : ${state.market_analysis?.target_personas?.[0]?.objections?.join(", ")}
• Emotional Language    : ${state.market_analysis?.pain_points?.map(p => p.emotional_language).join(" | ")}
• Where They Spend Time : ${state.market_analysis?.target_personas?.[0]?.where_they_spend_time?.join(", ")}

DELIVERABLE DEPTH REQUIREMENTS:
1. Copy Strategy: Name the primary emotion, the core mechanism, the Big Idea (1 controlling
   concept the entire campaign hangs on), vivid before/after state descriptions.
2. Homepage Hero: H1 + H2 + primary CTA + secondary CTA + social proof line. All 5.
3. Headline Variations: 6–8 headlines using named formulas (PAS, How-To, Number, Question,
   Shock, Secret, Story) with best-use placement for each.
4. Email Sequences: Full 5-email welcome series, 3-email abandoned cart, 3-email post-purchase.
   Each email needs subject line, preview text, goal, and full body outline.
5. Product Page Copy: Full above-fold copy, product description with mechanism,
   6–8 bullet benefits in "feature → benefit → emotional payoff" format,
   5+ objection busters, 5+ FAQ answers.
6. Ad Copy Bank: 6–8 short hooks (1–2 lines), 3 UGC scripts with hook/body/CTA,
   3 static ad copy sets.
7. Urgency & Scarcity: 4–5 ethical urgency angles with exact copy for each.`
  );

  return { copy: result, current_node: "ad_strategist" };
}

// ─────────────────────────────────────────────────────────────────────────────
// NODE 5 — Performance Media Buyer & Ad Strategist
// ─────────────────────────────────────────────────────────────────────────────
export async function adStrategistNode(state: BrandKitState): Promise<Partial<BrandKitState>> {
  console.log("[Node 5/6] Performance Media Buyer & Ad Strategist...");

  const country = state.market_country ?? state.geographic_market ?? "United States";
  const monthlyBudget = state.budget_range ?? "$1,000–$3,000/month";

  const platformContext = `COUNTRY-SPECIFIC PLATFORM CONTEXT for ${country}:
• Identify which paid channels dominate in this market (e.g. Snapchat in UAE/SA,
  LINE in Thailand, WeChat in China, Mercado Libre in LatAm, Flipkart in India).
• Name the local CPM/CPC benchmarks for this market — not US benchmarks.
• Identify any country-specific ad restrictions, compliance requirements, or
  prohibited content categories.
• Suggest local influencer / creator platforms popular in this market.
• Note any currency or payment method considerations for ad accounts.`;

  const brandPhase = state.brand_stage === "established"
    ? `⚠️ ESTABLISHED BRAND IN TROUBLE — RESET PROTOCOL:
  Current Revenue : ${state.current_monthly_revenue ?? "unknown"}
  Current Ad Spend: ${state.current_ad_spend ?? "unknown"}
  Core Problem    : ${state.main_problem ?? "underperforming ads"}
  Priority: Diagnose what broke. Provide a specific 3-phase reset:
  Phase 1 — Stop bleeding (kill what to turn off immediately and why)
  Phase 2 — Test reset (rebuild creative and audience from scratch)
  Phase 3 — Scale back (milestones to hit before increasing budget)`
    : `🆕 NEW BRAND — TEST BEFORE SCALE:
  Budget conservation is critical. Maximum 40% of budget goes to any single channel
  until a winner is confirmed. Kill losers at $50 spend per ad, not $500.`;

  const result = await structuredLLMCall(
    AdStrategySchema,
    `You are a senior performance media buyer and growth strategist with 10 years managing
$50M+ in paid media across US, UK, EU, Middle East, and Asia-Pacific markets.
You are expert in Meta Ads (post-iOS14), Google Ads (Search, Shopping, PMax),
TikTok Ads, Snapchat Ads, and email/SMS automation.

YOU GIVE REAL MEDIA BUYING ADVICE — NO PLATITUDES:
• Specific daily budgets, not ranges.
• Exact audience types, lookalike percentages, interest clusters with named examples.
• Kill criteria with specific thresholds: "Kill if CPM > $X and CTR < X% after $50 spend."
• Scale rules: "Increase budget 20% every 72h when ROAS > X and frequency < 2.5."
• Retargeting window sizes with exclusion logic.
• Creative fatigue management with frequency caps.
• Country-specific platform recommendations — not a generic US-centric playbook.

2025 MEDIA LANDSCAPE:
• Meta: Advantage+ Campaigns (ASC) + broad targeting + strong creative = winning combo.
• Creative IS the targeting — hook quality determines CPM more than audience selection.
• TikTok Shop is a primary acquisition channel for under-35 demographics in most markets.
• Email/SMS automation = 25–40% of total ecom revenue when properly built.
• Google PMax needs strong asset groups and audience signals to outperform standard Shopping.
• First-party data and email list quality matters more than ever post-iOS14.

Return ONLY valid JSON. No markdown, no preamble.`,

    `Build a COMPLETE performance marketing strategy for immediate execution:

BRAND             : ${state.positioning?.brand_name_suggestions?.[0]?.name ?? "The Brand"}
NICHE             : ${state.niche}
PRODUCT           : ${state.product_idea}
TARGET MARKET     : ${country}
MONTHLY AD BUDGET : ${monthlyBudget}

UNIT ECONOMICS:
• Product Price   : ${state.offer?.core_product?.price_point}
• LTV (12-month)  : ${state.offer?.core_product?.ltv_estimate}
• Gross Margin    : ${state.offer?.core_product?.gross_margin_pct}
• Payback Period  : ${state.offer?.core_product?.payback_period}

PRIMARY PERSONA:
${JSON.stringify(state.market_analysis?.target_personas?.[0])}
Online Presence: ${state.market_analysis?.target_personas?.[0]?.where_they_spend_time?.join(", ")}

AVAILABLE CREATIVE ASSETS (from copywriter):
• Hooks          : ${state.copy?.ad_copy_bank?.short_hooks?.slice(0, 6).join(" | ")}
• UGC Scripts    : ${state.copy?.ad_copy_bank?.ugc_scripts?.length ?? 0} scripts
• Static Ad Sets : ${state.copy?.ad_copy_bank?.static_ad_copy?.length ?? 0} sets

${platformContext}

${brandPhase}

DELIVERABLE DEPTH REQUIREMENTS:
1. Strategy Overview: Primary channel with rationale, north-star metric, target CAC/ROAS,
   break-even ROAS calculation showing the math.
2. Meta Ads: Full account structure (campaign objective, bidding, CBO/ABO decision),
   testing phase (3–4 specific adsets with daily budgets, audience details, kill criteria),
   scaling phase (H-scaling and V-scaling rules with specific ROAS thresholds),
   creative playbook (4–5 formats with hook type, script outline, production notes),
   KPI benchmarks (CPM, CTR, CPC, CPP ranges for this specific niche and market).
3. Google Ads: Campaign type recommendations, keyword strategy with match type approach,
   2–3 keyword clusters with intent and bid strategy, 8–10 negative keywords, PMax
   asset group structure and audience signals.
4. TikTok/Social: Viability assessment for this market, 3 content formats, Spark Ads strategy.
5. Email/SMS: List building strategy, 3–4 automation flows with trigger, revenue impact, and key emails.
6. Budget Allocation: Monthly breakdown by channel with %, rationale, and scaling milestones.`
  );

  return { ad_strategy: result, current_node: "launch_planner" };
}

// ─────────────────────────────────────────────────────────────────────────────
// NODE 6 — Growth & Launch Strategist
// ─────────────────────────────────────────────────────────────────────────────
export async function launchPlannerNode(state: BrandKitState): Promise<Partial<BrandKitState>> {
  console.log("[Node 6/6] Growth & Launch Strategist...");

  const country = state.market_country ?? state.geographic_market ?? "United States";

  const result = await structuredLLMCall(
    LaunchPlanSchema,
    `You are a growth strategist and launch expert who has taken 20+ brands from zero to
6 figures and helped 10 established brands recover from revenue decline.

You build plans that are EXECUTABLE on Monday morning — not aspirational roadmaps.
Every task has an owner, a specific tool, a time estimate, and a clear deliverable.

YOUR LAUNCH PLAN STANDARDS:
• Pre-launch validation gates have BINARY pass/fail criteria. No grey areas.
• Tech stack checklist is ordered by criticality — "must-have at launch" vs "month 2."
• Day-by-day plan includes what to do when things go WRONG (failure response for each day).
• KPIs have a specific "action if below target" — not just a number to monitor.
• Financial model uses 3 real scenarios (conservative/base/optimistic) with honest,
  named assumptions — not fantasy hockey-stick projections.
• The contingency playbook is the most valuable section — plan for every failure mode.
• All timelines, tools, and tactics must be appropriate for the target country's
  market pace, logistics infrastructure, and platform ecosystem.
• For established brands: rebuilding customer trust takes priority over scaling ad spend.

Return ONLY valid JSON. No markdown, no preamble.`,

    `Build a COMPLETE 90-day growth and execution plan:

BRAND             : ${state.positioning?.brand_name_suggestions?.[0]?.name ?? "The Brand"}
PRODUCT           : ${state.product_idea}
TARGET MARKET     : ${country}
BRAND STAGE       : ${state.brand_stage ?? "new brand"}

OFFER SUMMARY:
• Core Product    : ${state.offer?.core_product?.name} at ${state.offer?.core_product?.price_point}
• Revenue Model   : ${state.offer?.revenue_model?.model_type}
• MRR Potential   : ${state.offer?.revenue_model?.monthly_recurring_potential}

AD STRATEGY SUMMARY:
• Primary Channel : ${state.ad_strategy?.strategy_overview?.recommended_primary_channel}
• Monthly Budget  : ${state.budget_range ?? "< $3k/month"}
• Break-even ROAS : ${state.ad_strategy?.strategy_overview?.break_even_roas}
• Target CAC      : ${state.ad_strategy?.strategy_overview?.target_cac}
• Email Automations Planned: ${state.ad_strategy?.email_and_sms?.automation_flows?.map(f => f.flow_name).join(", ")}

ESTABLISHED BRAND: ${state.brand_stage === "established"
      ? `Revenue: ${state.current_monthly_revenue} | Problem: ${state.main_problem} — prioritise recovery over growth`
      : "New brand — focus on first $10k revenue"}

DELIVERABLE DEPTH REQUIREMENTS:
1. Strategic Context: Brand stage assessment, primary constraint, 90-day mission statement
   (one specific measurable outcome), and what "winning" looks like at day 90.
2. Pre-Launch (Weeks 1–4): 3–4 weeks with 3–4 tasks each (owner/tool/time/deliverable),
   3–4 binary validation gates, and 6–8 tech stack items (tool/purpose/cost/priority).
3. Launch Execution: Launch type with rationale, 7-day day-by-day plan (morning tasks /
   afternoon tasks / metric to check / end-of-day decision), 5-email launch sequence,
   day-1 and week-1 revenue targets.
4. Post-Launch Optimization (Week 2–4): Daily review checklist, 3 experiments with
   hypothesis and success metric. Month 2–3: 4 growth levers with effort/impact rating
   and activation steps, hiring triggers.
5. KPI Dashboard: 4 daily metrics / 3 weekly metrics / 3 monthly metrics, each with
   target, data source, and "action if below."
6. Financial Model: 9 projections (months 1–3 × 3 scenarios) with assumptions, unit economics
   (CAC/LTV/ratio/margin/payback), break-even analysis, cash flow warning.
7. Contingency Playbook: 4–5 failure scenarios with diagnosis steps, corrective actions, timeline.`
  );

  return { launch_plan: result, current_node: "complete" };
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP RUNNER — called by /api/brand/step for single-node execution
// ─────────────────────────────────────────────────────────────────────────────
export async function runStep(
  step: 1 | 2 | 3 | 4 | 5 | 6,
  state: BrandKitState
): Promise<Partial<BrandKitState>> {
  switch (step) {
    case 1: return marketAnalystNode(state);
    case 2: return positioningExpertNode(state);
    case 3: return offerArchitectNode(state);
    case 4: return copywriterNode(state);
    case 5: return adStrategistNode(state);
    case 6: return launchPlannerNode(state);
    default: throw new Error(`Unknown step: ${step}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY FULL RUNNER — kept for backward compat, not called from the UI
// ─────────────────────────────────────────────────────────────────────────────
export async function runBrandArchitectWorkflow(
  input: Pick<BrandKitState,
    "product_idea" | "niche" | "target_audience" | "market_country" |
    "budget_range" | "competitors" | "usp" |
    "brand_stage" | "current_monthly_revenue" |
    "current_ad_spend" | "main_problem" |
    "business_model" | "geographic_market">
): Promise<BrandKitState> {
  let state: BrandKitState = {
    ...input,
    current_node: "market_analyst",
    errors: [],
  };

  for (const step of [1, 2, 3, 4, 5, 6] as const) {
    const partial = await runStep(step, state);
    state = { ...state, ...partial };
  }

  return state;
}
