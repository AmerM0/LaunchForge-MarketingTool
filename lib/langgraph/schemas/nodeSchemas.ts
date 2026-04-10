import { z } from "zod";

// ─── Node 1: Market Intelligence Analyst ──────────────────
export const MarketAnalysisSchema = z.object({
  executive_summary: z.string().describe("3-4 sentence snapshot of the opportunity and urgency"),
  market_sizing: z.object({
    tam: z.string().describe("Total Addressable Market with source reasoning"),
    sam: z.string().describe("Serviceable Addressable Market for this niche"),
    som_year1: z.string().describe("Realistic Year 1 capture with reasoning"),
    growth_rate: z.string(),
    market_maturity: z.enum(["emerging","growing","mature","declining"]),
    maturity_implication: z.string().describe("What this maturity stage means for go-to-market"),
  }),
  demand_signals: z.object({
    search_demand: z.string().describe("Estimated monthly search volume for core keywords and trend direction"),
    social_proof_volume: z.string().describe("Community size on Reddit, Facebook Groups, TikTok hashtag views etc."),
    seasonality: z.string().describe("Peak/trough months and how to plan around them"),
    buying_frequency: z.string().describe("One-time, subscription, or repeat — and avg repurchase window"),
  }),
  key_trends: z.array(z.object({
    trend: z.string(),
    implication: z.string().describe("Specific action this trend enables for the brand"),
    time_horizon: z.string().describe("e.g. '12-18 months before mainstream'"),
  })).min(4).max(6),
  pain_points: z.array(z.object({
    pain: z.string(),
    intensity: z.enum(["low","medium","high","critical"]),
    current_workaround: z.string().describe("What people do today to solve this — reveals competitor weakness"),
    emotional_language: z.string().describe("Exact words your audience uses in reviews/forums to describe this pain"),
  })).min(4).max(7),
  competitor_landscape: z.array(z.object({
    name: z.string(),
    estimated_revenue: z.string(),
    primary_channel: z.string(),
    pricing: z.string(),
    core_weakness: z.string(),
    exploitable_gap: z.string().describe("Specific angle to win customers away from them"),
    messaging_angle: z.string().describe("Their primary marketing message — so you can counter-position"),
  })).min(3).max(5),
  target_personas: z.array(z.object({
    segment_name: z.string(),
    size_of_segment: z.string(),
    age_range: z.string(),
    income_range: z.string(),
    psychographics: z.array(z.string()).min(4),
    daily_frustrations: z.array(z.string()).min(3),
    buying_triggers: z.array(z.string()).min(3),
    objections: z.array(z.string()).min(3),
    where_they_spend_time: z.array(z.string()).min(3),
    content_they_consume: z.string(),
    dream_outcome: z.string().describe("The transformation they are actually buying"),
  })).min(1).max(3),
  brand_stage_diagnosis: z.object({
    is_established: z.boolean(),
    current_strengths: z.array(z.string()),
    critical_gaps: z.array(z.string()),
    priority_fix: z.string().describe("The single highest-leverage thing to fix first"),
  }),
  market_readiness_score: z.number().min(1).max(10),
  market_readiness_reasoning: z.string(),
});

