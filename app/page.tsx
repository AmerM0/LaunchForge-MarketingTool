import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2, Zap, BarChart3, Target, PenTool, Megaphone, Rocket } from "lucide-react";

const AGENTS = [
  {
    num: "01", icon: BarChart3, title: "Market Intelligence Analyst",
    desc: "TAM/SAM/SOM sizing, competitor gap analysis, demand signals, and a razor-sharp ICP with buying triggers and real objections.",
    color: "from-violet-500/20 to-violet-500/5",
    border: "border-violet-500/20",
  },
  {
    num: "02", icon: Target, title: "Brand Positioning Strategist",
    desc: "Brand name suggestions, Jungian archetypes, hex-coded color palette, taglines, and a differentiation strategy your competitors can't copy.",
    color: "from-indigo-500/20 to-indigo-500/5",
    border: "border-indigo-500/20",
  },
  {
    num: "03", icon: Zap, title: "Offer & Revenue Architect",
    desc: "Core offer pricing, upsell stack, guarantee messaging, and tiered packaging built on Hormozi's value equation for maximum conversion.",
    color: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/20",
  },
  {
    num: "04", icon: PenTool, title: "Direct Response Copywriter",
    desc: "Hero headlines, email sequences, welcome email, product descriptions, FAQ sections, and urgency hooks — all in your brand voice.",
    color: "from-blue-500/20 to-blue-500/5",
    border: "border-blue-500/20",
  },
  {
    num: "05", icon: Megaphone, title: "Performance Ad Strategist",
    desc: "Meta ad creatives, Google keyword lists, channel budget allocation, TikTok angles, and a full organic content pillar strategy.",
    color: "from-violet-500/20 to-violet-500/5",
    border: "border-violet-500/20",
  },
  {
    num: "06", icon: Rocket, title: "Growth & Launch Planner",
    desc: "Week-by-week pre-launch milestones, day-by-day launch plan, KPI dashboards, 3-scenario financial model, and contingency playbook.",
    color: "from-indigo-500/20 to-indigo-500/5",
    border: "border-indigo-500/20",
  },
];

const DELIVERABLES = [
  "Market size + growth rate", "Competitor gap analysis", "ICP persona breakdown",
  "Brand name suggestions", "Hex-coded color palette", "Positioning statement",
  "Offer stack + pricing", "Upsell sequence", "Risk-reversing guarantee",
  "Hero headlines + CTAs", "5-email welcome sequence", "Abandoned cart sequence",
  "Meta ad creatives (4+)", "Google keyword clusters", "Content pillars + hooks",
  "Pre-launch milestones", "Day-by-day launch week", "3-scenario revenue forecast",
];

const STATS = [
  { value: "6", label: "AI Specialists" },
  { value: "18", label: "Deliverables" },
  { value: "< 4min", label: "Generation Time" },
  { value: "100%", label: "Custom to Your Brand" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 btn-gradient rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">AI Brand Architect</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="btn-gradient text-white text-sm font-semibold rounded-lg px-5 py-2.5 inline-flex items-center gap-2"
            >
              Start Free Trial <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative hero-glow mesh-bg overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-28 md:py-36 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-300 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            6 AI Specialists · 1 Complete Brand Architecture
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6">
            Your Full Ecommerce Brand<br />
            <span className="gradient-text-purple">Built in Under 4 Minutes</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Six specialized AI agents run sequentially — market analysis, brand positioning,
            offer architecture, conversion copy, ad strategy, and a 90-day launch plan.
            All in one generation.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              href="/signup"
              className="btn-gradient inline-flex items-center justify-center gap-2 text-white font-semibold rounded-xl px-8 py-4 text-base"
            >
              <Sparkles className="w-4 h-4" />
              Start Your Free Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="glass-card inline-flex items-center justify-center gap-2 text-foreground font-medium rounded-xl px-8 py-4 text-base hover:bg-white/5 transition-colors"
            >
              View Pricing
            </Link>
          </div>

          {/* Trust line */}
          <p className="text-sm text-muted-foreground/70">
            7-day free trial · No credit card required · Cancel anytime
          </p>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </section>

      {/* ── Stats bar ───────────────────────────────────────────────────────── */}
      <section className="border-y border-border/50 bg-card/30">
        <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-black gradient-text-purple">{value}</p>
              <p className="text-sm text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Agent System ────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            The 6-Agent System
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Each agent is a domain specialist. Each output feeds the next. No templates — everything is generated fresh for your brand.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {AGENTS.map((agent) => (
            <div
              key={agent.title}
              className={`glass-card rounded-2xl p-6 hover:border-violet-500/30 hover:glow-sm transition-all duration-300 group`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${agent.color} border ${agent.border} flex items-center justify-center`}>
                  <agent.icon className="w-5 h-5 text-violet-300" />
                </div>
                <div>
                  <span className="text-xs font-bold text-muted-foreground/60 tracking-widest uppercase">
                    Agent {agent.num}
                  </span>
                  <h3 className="font-bold text-sm leading-tight mt-0.5">{agent.title}</h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{agent.desc}</p>
            </div>
          ))}
        </div>

        {/* Flow indicator */}
        <div className="mt-12 flex items-center justify-center gap-2 text-xs text-muted-foreground/50">
          {["01", "02", "03", "04", "05", "06"].map((n, i) => (
            <span key={n} className="flex items-center gap-2">
              <span className="font-mono font-bold text-violet-500/60">{n}</span>
              {i < 5 && <ArrowRight className="w-3 h-3" />}
            </span>
          ))}
          <span className="ml-3">Each agent feeds the next</span>
        </div>
      </section>

      {/* ── Deliverables ────────────────────────────────────────────────────── */}
      <section className="relative border-y border-border/50">
        <div className="absolute inset-0 mesh-bg opacity-50" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">Deliverables</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              18 Expert Outputs.<br />
              <span className="gradient-text-purple">One Generation Run.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              A strategy firm would charge $15,000–$50,000 for this. You get it in 4 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {DELIVERABLES.map((item) => (
              <div key={item} className="flex items-center gap-3 glass-card rounded-xl px-4 py-3">
                <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-28 text-center">
        <div className="relative glass-card rounded-3xl p-16 glow-purple overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-indigo-600/10 pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest">Get started today</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Ready to build your brand?
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Join founders and agencies cutting weeks of strategy work down to minutes.
              Your first brand kit is on us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link
                href="/signup"
                className="btn-gradient inline-flex items-center justify-center gap-2 text-white font-semibold rounded-xl px-8 py-4 text-base"
              >
                <Sparkles className="w-4 h-4" />
                Start Free Trial — 7 Days Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-sm text-muted-foreground/60">No credit card required · Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/50 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 btn-gradient rounded-md flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold">AI Brand Architect</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <a href="mailto:support@yourdomain.com" className="hover:text-foreground transition-colors">Support</a>
            <span>© {new Date().getFullYear()} AI Brand Architect</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
