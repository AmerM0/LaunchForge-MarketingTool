import { z } from "zod";

// ─── Node 1: Market Analyst ────────────────────────────────
export const MarketAnalysisSchema = z.object({
  market_size: z.string().describe("Estimated TAM/SAM/SOM"),
  growth_rate: z.string().describe("YoY market growth rate"),
  key_trends: z.array(z.string()).min(3).max(6),
  pain_points: z.array(z.string()).min(3).max(6),
  competitor_landscape: z.array(
    z.object({
      name: z.string(),
      weakness: z.string(),
      opportunity_gap: z.string(),
    })
  ).min(2),
  target_persona: z.object({
    name: z.string(),
    age_range: z.string(),
    psychographics: z.array(z.string()),
    buying_triggers: z.array(z.string()),
    objections: z.array(z.string()),
  }),
  market_readiness_score: z.number().min(1).max(10),
});

// ─── Node 2: Positioning Expert ───────────────────────────
export const PositioningSchema = z.object({
  brand_name_suggestions: z.array(z.string()).min(3).max(5),
  positioning_statement: z.string().min(50),
  value_proposition: z.string().min(30),
  brand_archetype: z.string(),
  tone_of_voice: z.array(z.string()).min(3).max(5),
  brand_personality_traits: z.array(z.string()).min(3),
  color_palette_rationale: z.object({
    primary: z.string().describe("Hex code + psychological rationale"),
    secondary: z.string(),
    accent: z.string(),
    neutral: z.string(),
  }),
  tagline_options: z.array(z.string()).min(3).max(5),
  differentiation_strategy: z.string().min(50),
});

// ─── Node 3: Offer Architect ──────────────────────────────
export const OfferSchema = z.object({
  core_product: z.object({
    name: z.string(),
    description: z.string(),
    price_point: z.string(),
    price_anchoring_rationale: z.string(),
  }),
  upsell_stack: z.array(
    z.object({
      name: z.string(),
      price: z.string(),
      timing: z.string(),
      conversion_hook: z.string(),
    })
  ).min(2),
  guarantee: z.object({
    type: z.string(),
    duration: z.string(),
    messaging: z.string(),
  }),
  packaging_options: z.array(
    z.object({
      tier: z.string(),
      price: z.string(),
      features: z.array(z.string()),
    })
  ).min(2).max(4),
  irresistibility_score: z.number().min(1).max(10),
  profit_margin_estimate: z.string(),
});

// ─── Node 4: Copywriter ───────────────────────────────────
export const CopySchema = z.object({
  hero_headline: z.string(),
  hero_subheadline: z.string(),
  above_fold_cta: z.string(),
  email_subject_lines: z.array(z.string()).min(5),
  email_preview_texts: z.array(z.string()).min(5),
  welcome_email_body: z.string().min(200),
  product_description_long: z.string().min(150),
  product_description_short: z.string().max(160),
  social_proof_templates: z.array(z.string()).min(3),
  faq_section: z.array(
    z.object({ question: z.string(), answer: z.string() })
  ).min(5),
  urgency_scarcity_hooks: z.array(z.string()).min(3),
});

// ─── Node 5: Ad Strategist ────────────────────────────────
export const AdStrategySchema = z.object({
  recommended_channels: z.array(
    z.object({
      channel: z.string(),
      rationale: z.string(),
      budget_allocation_pct: z.number(),
      expected_roas: z.string(),
    })
  ).min(2),
  meta_ads: z.object({
    campaign_objective: z.string(),
    audience_targeting: z.array(z.string()),
    ad_creatives: z.array(
      z.object({
        format: z.string(),
        hook: z.string(),
        body: z.string(),
        cta: z.string(),
      })
    ).min(3),
    lookalike_seed: z.string(),
  }),
  google_ads: z.object({
    campaign_type: z.string(),
    keywords: z.array(z.string()).min(10),
    negative_keywords: z.array(z.string()).min(5),
    ad_copy_variations: z.array(z.string()).min(3),
  }),
  content_strategy: z.object({
    organic_platforms: z.array(z.string()),
    content_pillars: z.array(z.string()).min(3),
    posting_frequency: z.string(),
    viral_hooks: z.array(z.string()).min(5),
  }),
  monthly_budget_recommendation: z.string(),
});

// ─── Node 6: Launch Planner ───────────────────────────────
export const LaunchPlanSchema = z.object({
  pre_launch: z.object({
    duration: z.string(),
    milestones: z.array(
      z.object({
        week: z.number(),
        tasks: z.array(z.string()),
        success_metric: z.string(),
      })
    ),
    validation_checklist: z.array(z.string()),
  }),
  launch_week: z.object({
    day_by_day: z.array(
      z.object({
        day: z.number(),
        focus: z.string(),
        actions: z.array(z.string()),
      })
    ),
    launch_sequence_emails: z.array(z.string()),
    day1_revenue_target: z.string(),
  }),
  post_launch: z.object({
    week2_4_strategy: z.string(),
    kpis_to_track: z.array(z.string()),
    optimization_triggers: z.array(
      z.object({ trigger: z.string(), response_action: z.string() })
    ),
    month2_3_growth_levers: z.array(z.string()),
  }),
  revenue_projections: z.object({
    month1: z.string(),
    month3: z.string(),
    month6: z.string(),
    break_even_timeline: z.string(),
  }),
});

// ─── Inferred types ───────────────────────────────────────
export type MarketAnalysis = z.infer<typeof MarketAnalysisSchema>;
export type Positioning    = z.infer<typeof PositioningSchema>;
export type Offer          = z.infer<typeof OfferSchema>;
export type Copy           = z.infer<typeof CopySchema>;
export type AdStrategy     = z.infer<typeof AdStrategySchema>;
export type LaunchPlan     = z.infer<typeof LaunchPlanSchema>;

export interface BrandKitState {
  // ── Inputs (provided by user)
  product_idea:    string;
  niche:           string;
  target_audience: string;
  budget_range?:   string;
  competitors?:    string[];
  usp?:            string;

  // ── Outputs (populated by each node in sequence)
  market_analysis?: MarketAnalysis;
  positioning?:     Positioning;
  offer?:           Offer;
  copy?:            Copy;
  ad_strategy?:     AdStrategy;
  launch_plan?:     LaunchPlan;

  // ── Metadata
  current_node: string;
  errors:       string[];
}