// ─── Node 2: Brand Positioning Strategist ─────────────────
export const PositioningSchema = z.object({
  positioning_diagnosis: z.object({
    current_positioning_problem: z.string().describe("For established brands: what's wrong with how they're positioned now"),
    white_space: z.string().describe("The unclaimed positioning territory in this market"),
    recommended_category: z.string().describe("The category to own — not just describe the product"),
  }),
  brand_name_suggestions: z.array(z.object({
    name: z.string(),
    domain_available_likely: z.boolean(),
    rationale: z.string(),
    trademark_risk: z.enum(["low","medium","high"]),
  })).min(3).max(5),
  positioning_statement: z.string().min(80).describe("Full 'For [audience] who [problem], [brand] is the [category] that [benefit], unlike [alternative] which [weakness]' format"),
  value_proposition: z.string().min(50),
  brand_archetype: z.object({
    primary: z.string(),
    secondary: z.string(),
    archetype_application: z.string().describe("Concrete examples: how this archetype shows up in copy, imagery, and customer experience"),
  }),
  tone_of_voice: z.array(z.string()).min(4).max(6),
  tone_examples: z.object({
    do_say: z.array(z.string()).min(3).describe("Example phrases that match the tone"),
    dont_say: z.array(z.string()).min(3).describe("Phrases that break the brand voice"),
  }),
  brand_personality_traits: z.array(z.string()).min(4),
  visual_identity: z.object({
    color_palette: z.object({
      primary: z.object({ hex: z.string(), name: z.string(), psychology: z.string() }),
      secondary: z.object({ hex: z.string(), name: z.string(), psychology: z.string() }),
      accent: z.object({ hex: z.string(), name: z.string(), psychology: z.string() }),
      neutral: z.object({ hex: z.string(), name: z.string(), psychology: z.string() }),
    }),
    typography_direction: z.string().describe("Font personality direction e.g. 'Editorial serif for authority, geometric sans for modernity'"),
    imagery_style: z.string().describe("Art direction brief — lighting, subjects, mood, what to avoid"),
    design_references: z.array(z.string()).describe("3 brand references to study for visual direction"),
  }),
  tagline_options: z.array(z.object({
    tagline: z.string(),
    use_case: z.string().describe("Where this works best: ads, homepage, packaging, etc."),
  })).min(4).max(6),
  differentiation_strategy: z.string().min(100),
  competitor_counter_positioning: z.array(z.object({
    competitor: z.string(),
    their_claim: z.string(),
    your_counter: z.string(),
  })).min(2),
});

// ─── Node 3: Offer & Revenue Architect ────────────────────
export const OfferSchema = z.object({
  offer_diagnosis: z.object({
    core_problem_with_current_offer: z.string().describe("For established brands: why the current offer isn't converting"),
    value_gap: z.string().describe("The gap between what's being promised and what customers actually want"),
  }),
  core_product: z.object({
    name: z.string(),
    one_liner: z.string().describe("The offer in one sentence including who it's for and the result"),
    description: z.string().min(100),
    price_point: z.string(),
    price_psychology: z.string().describe("Why this price works: anchoring, perceived value, competitive context"),
    cost_estimate: z.string(),
    gross_margin_pct: z.string(),
    ltv_estimate: z.string().describe("Estimated 12-month LTV per customer with reasoning"),
    payback_period: z.string().describe("How many weeks/months to recoup CAC at this price"),
  }),
  value_stack: z.object({
    bonuses: z.array(z.object({
      name: z.string(),
      perceived_value: z.string(),
      actual_cost: z.string(),
      why_it_increases_conversion: z.string(),
    })).min(2).max(4),
    total_stack_value: z.string(),
    price_to_value_ratio: z.string().describe("e.g. '$497 for $3,200 worth of value — 6.4x'"),
  }),
  upsell_stack: z.array(z.object({
    name: z.string(),
    price: z.string(),
    timing: z.string(),
    conversion_hook: z.string(),
    expected_take_rate: z.string().describe("Realistic % of buyers who take this upsell"),
    revenue_impact: z.string().describe("What this does to AOV if take rate is met"),
  })).min(2).max(4),
  downsell: z.object({
    name: z.string(),
    price: z.string(),
    trigger: z.string().describe("When to offer this — e.g. 'when buyer clicks No on core offer'"),
    rationale: z.string(),
  }),
  guarantee: z.object({
    type: z.string(),
    duration: z.string(),
    exact_wording: z.string().min(50).describe("The guarantee word-for-word as it would appear on the page"),
    risk_reversal_logic: z.string().describe("Why this guarantee actually reduces refund rates"),
  }),
  packaging_tiers: z.array(z.object({
    tier_name: z.string(),
    price: z.string(),
    ideal_for: z.string(),
    features: z.array(z.string()).min(4),
    most_popular: z.boolean(),
  })).min(2).max(4),
  pricing_table_psychology: z.string().describe("How to structure the tiers visually to anchor buyers toward the target tier"),
  revenue_model: z.object({
    model_type: z.enum(["one-time","subscription","hybrid","retainer","productized-service"]),
    monthly_recurring_potential: z.string(),
    churn_risk_factors: z.array(z.string()),
    retention_mechanisms: z.array(z.string()),
  }),
});

