import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN RULE: ZERO .min() / .max() on ANY type (string, array, number).
// These generate minLength/maxLength/minItems/maxItems/minimum/maximum in the
// JSON Schema forwarded to Anthropic's tool validator. When the LLM output
// doesn't satisfy these constraints, Anthropic returns:
//   "The string did not match the expected pattern."
// Quality is enforced through system-prompt instructions, NOT Zod guards.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Node 1: Market Intelligence Analyst ─────────────────────────────────────
export const MarketAnalysisSchema = z.object({
  executive_summary: z.string().describe("3-4 sentence snapshot of the opportunity and urgency"),

  market_sizing: z.object({
    tam: z.string().describe("Total Addressable Market with source reasoning"),
    sam: z.string().describe("Serviceable Addressable Market for this niche"),
    som_year1: z.string().describe("Realistic Year 1 capture with reasoning"),
    growth_rate: z.string().describe("YoY growth rate and trend direction"),
    market_maturity: z.enum(["emerging", "growing", "mature", "declining"]),
    maturity_implication: z.string().describe("What this maturity stage means for go-to-market"),
  }),

  demand_signals: z.object({
    search_demand: z.string().describe("Monthly search volume for core keywords and trend direction"),
    social_proof_volume: z.string().describe("Community size: Reddit, Facebook Groups, TikTok hashtag views"),
    seasonality: z.string().describe("Peak and trough months and how to plan around them"),
    buying_frequency: z.string().describe("One-time, subscription, or repeat — avg repurchase window"),
  }),

  key_trends: z.array(z.object({
    trend: z.string(),
    implication: z.string().describe("Specific action this trend enables for the brand"),
    time_horizon: z.string().describe("e.g. 12-18 months before mainstream"),
  })),

  pain_points: z.array(z.object({
    pain: z.string(),
    intensity: z.enum(["low", "medium", "high", "critical"]),
    current_workaround: z.string().describe("What people do today to solve this"),
    emotional_language: z.string().describe("Exact words customers use in reviews and forums"),
  })),

  competitor_landscape: z.array(z.object({
    name: z.string(),
    estimated_revenue: z.string(),
    primary_channel: z.string(),
    pricing: z.string(),
    core_weakness: z.string(),
    exploitable_gap: z.string().describe("Specific angle to win customers away from them"),
    messaging_angle: z.string().describe("Their primary marketing message"),
  })),

  target_personas: z.array(z.object({
    segment_name: z.string(),
    age_range: z.string(),
    income_range: z.string(),
    psychographics: z.array(z.string()),
    daily_frustrations: z.array(z.string()),
    buying_triggers: z.array(z.string()),
    objections: z.array(z.string()),
    where_they_spend_time: z.array(z.string()),
    dream_outcome: z.string().describe("The transformation they are actually buying"),
  })),

  market_readiness_score: z.number(),
  market_readiness_reasoning: z.string(),
});

// ─── Node 2: Brand Positioning Strategist ────────────────────────────────────
export const PositioningSchema = z.object({
  white_space: z.string().describe("The unclaimed positioning territory in this market"),
  recommended_category: z.string().describe("The category to own — not just describe the product"),

  brand_name_suggestions: z.array(z.object({
    name: z.string(),
    domain_available_likely: z.boolean(),
    rationale: z.string(),
    trademark_risk: z.enum(["low", "medium", "high"]),
  })),

  positioning_statement: z.string().describe("Full 'For [audience] who [problem], [brand] is the [category] that [benefit], unlike [alternative]' format"),
  value_proposition: z.string().describe("Core value prop in 1-2 sentences"),

  brand_archetype: z.object({
    primary: z.string(),
    secondary: z.string(),
    archetype_application: z.string().describe("How this archetype shows up in copy, imagery, and customer experience"),
  }),

  tone_of_voice: z.array(z.string()),

  tone_examples: z.object({
    do_say: z.array(z.string()),
    dont_say: z.array(z.string()),
  }),

  brand_personality_traits: z.array(z.string()),

  visual_identity: z.object({
    color_palette: z.object({
      primary: z.object({ hex: z.string(), name: z.string(), psychology: z.string() }),
      secondary: z.object({ hex: z.string(), name: z.string(), psychology: z.string() }),
      accent: z.object({ hex: z.string(), name: z.string(), psychology: z.string() }),
      neutral: z.object({ hex: z.string(), name: z.string(), psychology: z.string() }),
    }),
    typography_direction: z.string(),
    imagery_style: z.string(),
    design_references: z.array(z.string()),
  }),

  tagline_options: z.array(z.object({
    tagline: z.string(),
    use_case: z.string().describe("Where this works best: ads, homepage, packaging"),
  })),

  differentiation_strategy: z.string().describe("Why this brand wins — specific, named competitor comparison"),

  competitor_counter_positioning: z.array(z.object({
    competitor: z.string(),
    their_claim: z.string(),
    your_counter: z.string(),
  })),
});

