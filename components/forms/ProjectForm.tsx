"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles } from "lucide-react";

const STEPS = [
  { label: "Analyzing market landscape",   pct: 10 },
  { label: "Crafting brand positioning",   pct: 26 },
  { label: "Architecting your offer",      pct: 42 },
  { label: "Writing conversion copy",      pct: 58 },
  { label: "Building ad strategy",         pct: 74 },
  { label: "Creating 90-day launch plan",  pct: 90 },
  { label: "Finalizing your brand kit",    pct: 99 },
];

export default function ProjectForm() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    name:            "",
    product_idea:    "",
    niche:           "",
    target_audience: "",
    budget_range:    "",
    competitors:     "",
    usp:             "",
  });

  const [generating, setGenerating] = useState(false);
  const [stepIdx, setStepIdx]       = useState(0);
  const [error, setError]           = useState<string | null>(null);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    setStepIdx(0);

    // Animate progress through steps (~15s each node)
    const interval = setInterval(() => {
      setStepIdx((prev) => Math.min(prev + 1, STEPS.length - 1));
    }, 15_000);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 1. Create project row
      const { data: project, error: pErr } = await supabase
        .from("projects")
        .insert({
          user_id:              user!.id,
          name:                 form.name,
          product_idea:         form.product_idea,
          niche:                form.niche,
          target_audience:      form.target_audience,
          budget_range:         form.budget_range || null,
          competitors:          form.competitors
            ? form.competitors.split(",").map((s) => s.trim())
            : null,
          unique_selling_point: form.usp || null,
        })
        .select()
        .single();

      if (pErr) throw pErr;

      // 2. Trigger AI generation
      const res = await fetch("/api/brand/generate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          projectId:       project.id,
          product_idea:    form.product_idea,
          niche:           form.niche,
          target_audience: form.target_audience,
          budget_range:    form.budget_range || undefined,
          competitors:     form.competitors
            ? form.competitors.split(",").map((s) => s.trim())
            : undefined,
          usp:             form.usp || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      // 3. Success — navigate to brand kit
      router.push(`/brand-kit/${project.id}`);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      clearInterval(interval);
      setGenerating(false);
    }
  };

  // ── Generating state ───────────────────────────────────
  if (generating) {
    const step = STEPS[stepIdx];
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] gap-8 py-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <p className="text-xl font-semibold">
            {stepIdx < STEPS.length - 1
              ? `Agent ${stepIdx + 1}/6 — ${step.label}…`
              : step.label + "…"}
          </p>
          <p className="text-sm text-muted-foreground">
            Your 6 AI agents are working. This takes ~90 seconds.
          </p>
        </div>
        <div className="w-full max-w-sm space-y-1.5">
          <Progress value={step.pct} className="h-2" />
          <p className="text-xs text-right text-muted-foreground">{step.pct}%</p>
        </div>
        <p className="text-xs text-muted-foreground">⚠️ Don't close or refresh this tab</p>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name">Project Name *</Label>
        <Input
          id="name" name="name" required
          value={form.name} onChange={handle}
          placeholder="e.g. EcoBottle Brand Launch"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="product_idea">Product / Service Idea *</Label>
        <Textarea
          id="product_idea" name="product_idea" required rows={3}
          value={form.product_idea} onChange={handle}
          placeholder="Describe your product or service in detail. The more specific, the better the output."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="niche">Market Niche *</Label>
          <Input
            id="niche" name="niche" required
            value={form.niche} onChange={handle}
            placeholder="e.g. Sustainable Fitness"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="target_audience">Target Audience *</Label>
          <Input
            id="target_audience" name="target_audience" required
            value={form.target_audience} onChange={handle}
            placeholder="e.g. Millennial eco-conscious women"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="budget_range">Monthly Ad Budget</Label>
          <Input
            id="budget_range" name="budget_range"
            value={form.budget_range} onChange={handle}
            placeholder="e.g. $1k–$5k/month"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="competitors">Main Competitors</Label>
          <Input
            id="competitors" name="competitors"
            value={form.competitors} onChange={handle}
            placeholder="BrandA, BrandB (comma-separated)"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="usp">
          Your Unique Selling Point{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          id="usp" name="usp" rows={2}
          value={form.usp} onChange={handle}
          placeholder="What makes you different? Leave blank and the AI will identify it."
        />
      </div>

      <Button type="submit" size="lg" className="w-full gap-2 mt-2">
        <Sparkles className="w-5 h-5" />
        Generate Brand Strategy — 6 AI Agents
      </Button>
    </form>
  );
}