// ─── Node 4: Direct Response Copywriter ───────────────────
export const CopySchema = z.object({
  copy_strategy: z.object({
    primary_emotion: z.string().describe("The dominant emotion this copy triggers — fear, desire, pride, relief, etc."),
    core_mechanism: z.string().describe("The unique 'how' behind the product — the mechanism that makes the promise believable"),
    big_idea: z.string().describe("The single controlling idea the entire campaign hangs on"),
    before_state: z.string().describe("Vivid description of the customer's life before the product"),
    after_state: z.string().describe("Vivid description of the customer's life after — the dream outcome"),
  }),
  homepage_hero: z.object({
    headline: z.string(),
    subheadline: z.string(),
    cta_primary: z.string(),
    cta_secondary: z.string(),
    social_proof_line: z.string().describe("One line of proof under the CTA e.g. 'Join 2,300 brands already growing'"),
  }),
  headline_variations: z.array(z.object({
    headline: z.string(),
    formula: z.string().describe("e.g. PAS, How-To, Number, Question, Shock"),
    best_for: z.string().describe("e.g. cold traffic Meta ad, warm retargeting, email subject"),
  })).min(6).max(10),
  email_sequences: z.object({
    welcome_series: z.array(z.object({
      email_number: z.number(),
      send_timing: z.string().describe("e.g. 'Immediately on signup'"),
      subject_line: z.string(),
      preview_text: z.string(),
      email_goal: z.string(),
      body_outline: z.string().min(150).describe("Full narrative outline with key points, story arc, and CTA"),
    })).min(5),
    abandoned_cart: z.array(z.object({
      email_number: z.number(),
      delay: z.string(),
      subject_line: z.string(),
      hook: z.string(),
      cta: z.string(),
    })).min(3),
    post_purchase: z.array(z.object({
      email_number: z.number(),
      timing: z.string(),
      goal: z.string(),
      subject_line: z.string(),
      key_message: z.string(),
    })).min(3),
  }),
  product_page_copy: z.object({
    above_fold: z.string().describe("Full above-fold section: H1, H2, bullet benefits, CTA, proof"),
    product_description: z.string().min(200),
    bullet_benefits: z.array(z.string()).min(6).describe("Feature → benefit → emotional payoff format"),
    objection_busters: z.array(z.object({
      objection: z.string(),
      response: z.string(),
    })).min(4),
    faq_section: z.array(z.object({
      question: z.string(),
      answer: z.string().min(50),
    })).min(6),
  }),
  ad_copy_bank: z.object({
    short_hooks: z.array(z.string()).min(8).describe("1-2 line hooks for Reels, TikTok, and Meta ad first 3 seconds"),
    ugc_scripts: z.array(z.object({
      hook: z.string(),
      body: z.string(),
      cta: z.string(),
      duration_seconds: z.number(),
    })).min(3),
    static_ad_copy: z.array(z.object({
      primary_text: z.string(),
      headline: z.string(),
      description: z.string(),
      format: z.string(),
    })).min(4),
  }),
  social_proof: z.object({
    review_request_message: z.string(),
    testimonial_prompts: z.array(z.string()).min(4).describe("Questions to ask customers to get powerful testimonials"),
    case_study_template: z.string().describe("Before/After/How framework filled in with hypothetical ideal result"),
  }),
  urgency_and_scarcity: z.array(z.object({
    type: z.enum(["deadline","quantity","bonus-expiry","social-proof","price-increase"]),
    copy: z.string(),
    ethical_note: z.string().describe("Why this is genuine — prevents fake scarcity"),
  })).min(4),
});