// ─── Node 3: Offer and Revenue Architect ─────────────────────────────────────
export const OfferSchema = z.object({
  core_product: z.object({
    name: z.string(),
    one_liner: z.string().describe("The offer in one sentence including who it is for and the result"),
    description: z.string().describe("Full product description with benefits and mechanism"),
    price_point: z.string(),
    price_psychology: z.string().describe("Why this price works: anchoring, perceived value, competitive context"),
    cost_estimate: z.string(),
    gross_margin_pct: z.string(),
    ltv_estimate: z.string().describe("Estimated 12-month LTV per customer with reasoning"),
    payback_period: z.string().describe("How many weeks to recoup CAC at this price"),
  }),

  value_stack: z.object({
    bonuses: z.array(z.object({
      name: z.string(),
      perceived_value: z.string(),
      actual_cost: z.string(),
      why_it_increases_conversion: z.string(),
    })),
    total_stack_value: z.string(),
    price_to_value_ratio: z.string().describe("e.g. $497 for $3,200 worth of value"),
  }),

  upsell_stack: z.array(z.object({
    name: z.string(),
    price: z.string(),
    timing: z.string(),
    conversion_hook: z.string(),
    expected_take_rate: z.string(),
    revenue_impact: z.string(),
  })),

  downsell: z.object({
    name: z.string(),
    price: z.string(),
    trigger: z.string(),
    rationale: z.string(),
  }),

  guarantee: z.object({
    type: z.string(),
    duration: z.string(),
    exact_wording: z.string().describe("The guarantee word-for-word as it would appear on the page"),
    risk_reversal_logic: z.string(),
  }),

  packaging_tiers: z.array(z.object({
    tier_name: z.string(),
    price: z.string(),
    ideal_for: z.string(),
    features: z.array(z.string()),
    most_popular: z.boolean(),
  })),

  revenue_model: z.object({
    model_type: z.enum(["one-time", "subscription", "hybrid", "retainer", "productized-service"]),
    monthly_recurring_potential: z.string(),
    churn_risk_factors: z.array(z.string()),
    retention_mechanisms: z.array(z.string()),
  }),
});

// ─── Node 4: Direct Response Copywriter ──────────────────────────────────────
export const CopySchema = z.object({
  copy_strategy: z.object({
    primary_emotion: z.string().describe("The dominant emotion this copy triggers"),
    core_mechanism: z.string().describe("The unique how behind the product"),
    big_idea: z.string().describe("The single controlling idea the entire campaign hangs on"),
    before_state: z.string().describe("Vivid description of the customer before the product"),
    after_state: z.string().describe("Vivid description of the customer after — the dream outcome"),
  }),

  homepage_hero: z.object({
    headline: z.string(),
    subheadline: z.string(),
    cta_primary: z.string(),
    cta_secondary: z.string(),
    social_proof_line: z.string(),
  }),

  headline_variations: z.array(z.object({
    headline: z.string(),
    formula: z.string().describe("e.g. PAS, How-To, Number, Question, Shock"),
    best_for: z.string().describe("e.g. cold traffic Meta ad, warm retargeting, email subject"),
  })),

  email_sequences: z.object({
    welcome_series: z.array(z.object({
      email_number: z.number(),
      send_timing: z.string(),
      subject_line: z.string(),
      preview_text: z.string(),
      email_goal: z.string(),
      body_outline: z.string().describe("Full narrative outline with key points, story arc, and CTA"),
    })),
    abandoned_cart: z.array(z.object({
      email_number: z.number(),
      delay: z.string(),
      subject_line: z.string(),
      hook: z.string(),
      cta: z.string(),
    })),
    post_purchase: z.array(z.object({
      email_number: z.number(),
      timing: z.string(),
      goal: z.string(),
      subject_line: z.string(),
      key_message: z.string(),
    })),
  }),

  product_page_copy: z.object({
    above_fold: z.string().describe("Full above-fold section: H1, H2, bullet benefits, CTA, proof"),
    product_description: z.string().describe("Full product description with mechanism and benefits"),
    bullet_benefits: z.array(z.string()).describe("Feature to benefit to emotional payoff format"),
    objection_busters: z.array(z.object({
      objection: z.string(),
      response: z.string(),
    })),
    faq_section: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })),
  }),

  ad_copy_bank: z.object({
    short_hooks: z.array(z.string()).describe("1-2 line hooks for Reels, TikTok, and Meta ad first 3 seconds"),
    ugc_scripts: z.array(z.object({
      hook: z.string(),
      body: z.string(),
      cta: z.string(),
      duration_seconds: z.number(),
    })),
    static_ad_copy: z.array(z.object({
      primary_text: z.string(),
      headline: z.string(),
      description: z.string(),
      format: z.string(),
    })),
  }),

  urgency_and_scarcity: z.array(z.object({
    type: z.enum(["deadline", "quantity", "bonus-expiry", "social-proof", "price-increase"]),
    copy: z.string(),
    ethical_note: z.string(),
  })),
});

