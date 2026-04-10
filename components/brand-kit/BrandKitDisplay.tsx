"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BrandKitDisplayProps {
  brandKit: {
    market_analysis: any;
    positioning: any;
    offer: any;
    copy: any;
    ad_strategy: any;
    launch_plan: any;
    generation_time_ms?: number | null;
  };
}

const TABS = [
  { id: "market",     label: "🔍 Market",      title: "Market Analysis" },
  { id: "positioning",label: "🎯 Positioning", title: "Brand Positioning" },
  { id: "offer",      label: "💎 Offer",       title: "Offer Architecture" },
  { id: "copy",       label: "✍️ Copy",         title: "Conversion Copy" },
  { id: "ads",        label: "📢 Ads",         title: "Ad Strategy" },
  { id: "launch",     label: "🚀 Launch",      title: "Launch Plan" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items?.map((item, i) => (
        <Badge key={i} variant="secondary" className="font-normal text-xs">{item}</Badge>
      ))}
    </div>
  );
}

function Kv({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

export default function BrandKitDisplay({ brandKit }: BrandKitDisplayProps) {
  const { market_analysis: m, positioning: p, offer: o, copy: c, ad_strategy: a, launch_plan: l } = brandKit;

  return (
    <Tabs defaultValue="market">
      <TabsList className="grid grid-cols-3 lg:grid-cols-6 h-auto gap-1 mb-6">
        {TABS.map((t) => (
          <TabsTrigger key={t.id} value={t.id} className="text-xs py-2">
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* ── Tab 1: Market Analysis ── */}
      <TabsContent value="market" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Section title="Market Size">
            <p className="text-sm">{m?.market_size}</p>
            <p className="text-sm mt-2 text-muted-foreground">Growth: {m?.growth_rate}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Market Readiness</span>
              <Badge>{m?.market_readiness_score}/10</Badge>
            </div>
          </Section>
          <Section title="Key Trends">
            <ul className="space-y-1.5">
              {m?.key_trends?.map((t: string, i: number) => (
                <li key={i} className="text-sm flex gap-2"><span className="text-muted-foreground">→</span>{t}</li>
              ))}
            </ul>
          </Section>
          <Section title="Pain Points">
            <ul className="space-y-1.5">
              {m?.pain_points?.map((p: string, i: number) => (
                <li key={i} className="text-sm flex gap-2"><span className="text-muted-foreground">•</span>{p}</li>
              ))}
            </ul>
          </Section>
        </div>
        <Section title={`Target Persona — ${m?.target_persona?.name ?? ""}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Psychographics</p>
              <TagList items={m?.target_persona?.psychographics} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Buying Triggers</p>
              <TagList items={m?.target_persona?.buying_triggers} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Objections</p>
              <TagList items={m?.target_persona?.objections} />
            </div>
          </div>
        </Section>
        <Section title="Competitor Landscape">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {m?.competitor_landscape?.map((comp: any, i: number) => (
              <div key={i} className="border rounded-lg p-3 space-y-1">
                <p className="font-semibold text-sm">{comp.name}</p>
                <p className="text-xs text-muted-foreground">Weakness: {comp.weakness}</p>
                <p className="text-xs text-green-600">Gap: {comp.opportunity_gap}</p>
              </div>
            ))}
          </div>
        </Section>
      </TabsContent>

      {/* ── Tab 2: Positioning ── */}
      <TabsContent value="positioning" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Section title="Brand Names">
            <div className="flex flex-wrap gap-2">
              {p?.brand_name_suggestions?.map((name: string, i: number) => (
                <Badge key={i} variant={i === 0 ? "default" : "outline"} className="text-sm px-3 py-1">
                  {i === 0 && "★ "}{name}
                </Badge>
              ))}
            </div>
          </Section>
          <Section title="Brand Archetype">
            <p className="text-lg font-semibold">{p?.brand_archetype}</p>
            <TagList items={p?.brand_personality_traits} />
          </Section>
        </div>
        <Section title="Positioning Statement">
          <p className="text-sm leading-relaxed italic border-l-4 border-primary pl-4">
            "{p?.positioning_statement}"
          </p>
        </Section>
        <Section title="Value Proposition">
          <p className="text-sm">{p?.value_proposition}</p>
        </Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Section title="Tone of Voice">
            <TagList items={p?.tone_of_voice} />
          </Section>
          <Section title="Tagline Options">
            <ul className="space-y-1.5">
              {p?.tagline_options?.map((t: string, i: number) => (
                <li key={i} className="text-sm font-medium">"{t}"</li>
              ))}
            </ul>
          </Section>
        </div>
        <Section title="Color Palette">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(p?.color_palette_rationale ?? {}).map(([role, desc]: [string, any]) => {
              const hex = desc?.match(/#[0-9A-Fa-f]{3,6}/)?.[0];
              return (
                <div key={role} className="space-y-1.5">
                  {hex && (
                    <div className="w-full h-12 rounded-lg border" style={{ backgroundColor: hex }} />
                  )}
                  <p className="text-xs font-semibold capitalize">{role}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              );
            })}
          </div>
        </Section>
      </TabsContent>

      {/* ── Tab 3: Offer ── */}
      <TabsContent value="offer" className="space-y-4">
        <Section title="Core Offer">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Kv label="Product Name"    value={o?.core_product?.name} />
              <Kv label="Price Point"     value={o?.core_product?.price_point} />
              <Kv label="Est. Margin"     value={o?.profit_margin_estimate} />
            </div>
            <div className="space-y-3">
              <Kv label="Description" value={o?.core_product?.description} />
              <Kv label="Price Rationale" value={o?.core_product?.price_anchoring_rationale} />
            </div>
          </div>
        </Section>
        <Section title="Guarantee">
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="font-semibold text-sm">{o?.guarantee?.type} · {o?.guarantee?.duration}</p>
            <p className="text-sm mt-1 text-muted-foreground">"{o?.guarantee?.messaging}"</p>
          </div>
        </Section>
        <Section title="Upsell Stack">
          <div className="space-y-3">
            {o?.upsell_stack?.map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-3 border rounded-lg p-3">
                <Badge variant="outline" className="shrink-0">{i + 1}</Badge>
                <div className="space-y-0.5">
                  <p className="font-semibold text-sm">{item.name} — {item.price}</p>
                  <p className="text-xs text-muted-foreground">When: {item.timing}</p>
                  <p className="text-xs">{item.conversion_hook}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
        <Section title="Packaging Tiers">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {o?.packaging_options?.map((tier: any, i: number) => (
              <div key={i} className="border rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">{tier.tier}</p>
                  <Badge>{tier.price}</Badge>
                </div>
                <ul className="space-y-1">
                  {tier.features?.map((f: string, j: number) => (
                    <li key={j} className="text-xs text-muted-foreground flex gap-1"><span>✓</span>{f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      </TabsContent>

      {/* ── Tab 4: Copy ── */}
      <TabsContent value="copy" className="space-y-4">
        <Section title="Hero Section">
          <div className="space-y-2 text-center py-4">
            <p className="text-2xl font-bold">{c?.hero_headline}</p>
            <p className="text-muted-foreground">{c?.hero_subheadline}</p>
            <Badge className="text-sm px-4 py-1.5">{c?.above_fold_cta}</Badge>
          </div>
        </Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Section title="Email Subject Lines">
            <ul className="space-y-2">
              {c?.email_subject_lines?.map((s: string, i: number) => (
                <li key={i} className="text-sm border-l-2 border-primary/30 pl-3">{s}</li>
              ))}
            </ul>
          </Section>
          <Section title="Urgency / Scarcity Hooks">
            <ul className="space-y-2">
              {c?.urgency_scarcity_hooks?.map((h: string, i: number) => (
                <li key={i} className="text-sm border-l-2 border-orange-400/40 pl-3">{h}</li>
              ))}
            </ul>
          </Section>
        </div>
        <Section title="Product Description">
          <p className="text-sm leading-relaxed">{c?.product_description_long}</p>
          <div className="mt-3 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground font-medium mb-1">Short version (160 chars)</p>
            <p className="text-sm">{c?.product_description_short}</p>
          </div>
        </Section>
        <Section title="Welcome Email">
          <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans">{c?.welcome_email_body}</pre>
        </Section>
        <Section title="Social Proof Templates">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {c?.social_proof_templates?.map((t: string, i: number) => (
              <div key={i} className="bg-muted rounded-lg p-3 text-sm italic">"{t}"</div>
            ))}
          </div>
        </Section>
        <Section title="FAQ Section">
          <div className="space-y-3">
            {c?.faq_section?.map((faq: any, i: number) => (
              <div key={i}>
                <p className="text-sm font-semibold">Q: {faq.question}</p>
                <p className="text-sm text-muted-foreground mt-0.5">A: {faq.answer}</p>
              </div>
            ))}
          </div>
        </Section>
      </TabsContent>

      {/* ── Tab 5: Ads ── */}
      <TabsContent value="ads" className="space-y-4">
        <Section title="Channel Mix">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {a?.recommended_channels?.map((ch: any, i: number) => (
              <div key={i} className="border rounded-lg p-3 space-y-1">
                <div className="flex justify-between">
                  <p className="font-semibold text-sm">{ch.channel}</p>
                  <div className="flex gap-2">
                    <Badge variant="outline">{ch.budget_allocation_pct}% budget</Badge>
                    <Badge variant="secondary">{ch.expected_roas} ROAS</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{ch.rationale}</p>
              </div>
            ))}
          </div>
        </Section>
        <Section title="Meta Ads">
          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <Kv label="Objective" value={a?.meta_ads?.campaign_objective} />
              <Kv label="Lookalike Seed" value={a?.meta_ads?.lookalike_seed} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Audience Targeting</p>
              <TagList items={a?.meta_ads?.audience_targeting} />
            </div>
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase">Ad Creatives</p>
              {a?.meta_ads?.ad_creatives?.map((ad: any, i: number) => (
                <div key={i} className="border rounded-lg p-3 space-y-1.5">
                  <Badge variant="outline">{ad.format}</Badge>
                  <p className="text-sm font-semibold">{ad.hook}</p>
                  <p className="text-sm text-muted-foreground">{ad.body}</p>
                  <p className="text-sm font-medium text-primary">CTA: {ad.cta}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>
        <Section title="Google Ads">
          <div className="space-y-3">
            <Kv label="Campaign Type" value={a?.google_ads?.campaign_type} />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Target Keywords</p>
              <TagList items={a?.google_ads?.keywords} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Negative Keywords</p>
              <TagList items={a?.google_ads?.negative_keywords} />
            </div>
          </div>
        </Section>
        <Section title="Organic Content Strategy">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Platforms</p>
              <TagList items={a?.content_strategy?.organic_platforms} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Content Pillars</p>
              <TagList items={a?.content_strategy?.content_pillars} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Viral Hooks</p>
              <ul className="space-y-1">
                {a?.content_strategy?.viral_hooks?.map((h: string, i: number) => (
                  <li key={i} className="text-xs">{h}</li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      </TabsContent>

      {/* ── Tab 6: Launch Plan ── */}
      <TabsContent value="launch" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["month1", "month3", "month6"].map((key) => (
            <Section key={key} title={`Revenue — ${key.replace("month", "Month ")}`}>
              <p className="text-2xl font-bold text-primary">
                {l?.revenue_projections?.[key]}
              </p>
            </Section>
          ))}
        </div>
        <Section title="Pre-Launch Phase">
          <div className="space-y-3">
            {l?.pre_launch?.milestones?.map((ms: any, i: number) => (
              <div key={i} className="border rounded-lg p-3">
                <p className="text-sm font-semibold mb-1">Week {ms.week} — {ms.success_metric}</p>
                <ul className="space-y-0.5">
                  {ms.tasks?.map((task: string, j: number) => (
                    <li key={j} className="text-xs text-muted-foreground flex gap-1.5">
                      <span className="text-primary">✓</span>{task}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
        <Section title="Launch Week — Day by Day">
          <div className="space-y-3">
            {l?.launch_week?.day_by_day?.map((day: any, i: number) => (
              <div key={i} className="flex gap-3">
                <div className="w-16 shrink-0">
                  <Badge variant="outline" className="w-full justify-center">Day {day.day}</Badge>
                </div>
                <div>
                  <p className="text-sm font-semibold">{day.focus}</p>
                  <ul className="mt-1 space-y-0.5">
                    {day.actions?.map((action: string, j: number) => (
                      <li key={j} className="text-xs text-muted-foreground">→ {action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Section>
        <Section title="KPIs to Track">
          <TagList items={l?.post_launch?.kpis_to_track} />
        </Section>
        <Section title="Month 2–3 Growth Levers">
          <ul className="space-y-1.5">
            {l?.post_launch?.month2_3_growth_levers?.map((lever: string, i: number) => (
              <li key={i} className="text-sm flex gap-2">
                <span className="text-primary font-bold">→</span>{lever}
              </li>
            ))}
          </ul>
        </Section>
      </TabsContent>
    </Tabs>
  );
}
