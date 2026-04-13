import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { Plus, Sparkles, Clock, CheckCircle2, AlertCircle, ArrowRight, Zap } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from("projects")
    .select("*, brand_kits(id)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(6);

  const statusConfig = {
    complete: {
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      label: "Complete",
      className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    generating: {
      icon: <Clock className="w-3.5 h-3.5 animate-pulse" />,
      label: "Generating",
      className: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    failed: {
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      label: "Failed",
      className: "text-red-400 bg-red-500/10 border-red-500/20",
    },
    draft: {
      icon: <Clock className="w-3.5 h-3.5" />,
      label: "Draft",
      className: "text-muted-foreground bg-white/5 border-white/10",
    },
  } as const;

  const totalKits    = projects?.filter((p) => p.status === "complete").length ?? 0;
  const inProgress   = projects?.filter((p) => p.status === "generating").length ?? 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your AI-generated brand strategies
          </p>
        </div>
        <Link
          href="/projects/new"
          className="btn-gradient inline-flex items-center gap-2 text-white text-sm font-semibold rounded-xl px-5 py-2.5"
        >
          <Plus className="w-4 h-4" />
          New Brand Kit
        </Link>
      </div>

      {/* ── Stats strip ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Brand Kits Built", value: String(totalKits), accent: true },
          { label: "In Progress",      value: String(inProgress), accent: false },
          { label: "AI Agents",        value: "6",  accent: false },
          { label: "Avg. Time",        value: "< 4m", accent: false },
        ].map(({ label, value, accent }) => (
          <div key={label} className="glass-card rounded-xl px-4 py-4">
            <p className={`text-2xl font-black ${accent ? "gradient-text-purple" : ""}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Project cards ──────────────────────────────────────────────────── */}
      {(!projects || projects.length === 0) ? (
        /* Empty state */
        <div className="glass-card rounded-2xl p-16 text-center">
          <div className="w-16 h-16 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-8 h-8 text-violet-400" />
          </div>
          <h3 className="text-lg font-bold mb-2">No brand kits yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-7 leading-relaxed">
            Let 6 AI specialists build your complete ecommerce brand strategy — market
            analysis, positioning, copy, ads, and a 90-day launch plan.
          </p>
          <Link
            href="/projects/new"
            className="btn-gradient inline-flex items-center gap-2 text-white font-semibold rounded-xl px-7 py-3 text-sm"
          >
            <Zap className="w-4 h-4" />
            Create Your First Brand Kit
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {projects.map((project) => {
            const status = (project.status ?? "draft") as keyof typeof statusConfig;
            const cfg    = statusConfig[status] ?? statusConfig.draft;

            return (
              <div
                key={project.id}
                className="glass-card rounded-2xl p-5 flex flex-col gap-4 hover:border-violet-500/25 transition-all duration-200 group"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm leading-snug line-clamp-1 flex-1">
                    {project.name}
                  </h3>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border ${cfg.className} shrink-0`}>
                    {cfg.icon}
                    {cfg.label}
                  </span>
                </div>

                {/* Product idea */}
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-1">
                  {project.product_idea}
                </p>

                {/* Niche chip */}
                <div className="flex gap-2">
                  <span className="text-xs bg-white/5 border border-white/8 text-muted-foreground px-2.5 py-1 rounded-lg">
                    {project.niche}
                  </span>
                </div>

                {/* CTA */}
                <div className="pt-1 border-t border-white/6">
                  {project.status === "complete" ? (
                    <Link
                      href={`/brand-kit/${project.id}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors py-1"
                    >
                      View Brand Kit
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : project.status === "generating" ? (
                    <div className="w-full flex items-center justify-center gap-2 text-sm text-amber-400 py-1">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      Generating…
                    </div>
                  ) : (
                    <Link
                      href={`/projects/${project.id}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
                    >
                      View Project
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add new card */}
          <Link
            href="/projects/new"
            className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center gap-3 min-h-[180px] border-dashed hover:border-violet-500/30 hover:bg-violet-500/3 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-xl border border-dashed border-white/15 group-hover:border-violet-500/40 flex items-center justify-center transition-colors">
              <Plus className="w-5 h-5 text-muted-foreground group-hover:text-violet-400 transition-colors" />
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">
              New Brand Kit
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