// ─── Node 5: Performance Media Buyer and Ad Strategist ───────────────────────
export const AdStrategySchema = z.object({
  strategy_overview: z.object({
    recommended_primary_channel: z.string(),
    rationale: z.string(),
    phase: z.enum(["testing", "scaling", "mature"]),
    north_star_metric: z.string(),
    target_cac: z.string(),
    target_roas: z.string(),
    break_even_roas: z.string(),
  }),

  meta_ads: z.object({
    account_structure: z.object({
      campaign_objective: z.string(),
      bidding_strategy: z.string(),
      campaign_budget_optimization: z.boolean(),
      recommended_daily_budget: z.string(),
      scaling_trigger: z.string(),
    }),
    testing_phase: z.object({
      duration: z.string(),
      total_test_budget: z.string(),
      methodology: z.string(),
      adsets: z.array(z.object({
        adset_name: z.string(),
        audience_type: z.enum(["broad", "interest", "lookalike", "retargeting", "custom"]),
        targeting_details: z.string(),
        daily_budget: z.string(),
        placements: z.string(),
        ads_per_adset: z.number(),
        kpi_to_declare_winner: z.string(),
      })),
      creative_testing: z.object({
        variables_to_test: z.array(z.string()),
        winning_criteria: z.string(),
        budget_per_creative: z.string(),
        kill_criteria: z.string(),
      }),
    }),
    scaling_phase: z.object({
      horizontal_scaling: z.string(),
      vertical_scaling: z.string(),
      cbo_structure: z.string(),
      lookalike_ladder: z.array(z.string()),
      retargeting_structure: z.object({
        window_days: z.number(),
        audience_segments: z.array(z.string()),
        budget_pct_of_total: z.string(),
        messaging_angle: z.string(),
      }),
      frequency_management: z.string(),
    }),
    creative_playbook: z.array(z.object({
      format: z.string(),
      hook_type: z.string(),
      script_outline: z.string(),
      production_notes: z.string(),
      expected_ctr_range: z.string(),
      best_placement: z.string(),
    })),
    kpis_and_benchmarks: z.object({
      cpm_benchmark: z.string(),
      ctr_benchmark: z.string(),
      cpc_benchmark: z.string(),
      cpp_benchmark: z.string(),
      roas_targets: z.object({
        minimum_viable: z.string(),
        healthy: z.string(),
        excellent: z.string(),
      }),
    }),
  }),

  google_ads: z.object({
    recommended_campaign_types: z.array(z.object({
      type: z.string(),
      priority: z.enum(["primary", "secondary", "optional"]),
      rationale: z.string(),
      estimated_budget_pct: z.string(),
    })),
    search_campaigns: z.object({
      keyword_strategy: z.string(),
      match_type_approach: z.string(),
      keyword_clusters: z.array(z.object({
        cluster_name: z.string(),
        intent: z.enum(["informational", "commercial", "transactional", "navigational"]),
        example_keywords: z.array(z.string()),
        bid_strategy: z.string(),
      })),
      negative_keywords: z.array(z.string()),
    }),
    shopping_pmax: z.object({
      feed_optimization_priorities: z.array(z.string()),
      audience_signals: z.array(z.string()),
      asset_group_structure: z.string(),
    }),
  }),

  tiktok_and_social: z.object({
    tiktok_viability: z.string(),
    content_formats: z.array(z.object({
      format: z.string(),
      hook_style: z.string(),
      optimal_length: z.string(),
      posting_time: z.string(),
    })),
    spark_ads_strategy: z.string(),
    ugc_acquisition: z.string(),
  }),

  email_and_sms: z.object({
    list_building_strategy: z.string(),
    automation_flows: z.array(z.object({
      flow_name: z.string(),
      trigger: z.string(),
      revenue_impact: z.string(),
      key_emails: z.array(z.string()),
    })),
    sms_strategy: z.string(),
  }),

  budget_allocation: z.object({
    total_monthly_budget: z.string(),
    breakdown: z.array(z.object({
      channel: z.string(),
      amount: z.string(),
      pct_of_budget: z.string(),
      rationale: z.string(),
    })),
    month1_focus: z.string(),
    scaling_milestones: z.array(z.object({
      milestone: z.string(),
      action: z.string(),
      budget_change: z.string(),
    })),
  }),
});