// ─── Node 5: Performance Media Buyer & Ad Strategist ──────
export const AdStrategySchema = z.object({
  strategy_overview: z.object({
    recommended_primary_channel: z.string(),
    rationale: z.string(),
    phase: z.enum(["testing","scaling","mature"]).describe("Current recommended phase based on budget and brand stage"),
    north_star_metric: z.string().describe("The one metric to optimize for right now"),
    target_cac: z.string().describe("Target Cost to Acquire a Customer — worked backwards from LTV"),
    target_roas: z.string(),
    break_even_roas: z.string().describe("The ROAS at which ad spend breaks even — critical floor"),
  }),
  meta_ads: z.object({
    account_structure: z.object({
      campaign_objective: z.string(),
      bidding_strategy: z.string().describe("e.g. Advantage+ Shopping, Cost Cap, Bid Cap — with reasoning for this stage"),
      campaign_budget_optimization: z.boolean(),
      recommended_daily_budget: z.string(),
      scaling_trigger: z.string().describe("The exact metric/threshold to increase budget — e.g. 'ROAS >2.5 for 3 consecutive days'"),
    }),
    testing_phase: z.object({
      duration: z.string(),
      total_test_budget: z.string(),
      methodology: z.string().describe("Step-by-step testing methodology — audiences first, then creatives, etc."),
      adsets: z.array(z.object({
        adset_name: z.string(),
        audience_type: z.enum(["broad","interest","lookalike","retargeting","custom"]),
        targeting_details: z.string().describe("Specific interests, lookalike %, custom audience source"),
        daily_budget: z.string(),
        placements: z.string(),
        ads_per_adset: z.number(),
        kpi_to_declare_winner: z.string(),
      })).min(4),
      creative_testing: z.object({
        variables_to_test: z.array(z.string()).min(4).describe("One variable per test: hook type, format, angle, CTA"),
        winning_criteria: z.string(),
        budget_per_creative: z.string(),
        kill_criteria: z.string().describe("When to turn off an ad — e.g. 'CPM >$25 after $20 spend or CTR <1%'"),
      }),
    }),
    scaling_phase: z.object({
      horizontal_scaling: z.string().describe("How to scale by duplicating winning adsets — exact steps"),
      vertical_scaling: z.string().describe("How and when to increase budget on winners — % rules, frequency caps"),
      cbo_structure: z.string().describe("How to consolidate into CBO campaigns once winners are found"),
      lookalike_ladder: z.array(z.string()).describe("Lookalike audience progression: 1% → 2% → 3-5% with reasoning"),
      retargeting_structure: z.object({
        window_days: z.number(),
        audience_segments: z.array(z.string()).min(3),
        budget_pct_of_total: z.string(),
        messaging_angle: z.string().describe("How retargeting copy differs from cold traffic"),
      }),
      frequency_management: z.string().describe("At what frequency to rotate creatives and how"),
    }),
    creative_playbook: z.array(z.object({
      format: z.string(),
      hook_type: z.string(),
      script_outline: z.string().min(100),
      production_notes: z.string(),
      expected_ctr_range: z.string(),
      best_placement: z.string(),
    })).min(5),
    kpis_and_benchmarks: z.object({
      cpm_benchmark: z.string(),
      ctr_benchmark: z.string(),
      cpc_benchmark: z.string(),
      cpp_benchmark: z.string().describe("Cost per Purchase benchmark for this niche"),
      add_to_cart_rate_benchmark: z.string(),
      roas_targets: z.object({
        minimum_viable: z.string(),
        healthy: z.string(),
        excellent: z.string(),
      }),
    }),
    common_mistakes: z.array(z.string()).min(4).describe("Mistakes to avoid in this specific niche/budget range"),
  }),
  google_ads: z.object({
    recommended_campaign_types: z.array(z.object({
      type: z.string(),
      priority: z.enum(["primary","secondary","optional"]),
      rationale: z.string(),
      estimated_budget_pct: z.string(),
    })).min(3),
    search_campaigns: z.object({
      keyword_strategy: z.string(),
      match_type_approach: z.string().describe("Exact vs phrase vs broad — with reasoning for this brand stage"),
      keyword_clusters: z.array(z.object({
        cluster_name: z.string(),
        intent: z.enum(["informational","commercial","transactional","navigational"]),
        example_keywords: z.array(z.string()).min(5),
        bid_strategy: z.string(),
      })).min(3),
      negative_keywords: z.array(z.string()).min(10),
      ad_copy_framework: z.string(),
    }),
    shopping_pmax: z.object({
      feed_optimization_priorities: z.array(z.string()).min(5),
      audience_signals: z.array(z.string()).min(3),
      asset_group_structure: z.string(),
    }),
  }),
  tiktok_and_social: z.object({
    tiktok_viability: z.string().describe("Is TikTok right for this brand/niche? Why or why not?"),
    content_formats: z.array(z.object({
      format: z.string(),
      hook_style: z.string(),
      optimal_length: z.string(),
      posting_time: z.string(),
    })).min(3),
    spark_ads_strategy: z.string().describe("How to use organic posts as paid ads"),
    ugc_acquisition: z.string().describe("How to get UGC creators for this brand — platform, budget, brief"),
  }),
  email_and_sms: z.object({
    list_building_strategy: z.string(),
    segmentation_plan: z.array(z.object({
      segment: z.string(),
      size_estimate: z.string(),
      messaging_angle: z.string(),
      send_frequency: z.string(),
    })).min(4),
    automation_flows: z.array(z.object({
      flow_name: z.string(),
      trigger: z.string(),
      revenue_impact: z.string().describe("Expected % of total revenue this flow generates"),
      key_emails: z.array(z.string()).min(3),
    })).min(4),
    sms_strategy: z.string(),
  }),
  influencer_and_ugc: z.object({
    approach: z.string(),
    tier_recommendation: z.enum(["nano","micro","mid-tier","macro","celebrity"]),
    budget_allocation: z.string(),
    outreach_brief: z.string().describe("What to include in the influencer brief for this brand"),
    performance_kpis: z.array(z.string()).min(3),
  }),
  budget_allocation: z.object({
    total_monthly_budget: z.string(),
    breakdown: z.array(z.object({
      channel: z.string(),
      amount: z.string(),
      pct_of_budget: z.string(),
      rationale: z.string(),
    })).min(4),
    month1_focus: z.string().describe("What to spend on in month 1 only — before scaling"),
    scaling_milestones: z.array(z.object({
      milestone: z.string(),
      action: z.string(),
      budget_change: z.string(),
    })).min(3),
  }),
});

