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

export default function ProjectForm() {
  const router = useRouter();
  const supabase = createClient();
  const [page, setPage] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name:            "",
    product_idea:    "",
    niche:           "",
    target_audience: "",
    budget_monthly:  "",
    competitors:     "",
    usp:             "",
  });

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // Simple 2-page form
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
            <Label htmlFor="product_idea">Product / Service Description *</Label>
            <Textarea id="product_idea" name="product_idea" required rows={3}
              value={form.product_idea} onChange={handle} className="mt-1.5"
              placeholder="Be specific. e.g. 'A subscription skincare box for men 30-45 who hate complicated routines. Ships monthly.'" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="niche">Market Niche *</Label>
              <Input id="niche" name="niche" required value={form.niche} onChange={handle}
                className="mt-1.5" placeholder="e.g. Men's Skincare" />
            </div>
            <div>
              <Label htmlFor="budget_monthly">Monthly Ad Budget (USD) *</Label>
              <Input id="budget_monthly" name="budget_monthly" required type="number"
                value={form.budget_monthly} onChange={handle} className="mt-1.5"
                placeholder="e.g. 2500" min="0" />
            </div>
          </div>
        </div>
      ),
      valid: () => form.name && form.product_idea && form.niche && form.budget_monthly,
    },
    {
      title: "Audience & Competition",
      subtitle: "The more specific, the better your output",
      fields: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="target_audience">Target Audience *</Label>
            <Textarea id="target_audience" name="target_audience" required rows={2}
              value={form.target_audience} onChange={handle} className="mt-1.5"
              placeholder="e.g. Men aged 30-45, professional, income 70k+, frustrated with complicated skincare, value convenience" />
          </div>

          <div>
            <Label htmlFor="competitors">Main Competitors (comma-separated)</Label>
            <Input id="competitors" name="competitors"
              value={form.competitors} onChange={handle} className="mt-1.5"
              placeholder="e.g. Dollar Shave Club, Bulldog Skincare, Bevel" />
            <p className="text-xs text-muted-foreground mt-1">Leave blank and the AI will identify them</p>
          </div>

          <div>
            <Label htmlFor="usp">Your Unique Angle (optional)</Label>
            <Textarea id="usp" name="usp" rows={2}
              value={form.usp} onChange={handle} className="mt-1.5"
              placeholder="What makes you different? Leave blank and the AI will find it." />
          </div>

          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <p className="text-sm font-medium">✅ Ready to generate</p>
            <p className="text-sm text-muted-foreground">6 AI specialists will build your complete brand strategy. This takes 3–4 minutes.</p>
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
      valid: () => !!form.target_audience,
    },
  ];

  const currentPage = pages[page];

  // Strip characters that trigger live-DB regex CHECK constraints.
  // The raw original text is still sent to the LLM via the API body.
  const sanitizeForDB = (s: string) =>
    s.replace(/&/g, "and")
      .replace(/[<>]/g, "")
      .replace(/"/g, "'")
      .trim();

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
    }, 30_000);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // budget_monthly as a safe integer string
      const budgetMonthly = Math.max(0, parseInt(form.budget_monthly, 10) || 0);

      const { data: project, error: pErr } = await supabase
        .from("projects")
        .insert({
          user_id:         user!.id,
          // Sanitize text fields — replaces & < > " that can violate live-DB CHECK constraints
          name:            sanitizeForDB(form.name),
          product_idea:    sanitizeForDB(form.product_idea),
          niche:           sanitizeForDB(form.niche),
          target_audience: sanitizeForDB(form.target_audience),
        })
        .select()
        .single();

      if (pErr) throw new Error(`DB insert failed: ${pErr.message} (code: ${pErr.code}, hint: ${pErr.hint})`);

      const res = await fetch("/api/brand/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId:        project.id,
          product_idea:     form.product_idea,
          niche:            form.niche,
          target_audience:  form.target_audience,
          budget_range:     budgetMonthly.toString(),
          competitors:      form.competitors ? form.competitors.split(",").map(s => s.trim()) : undefined,
          usp:              form.usp || undefined,
          brand_stage:      "new",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      router.push(`/brand-kit/${project.id}`);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
      console.error("[ProjectForm] Error:", err);
    } finally {
      clearInterval(interval);
      setGenerating(false);
    }
  };

  if (generating) {
    const step = STEPS[stepIdx];
    const isFinalizing = stepIdx === STEPS.length - 1;
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-8 py-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          {isFinalizing ? (
            <p className="text-xl font-semibold">Compiling Brand Kit…</p>
          ) : (
            <p className="text-xl font-semibold">Agent {stepIdx + 1} / 6</p>
          )}
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">{step.label}…</p>
        </div>
        <div className="w-full max-w-sm space-y-1.5">
          <Progress value={step.pct} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{step.pct}% complete</span>
            {isFinalizing ? (
              <span>Almost done…</span>
            ) : (
              <span>~{Math.max(1, Math.round(((100 - step.pct) / 100) * 2.5))} min left</span>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">⚠️ Don't close this tab</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
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
