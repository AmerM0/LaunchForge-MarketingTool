"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Sparkles, ChevronRight, ChevronLeft, CheckCircle2,
         Zap, Globe, Building2, TrendingUp } from "lucide-react";
import type { BrandKitState } from "@/lib/langgraph/schemas/nodeSchemas";

// ─── Progress steps shown during generation ────────────────────────────────
const AGENT_STEPS = [
  { label: "Market Intelligence Analyst scanning your niche",       icon: "🔍", pct: 12 },
  { label: "Brand Positioning Strategist mapping your territory",   icon: "🎯", pct: 28 },
  { label: "Offer & Revenue Architect structuring your stack",      icon: "💎", pct: 44 },
  { label: "Direct Response Copywriter writing your assets",        icon: "✍️",  pct: 60 },
  { label: "Performance Media Buyer building your ad playbook",     icon: "📢", pct: 76 },
  { label: "Growth Strategist building your 90-day plan",           icon: "🚀", pct: 92 },
  { label: "Saving your complete Brand Kit",                        icon: "💾", pct: 99 },
];

// ─── Sanitise strings before DB insert ────────────────────────────────────
const sanitizeForDB = (s: string) =>
  s.replace(/&/g, "and").replace(/[<>]/g, "").replace(/"/g, "'").trim();

export default function ProjectForm() {
  const router  = useRouter();
  const supabase = createClient();
  const [page, setPage]           = useState(0);
  const [generating, setGenerating] = useState(false);
  const [stepIdx, setStepIdx]     = useState(0);
  const [stepDone, setStepDone]   = useState<boolean[]>(Array(7).fill(false));
  const [error, setError]         = useState<string | null>(null);

  const [form, setForm] = useState({
    name:                    "",
    product_idea:            "",
    niche:                   "",
    market_country:          "",
    budget_monthly:          "",
    brand_stage:             "new" as "new" | "established",
    current_monthly_revenue: "",
    current_ad_spend:        "",
    main_problem:            "",
    target_audience:         "",
    competitors:             "",
    usp:                     "",
  });

  const handle = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // ─── Form pages ──────────────────────────────────────────────────────────
  const pages = [
    {
      title:    "Your Brand & Product",
      subtitle: "Tell us what you're building",
      valid:    () => !!(form.name && form.product_idea && form.niche && form.market_country && form.budget_monthly),
      fields: (
        <div className="space-y-5">
          {/* Project name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">Project Name *</label>
            <input name="name" required value={form.name} onChange={handle}
              placeholder="e.g. EcoBottle Launch Q3"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all placeholder:text-muted-foreground/50" />
          </div>

          {/* Product idea */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">Product / Service Description *</label>
            <textarea name="product_idea" required rows={3} value={form.product_idea} onChange={handle}
              placeholder="Be specific. e.g. 'A subscription skincare box for men 30–45 who hate complicated routines. Ships monthly.'"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all placeholder:text-muted-foreground/50 resize-none" />
          </div>

          {/* Niche + Budget */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Market Niche *</label>
              <input name="niche" required value={form.niche} onChange={handle}
                placeholder="e.g. Men's Skincare"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all placeholder:text-muted-foreground/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Monthly Ad Budget (USD) *</label>
              <input name="budget_monthly" required type="number" min="0"
                value={form.budget_monthly} onChange={handle}
                placeholder="e.g. 2500"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all placeholder:text-muted-foreground/50" />
            </div>
          </div>

          {/* Market country */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-violet-400" />
              Target Market / Country *
            </label>
            <input name="market_country" required value={form.market_country} onChange={handle}
              placeholder="e.g. United States, United Kingdom, UAE, Australia, Saudi Arabia…"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all placeholder:text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground/60">
              All market data, pricing, platforms, and cultural nuances will be tailored to this market.
            </p>
          </div>
        </div>
      ),
    },
    {
      title:    "Brand Stage & Audience",
      subtitle: "This shapes every AI agent's analysis",
      valid:    () => !!(form.target_audience && (
        form.brand_stage === "new" ||
        (form.brand_stage === "established" && form.current_monthly_revenue && form.main_problem)
      )),
      fields: (
        <div className="space-y-5">
          {/* Brand stage toggle */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Brand Stage *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, brand_stage: "new" }))}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  form.brand_stage === "new"
                    ? "bg-violet-500/15 border-violet-500/40 text-violet-300"
                    : "bg-white/3 border-white/10 text-muted-foreground hover:bg-white/6"
                }`}
              >
                <Zap className="w-4 h-4 shrink-0" />
                <div className="text-left">
                  <p className="font-semibold">New Brand</p>
                  <p className="text-xs opacity-70">Starting from scratch</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, brand_stage: "established" }))}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  form.brand_stage === "established"
                    ? "bg-violet-500/15 border-violet-500/40 text-violet-300"
                    : "bg-white/3 border-white/10 text-muted-foreground hover:bg-white/6"
                }`}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <div className="text-left">
                  <p className="font-semibold">Established Brand</p>
                  <p className="text-xs opacity-70">Already running / scaling</p>
                </div>
              </button>
            </div>
          </div>

          {/* Established-brand fields (conditional) */}
          {form.brand_stage === "established" && (
            <div className="space-y-4 glass-card rounded-xl p-4">
              <p className="text-xs font-semibold text-violet-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Established Brand Details
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground/70">Current Monthly Revenue *</label>
                  <input name="current_monthly_revenue" value={form.current_monthly_revenue} onChange={handle}
                    placeholder="e.g. $12,000/month"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder:text-muted-foreground/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground/70">Current Monthly Ad Spend</label>
                  <input name="current_ad_spend" value={form.current_ad_spend} onChange={handle}
                    placeholder="e.g. $3,500/month"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder:text-muted-foreground/50" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/70">Main Problem / What's Not Working *</label>
                <textarea name="main_problem" rows={2} value={form.main_problem} onChange={handle}
                  placeholder="e.g. 'ROAS dropped from 3.2 to 1.1 after iOS update, ads are not converting'"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder:text-muted-foreground/50 resize-none" />
              </div>
            </div>
          )}

          {/* Target audience */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">Target Audience *</label>
            <textarea name="target_audience" required rows={2} value={form.target_audience} onChange={handle}
              placeholder="e.g. Men aged 30–45, professionals, $70k+ income, frustrated with complicated skincare, value convenience"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all placeholder:text-muted-foreground/50 resize-none" />
          </div>

          {/* Competitors */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">Main Competitors</label>
            <input name="competitors" value={form.competitors} onChange={handle}
              placeholder="e.g. Dollar Shave Club, Bulldog Skincare, Bevel (leave blank to let AI identify them)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all placeholder:text-muted-foreground/50" />
          </div>

          {/* USP */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">Your Unique Angle (optional)</label>
            <textarea name="usp" rows={2} value={form.usp} onChange={handle}
              placeholder="What makes you different? Leave blank and the AI will find it."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all placeholder:text-muted-foreground/50 resize-none" />
          </div>

          {/* Deliverables preview */}
          <div className="glass-card rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              6 agents · 18 deliverables · ~6–10 min
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-xs text-muted-foreground">
              {["Market Intelligence Report","Brand Positioning & Identity","Offer & Revenue Architecture","Full Copy System","Ad Strategy & Media Playbook","90-Day Growth & Launch Plan"].map(item => (
                <span key={item} className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />{item}</span>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ];

  const currentPage = pages[page];

  // ─── Multi-step generation ───────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (page < pages.length - 1) { setPage(p => p + 1); return; }

    setGenerating(true);
    setError(null);
    setStepIdx(0);
    setStepDone(Array(7).fill(false));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const budgetMonthly = Math.max(0, parseInt(form.budget_monthly, 10) || 0);

      // ── 1. Create the project row ──────────────────────────────────────────
      const { data: project, error: pErr } = await supabase
        .from("projects")
        .insert({
          user_id:         user!.id,
          name:            sanitizeForDB(form.name),
          product_idea:    sanitizeForDB(form.product_idea),
          niche:           sanitizeForDB(form.niche),
          target_audience: sanitizeForDB(form.target_audience),
        })
        .select()
        .single();

      if (pErr) throw new Error(`Project creation failed: ${pErr.message}`);

      // ── 2. Build initial workflow state ────────────────────────────────────
      let state: Partial<BrandKitState> = {
        product_idea:            form.product_idea,
        niche:                   form.niche,
        target_audience:         form.target_audience,
        market_country:          form.market_country || "United States",
        budget_range:            budgetMonthly > 0 ? `$${budgetMonthly.toLocaleString()}/month` : undefined,
        competitors:             form.competitors ? form.competitors.split(",").map(s => s.trim()).filter(Boolean) : undefined,
        usp:                     form.usp || undefined,
        brand_stage:             form.brand_stage,
        current_monthly_revenue: form.brand_stage === "established" ? form.current_monthly_revenue || undefined : undefined,
        current_ad_spend:        form.brand_stage === "established" ? form.current_ad_spend || undefined : undefined,
        main_problem:            form.brand_stage === "established" ? form.main_problem || undefined : undefined,
        current_node:            "market_analyst",
        errors:                  [],
      };

      // ── 3. Run 6 steps sequentially ────────────────────────────────────────
      for (let step = 1; step <= 6; step++) {
        setStepIdx(step - 1);

        const res = await fetch("/api/brand/step", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ step, state }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? `Step ${step} failed`);

        // Merge this step's output into accumulated state
        state = { ...state, ...data.result };

        // Mark step as done
        setStepDone(prev => {
          const next = [...prev];
          next[step - 1] = true;
          return next;
        });
      }

      // ── 4. Save brand kit to DB ────────────────────────────────────────────
      setStepIdx(6); // "Saving..." step

      const saveRes = await fetch("/api/brand/save", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ projectId: project.id, brandKit: state }),
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.error ?? "Save failed");

      setStepDone(prev => { const next = [...prev]; next[6] = true; return next; });

      router.push(`/brand-kit/${project.id}`);

    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // ─── Generating screen ───────────────────────────────────────────────────
  if (generating) {
    const agent = AGENT_STEPS[stepIdx];
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-8 py-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
          </div>
          <p className="text-xl font-bold">
            {stepIdx < 6 ? `Agent ${stepIdx + 1} / 6` : "Saving Brand Kit…"}
          </p>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">{agent.label}…</p>
        </div>

        {/* Step progress pills */}
        <div className="w-full max-w-sm space-y-2">
          {AGENT_STEPS.slice(0, 6).map((s, i) => (
            <div key={i} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
              stepDone[i]
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : i === stepIdx
                ? "bg-violet-500/10 border border-violet-500/20 text-violet-300"
                : "bg-white/3 border border-white/6 text-muted-foreground/50"
            }`}>
              {stepDone[i]
                ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                : i === stepIdx
                ? <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                : <span className="w-4 h-4 shrink-0 text-center text-xs">{i + 1}</span>
              }
              <span className="text-xs font-medium">{s.label.split(" ").slice(0, 4).join(" ")}…</span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-sm space-y-1.5">
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-1000"
              style={{ width: `${agent.pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{agent.pct}% complete</span>
            <span>~{Math.max(1, Math.round(((6 - stepIdx) * 1.5)))} min left</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground/50">⚠️ Don't close this tab — each agent runs independently</p>
      </div>
    );
  }

  // ─── Form ────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Page dots */}
      <div className="flex items-center gap-2">
        {pages.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= page ? "bg-violet-500" : "bg-white/10"}`} />
        ))}
      </div>

      <div>
        <h2 className="text-lg font-bold">{currentPage.title}</h2>
        <p className="text-sm text-muted-foreground">{currentPage.subtitle}</p>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3.5">
          {error}
        </div>
      )}

      {currentPage.fields}

      <div className="flex gap-3 pt-2">
        {page > 0 && (
          <button type="button" onClick={() => setPage(p => p - 1)}
            className="flex items-center gap-2 px-5 py-2.5 border border-white/10 rounded-xl text-sm hover:bg-white/5 transition-colors text-muted-foreground">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}
        <button type="submit" disabled={!currentPage.valid()}
          className="flex-1 btn-gradient inline-flex items-center justify-center gap-2 text-white font-semibold rounded-xl px-6 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
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
