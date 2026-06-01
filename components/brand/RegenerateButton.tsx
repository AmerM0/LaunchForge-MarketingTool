"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BrandKitState } from "@/lib/langgraph/schemas/nodeSchemas";

const AGENT_STEPS = [
  { label: "Market Intelligence Analyst scanning your niche",       pct: 12 },
  { label: "Brand Positioning Strategist mapping your territory",   pct: 28 },
  { label: "Offer & Revenue Architect structuring your stack",      pct: 44 },
  { label: "Direct Response Copywriter writing your assets",        pct: 60 },
  { label: "Performance Media Buyer building your ad playbook",     pct: 76 },
  { label: "Growth Strategist building your 90-day plan",           pct: 92 },
  { label: "Saving your complete Brand Kit",                        pct: 99 },
];

interface Project {
  id: string;
  product_idea: string;
  niche: string;
  target_audience: string;
  budget_range?: string | null;
  competitors?: string[] | null;
  unique_selling_point?: string | null;
}

export default function RegenerateButton({ project }: { project: Project }) {
  const router = useRouter();
  const [running, setRunning]   = useState(false);
  const [stepIdx, setStepIdx]   = useState(0);
  const [stepDone, setStepDone] = useState<boolean[]>(Array(7).fill(false));
  const [error, setError]       = useState<string | null>(null);

  const run = async () => {
    setRunning(true);
    setError(null);
    setStepIdx(0);
    setStepDone(Array(7).fill(false));

    try {
      let state: Partial<BrandKitState> = {
        product_idea:    project.product_idea,
        niche:           project.niche,
        target_audience: project.target_audience,
        budget_range:    project.budget_range    ?? undefined,
        competitors:     project.competitors     ?? undefined,
        usp:             project.unique_selling_point ?? undefined,
        brand_stage:     "new",
        current_node:    "market_analyst",
        errors:          [],
      };

      for (let step = 1; step <= 6; step++) {
        setStepIdx(step - 1);

        const res  = await fetch("/api/brand/step", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ step, state }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? `Step ${step} failed`);

        state = { ...state, ...data.result };
        setStepDone(prev => { const n = [...prev]; n[step - 1] = true; return n; });
      }

      setStepIdx(6);

      const saveRes  = await fetch("/api/brand/save", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ projectId: project.id, brandKit: state }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.error ?? "Save failed");

      setStepDone(prev => { const n = [...prev]; n[6] = true; return n; });
      router.push(`/brand-kit/${project.id}`);

    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
      setRunning(false);
    }
  };

  if (running) {
    const agent = AGENT_STEPS[stepIdx];
    return (
      <div className="flex flex-col items-center gap-8 py-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
          </div>
          <p className="text-xl font-bold">
            {stepIdx < 6 ? `Agent ${stepIdx + 1} / 6` : "Saving Brand Kit…"}
          </p>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">{agent.label}…</p>
        </div>

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

        <div className="w-full max-w-sm space-y-1.5">
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-1000"
              style={{ width: `${agent.pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{agent.pct}% complete</span>
            <span>~{Math.max(1, Math.round((6 - stepIdx) * 1.5))} min left</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground/50">⚠️ Don't close this tab — each agent runs independently</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3.5">
          {error}
        </p>
      )}
      <Button size="lg" className="w-full gap-2" onClick={run}>
        <Sparkles className="w-4 h-4" />
        {error ? "Retry Generation" : "Generate Brand Kit — 6 AI Agents"}
      </Button>
    </div>
  );
}
