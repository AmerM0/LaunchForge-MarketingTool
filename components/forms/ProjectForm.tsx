"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles, ChevronRight, ChevronLeft } from "lucide-react";

const STEPS = [
  { label: "Market Intelligence Analyst scanning your niche",       pct: 10 },
  { label: "Brand Positioning Strategist mapping your territory",   pct: 26 },
  { label: "Offer & Revenue Architect structuring your stack",      pct: 42 },
  { label: "Direct Response Copywriter writing your assets",        pct: 58 },
  { label: "Performance Media Buyer building your ad playbook",     pct: 74 },
  { label: "Growth Strategist building your 90-day plan",           pct: 90 },
  { label: "Compiling your complete Brand Kit",                     pct: 99 },
];

type BrandStage = "new" | "established";

export default function ProjectForm() {
  const router = useRouter();
  const supabase = createClient();
  const [page, setPage]             = useState(0);
  const [generating, setGenerating] = useState(false);
  const [stepIdx, setStepIdx]       = useState(0);
  const [error, setError]           = useState<string | null>(null);

  const [form, setForm] = useState({
    name:                    "",
    brand_stage:             "new" as BrandStage,
    product_idea:            "",
    niche:                   "",
    business_model:          "",
    target_audience:         "",
    geographic_market:       "",
    budget_range:            "",
    competitors:             "",
    usp:                     "",
    current_monthly_revenue: "",
    current_ad_spend:        "",
    main_problem:            "",
  });

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const isEstablished = form.brand_stage === "established";

  // Pages: 0 = basics, 1 = audience & budget, 2 = brand context
  const pages = [
    {
      title: "Your Brand & Product",
      subtitle: "Tell us what you're building or selling",
      fields: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Project Name *</Label>
            <Input id="name" name="name" required value={form.name} onChange={handle}
              placeholder="e.g. EcoBottle Launch Q3" className="mt-1.5" />
          </div>

          <div>
            <Label>Brand Stage *</Label>
            <div className="grid grid-cols-2 gap-3 mt-1.5">
              {(["new","established"] as BrandStage[]).map(s => (
                <button key={s} type="button"
                  onClick={() => setForm(p => ({ ...p, brand_stage: s }))}
                  className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all text-left ${
                    form.brand_stage === s
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40"
                  }`}>
                  <div className="font-semibold capitalize">{s === "new" ? "🚀 New Brand" : "⚡ Established Brand"}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {s === "new" ? "Starting from scratch" : "Already running, needs growth"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="product_idea">Product / Service Description *</Label>
            <Textarea id="product_idea" name="product_idea" required rows={3}
              value={form.product_idea} onChange={handle} className="mt-1.5"
              placeholder="Be specific. e.g. 'A subscription skincare box for men 30-45 who hate complicated routines. Ships monthly, includes 4-6 full-size products.'" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="niche">Market Niche *</Label>
              <Input id="niche" name="niche" required value={form.niche} onChange={handle}
                className="mt-1.5" placeholder="e.g. Men's Skincare" />
            </div>
            <div>
              <Label htmlFor="business_model">Business Model *</Label>
              <select id="business_model" name="business_model" required
                value={form.business_model} onChange={handle}
                className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">Select model</option>
                <option value="ecommerce-physical">Ecommerce (Physical)</option>
                <option value="ecommerce-digital">Ecommerce (Digital)</option>
                <option value="subscription-box">Subscription Box</option>
                <option value="saas">SaaS / Software</option>
                <option value="service-agency">Service / Agency</option>
                <option value="coaching-consulting">Coaching / Consulting</option>
                <option value="info-product">Info Product / Course</option>
                <option value="marketplace">Marketplace</option>
              </select>
            </div>
          </div>
        </div>
      ),
      valid: () => form.name && form.product_idea && form.niche && form.business_model,
    },
    {
      title: "Audience & Budget",
      subtitle: "The more specific, the better your output",
      fields: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="target_audience">Target Audience *</Label>
            <Textarea id="target_audience" name="target_audience" required rows={2}
              value={form.target_audience} onChange={handle} className="mt-1.5"
              placeholder="e.g. Men aged 30-45, professional, income $70k+, frustrated with complicated skincare routines, value convenience" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="geographic_market">Geographic Market</Label>
              <Input id="geographic_market" name="geographic_market"
                value={form.geographic_market} onChange={handle} className="mt-1.5"
                placeholder="e.g. US, UK, Europe" />
            </div>
            <div>
              <Label htmlFor="budget_range">Monthly Ad Budget</Label>
              <select id="budget_range" name="budget_range"
                value={form.budget_range} onChange={handle}
                className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">Select budget</option>
                <option value="Bootstrap (<$1k/month)">Bootstrap (&lt;$1k/month)</option>
                <option value="$1,000–$3,000/month">$1k – $3k/month</option>
                <option value="$3,000–$7,000/month">$3k – $7k/month</option>
                <option value="$7,000–$15,000/month">$7k – $15k/month</option>
                <option value="$15,000–$30,000/month">$15k – $30k/month</option>
                <option value="$30,000+/month">$30k+/month</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="competitors">Main Competitors</Label>
            <Input id="competitors" name="competitors"
              value={form.competitors} onChange={handle} className="mt-1.5"
              placeholder="e.g. Dollar Shave Club, Bulldog Skincare, Bevel (comma-separated)" />
            <p className="text-xs text-muted-foreground mt-1">Leave blank and the AI will identify them</p>
          </div>

          <div>
            <Label htmlFor="usp">Your Unique Angle</Label>
            <Textarea id="usp" name="usp" rows={2}
              value={form.usp} onChange={handle} className="mt-1.5"
              placeholder="What makes you different? Leave blank and the AI will identify it from your product description." />
          </div>
        </div>
      ),
      valid: () => !!form.target_audience,
    },
    {
      title: isEstablished ? "Your Current Situation" : "Final Details",
      subtitle: isEstablished
        ? "Help the AI diagnose what needs fixing"
        : "Any last context for the AI agents",
      fields: isEstablished ? (
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              🔍 Established brand mode
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
              The AI will diagnose your current situation and build a recovery + scaling strategy
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="current_monthly_revenue">Current Monthly Revenue</Label>
              <Input id="current_monthly_revenue" name="current_monthly_revenue"
                value={form.current_monthly_revenue} onChange={handle} className="mt-1.5"
                placeholder="e.g. $8,000/month" />
            </div>
            <div>
              <Label htmlFor="current_ad_spend">Current Monthly Ad Spend</Label>
              <Input id="current_ad_spend" name="current_ad_spend"
                value={form.current_ad_spend} onChange={handle} className="mt-1.5"
                placeholder="e.g. $2,500/month" />
            </div>
          </div>
          <div>
            <Label htmlFor="main_problem">Main Problem You're Facing *</Label>
            <Textarea id="main_problem" name="main_problem" required rows={4}
              value={form.main_problem} onChange={handle} className="mt-1.5"
              placeholder="Be honest and specific. e.g. 'Our ROAS dropped from 3.2 to 1.1 after iOS update. We're spending $3k/month on Meta but barely breaking even. Email list is 1,200 people but open rates are 18%. We haven't tested new creatives in 3 months.'" />
            <p className="text-xs text-muted-foreground mt-1">The more detail, the more targeted the diagnosis</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <p className="text-sm font-medium">✅ You're ready to generate</p>
            <p className="text-sm text-muted-foreground">6 AI specialists will now build your complete brand strategy. This takes 2–3 minutes.</p>
            <ul className="text-xs text-muted-foreground space-y-1 pt-1">
              {["Market Intelligence Report","Brand Positioning & Identity","Offer & Revenue Architecture","Full Copy System (emails, ads, web)","Performance Media Buying Playbook","90-Day Growth & Launch Plan"].map(item => (
                <li key={item} className="flex items-center gap-1.5">
                  <span className="text-green-500">✓</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ),
      valid: () => !isEstablished || !!form.main_problem,
    },
  ];

  const currentPage = pages[page];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (page < pages.length - 1) {
      setPage(p => p + 1);
      return;
    }
    setGenerating(true);
    setError(null);
    setStepIdx(0);

    const interval = setInterval(() => {
      setStepIdx(prev => Math.min(prev + 1, STEPS.length - 1));
    }, 22_000);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: project, error: pErr } = await supabase
        .from("projects")
        .insert({
          user_id:              user!.id,
          name:                 form.name,
          product_idea:         form.product_idea,
          niche:                form.niche,
          target_audience:      form.target_audience,
          budget_range:         form.budget_range || null,
          competitors:          form.competitors ? form.competitors.split(",").map(s => s.trim()) : null,
          unique_selling_point: form.usp || null,
        })
        .select()
        .single();

      if (pErr) throw pErr;

      const res = await fetch("/api/brand/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId:               project.id,
          product_idea:            form.product_idea,
          niche:                   form.niche,
          target_audience:         form.target_audience,
          budget_range:            form.budget_range || undefined,
          competitors:             form.competitors ? form.competitors.split(",").map(s => s.trim()) : undefined,
          usp:                     form.usp || undefined,
          brand_stage:             form.brand_stage,
          current_monthly_revenue: form.current_monthly_revenue || undefined,
          current_ad_spend:        form.current_ad_spend || undefined,
          main_problem:            form.main_problem || undefined,
          business_model:          form.business_model || undefined,
          geographic_market:       form.geographic_market || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      router.push(`/brand-kit/${project.id}`);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      clearInterval(interval);
      setGenerating(false);
    }
  };

  if (generating) {
    const step = STEPS[stepIdx];
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-8 py-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <p className="text-xl font-semibold">Agent {stepIdx + 1}/6</p>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">{step.label}…</p>
        </div>
        <div className="w-full max-w-sm space-y-1.5">
          <Progress value={step.pct} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{step.pct}% complete</span>
            <span>~{Math.max(1, Math.round(((100 - step.pct) / 100) * 2.5))} min left</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">⚠️ Don't close this tab</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Page indicator */}
      <div className="flex items-center gap-2">
        {pages.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= page ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold">{currentPage.title}</h2>
        <p className="text-sm text-muted-foreground">{currentPage.subtitle}</p>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          {error}
        </div>
      )}

      {currentPage.fields}

      <div className="flex gap-3 pt-2">
        {page > 0 && (
          <button type="button" onClick={() => setPage(p => p - 1)}
            className="flex items-center gap-2 px-4 py-2 border border-input rounded-md text-sm hover:bg-accent transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}
        <button type="submit" disabled={!currentPage.valid()}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-md px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {page < pages.length - 1 ? (
            <><span>Continue</span><ChevronRight className="w-4 h-4" /></>
          ) : (
            <><Sparkles className="w-4 h-4" /><span>Generate Brand Kit — 6 AI Agents</span></>
          )}
        </button>
      </div>
    </form>
  );
}