// ─── Node 6: Growth and Launch Strategist ────────────────────────────────────
export const LaunchPlanSchema = z.object({
  strategic_context: z.object({
    brand_stage: z.string(),
    primary_constraint: z.string(),
    mission_90_day: z.string().describe("One clear mission statement for the next 90 days"),
    success_definition: z.string().describe("What winning looks like at 90 days — specific and measurable"),
  }),

  pre_launch: z.object({
    duration: z.string(),
    weeks: z.array(z.object({
      week_number: z.number(),
      theme: z.string(),
      tasks: z.array(z.object({
        task: z.string(),
        owner: z.string().describe("Founder, VA, Agency, or Developer"),
        time_required: z.string(),
        tool_or_resource: z.string(),
      })),
      checkpoint: z.string(),
      if_behind: z.string(),
    })),
    validation_gates: z.array(z.object({
      gate_name: z.string(),
      test: z.string(),
      pass_criteria: z.string(),
      fail_action: z.string(),
    })),
    tech_stack_checklist: z.array(z.object({
      tool: z.string(),
      purpose: z.string(),
      cost: z.string(),
      priority: z.enum(["must-have", "nice-to-have", "later"]),
    })),
  }),

  launch_execution: z.object({
    launch_type: z.enum(["soft-launch", "full-launch", "waitlist-launch", "beta-launch"]),
    rationale: z.string(),
    day_by_day: z.array(z.object({
      day: z.number(),
      theme: z.string(),
      morning_tasks: z.array(z.string()),
      afternoon_tasks: z.array(z.string()),
      metric_to_check: z.string(),
      end_of_day_decision: z.string(),
    })),
    launch_email_sequence: z.array(z.object({
      day: z.number(),
      subject: z.string(),
      goal: z.string(),
      key_message: z.string(),
    })),
    day1_revenue_target: z.string(),
    week1_revenue_target: z.string(),
  }),

  post_launch_optimization: z.object({
    week2_to_4: z.object({
      primary_focus: z.string(),
      daily_review_checklist: z.array(z.string()),
      optimization_experiments: z.array(z.object({
        experiment: z.string(),
        hypothesis: z.string(),
        how_to_test: z.string(),
        success_metric: z.string(),
      })),
    }),
    month2_to_3: z.object({
      growth_levers: z.array(z.object({
        lever: z.string(),
        expected_impact: z.string(),
        effort: z.enum(["low", "medium", "high"]),
        how_to_activate: z.string(),
      })),
      team_hire_triggers: z.array(z.object({
        role: z.string(),
        hire_when: z.string(),
      })),
    }),
  }),

  kpi_dashboard: z.object({
    daily_metrics: z.array(z.object({
      metric: z.string(),
      target: z.string(),
      data_source: z.string(),
      action_if_below: z.string(),
    })),
    weekly_metrics: z.array(z.object({
      metric: z.string(),
      target: z.string(),
      review_question: z.string(),
    })),
    monthly_metrics: z.array(z.object({
      metric: z.string(),
      target: z.string(),
    })),
  }),

  financial_model: z.object({
    revenue_projections: z.array(z.object({
      month: z.number(),
      scenario: z.enum(["conservative", "base", "optimistic"]),
      revenue: z.string(),
      units_or_clients: z.string(),
      ad_spend: z.string(),
      net_profit: z.string(),
      assumptions: z.string(),
    })),
    unit_economics: z.object({
      cac_target: z.string(),
      ltv_target: z.string(),
      ltv_to_cac_ratio: z.string(),
      gross_margin: z.string(),
      payback_period: z.string(),
    }),
    break_even_analysis: z.string(),
    cash_flow_warning: z.string(),
  }),

  contingency_playbook: z.array(z.object({
    scenario: z.string(),
    diagnosis_steps: z.array(z.string()),
    corrective_actions: z.array(z.string()),
    timeline: z.string(),
  })),
});

// ─── Inferred types ───────────────────────────────────────────────────────────
export type MarketAnalysis = z.infer<typeof MarketAnalysisSchema>;
export type Positioning    = z.infer<typeof PositioningSchema>;
export type Offer          = z.infer<typeof OfferSchema>;
export type Copy           = z.infer<typeof CopySchema>;
export type AdStrategy     = z.infer<typeof AdStrategySchema>;
export type LaunchPlan     = z.infer<typeof LaunchPlanSchema>;

export interface BrandKitState {
  // ── Inputs
  product_idea:             string;
  niche:                    string;
  target_audience:          string;
  budget_range?:            string;
  competitors?:             string[];
  usp?:                     string;
  brand_stage?:             "new" | "established";
  current_monthly_revenue?: string;
  current_ad_spend?:        string;
  main_problem?:            string;
  business_model?:          string;
  geographic_market?:       string;

  // ── Outputs
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