// ─── Node 6: Growth & Launch Strategist ───────────────────
export const LaunchPlanSchema = z.object({
  strategic_context: z.object({
    brand_stage: z.string().describe("New brand or established brand — affects the entire plan"),
    primary_constraint: z.string().describe("The #1 limiting factor right now — usually budget, audience, or product-market fit"),
    90_day_mission: z.string().describe("One clear mission statement for the next 90 days"),
    success_definition: z.string().describe("What 'winning' looks like at 90 days — specific and measurable"),
  }),
  pre_launch: z.object({
    duration: z.string(),
    weeks: z.array(z.object({
      week_number: z.number(),
      theme: z.string(),
      tasks: z.array(z.object({
        task: z.string(),
        owner: z.string().describe("Founder / VA / Agency / Developer"),
        time_required: z.string(),
        tool_or_resource: z.string(),
      })).min(3),
      checkpoint: z.string().describe("The specific outcome that means this week succeeded"),
      if_behind: z.string().describe("What to cut or defer if this week runs over"),
    })).min(4),
    validation_gates: z.array(z.object({
      gate_name: z.string(),
      test: z.string(),
      pass_criteria: z.string(),
      fail_action: z.string().describe("What to do if the gate fails — pivot, not give up"),
    })).min(3),
    tech_stack_checklist: z.array(z.object({
      tool: z.string(),
      purpose: z.string(),
      cost: z.string(),
      priority: z.enum(["must-have","nice-to-have","later"]),
    })).min(8),
  }),
  launch_execution: z.object({
    launch_type: z.enum(["soft-launch","full-launch","waitlist-launch","beta-launch"]),
    rationale: z.string(),
    day_by_day: z.array(z.object({
      day: z.number(),
      theme: z.string(),
      morning_tasks: z.array(z.string()).min(2),
      afternoon_tasks: z.array(z.string()).min(2),
      metric_to_check: z.string(),
      end_of_day_decision: z.string().describe("What the metric tells you to do next"),
    })).min(7),
    launch_email_sequence: z.array(z.object({
      day: z.number(),
      subject: z.string(),
      goal: z.string(),
      key_message: z.string(),
    })).min(5),
    day1_revenue_target: z.string(),
    week1_revenue_target: z.string(),
  }),
  post_launch_optimization: z.object({
    week2_to_4: z.object({
      primary_focus: z.string(),
      daily_review_checklist: z.array(z.string()).min(5),
      optimization_experiments: z.array(z.object({
        experiment: z.string(),
        hypothesis: z.string(),
        how_to_test: z.string(),
        success_metric: z.string(),
      })).min(3),
    }),
    month2_to_3: z.object({
      growth_levers: z.array(z.object({
        lever: z.string(),
        expected_impact: z.string(),
        effort: z.enum(["low","medium","high"]),
        how_to_activate: z.string(),
      })).min(5),
      team_hire_triggers: z.array(z.object({
        role: z.string(),
        hire_when: z.string().describe("Specific revenue or volume threshold that triggers this hire"),
      })).min(2),
    }),
  }),
  kpi_dashboard: z.object({
    daily_metrics: z.array(z.object({
      metric: z.string(),
      target: z.string(),
      data_source: z.string(),
      action_if_below: z.string(),
    })).min(5),
    weekly_metrics: z.array(z.object({
      metric: z.string(),
      target: z.string(),
      review_question: z.string(),
    })).min(4),
    monthly_metrics: z.array(z.object({
      metric: z.string(),
      target: z.string(),
    })).min(3),
  }),
  financial_model: z.object({
    revenue_projections: z.array(z.object({
      month: z.number(),
      scenario: z.enum(["conservative","base","optimistic"]),
      revenue: z.string(),
      units_or_clients: z.string(),
      ad_spend: z.string(),
      net_profit: z.string(),
      assumptions: z.string(),
    })).min(9).describe("3 scenarios x 3 months minimum"),
    unit_economics: z.object({
      cac_target: z.string(),
      ltv_target: z.string(),
      ltv_to_cac_ratio: z.string(),
      gross_margin: z.string(),
      payback_period: z.string(),
    }),
    break_even_analysis: z.string(),
    cash_flow_warning: z.string().describe("Practical cash flow advice — when ad spend hits before revenue arrives"),
  }),
  contingency_playbook: z.array(z.object({
    scenario: z.string().describe("e.g. 'ROAS drops below 1.5 after week 2'"),
    diagnosis_steps: z.array(z.string()).min(2),
    corrective_actions: z.array(z.string()).min(2),
    timeline: z.string().describe("How long to give it before escalating"),
  })).min(4),
});

// ─── Inferred types ───────────────────────────────────────
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
