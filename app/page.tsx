import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

const AGENTS = [
  { num: 1, icon: "🔍", title: "Market Analyst",     desc: "TAM/SAM/SOM sizing, competitor gap analysis, and a detailed ICP persona with buying triggers and objections." },
  { num: 2, icon: "🎯", title: "Positioning Expert", desc: "Brand name suggestions, Jungian archetype, color palette with hex codes, taglines, and differentiation strategy." },
  { num: 3, icon: "💎", title: "Offer Architect",    desc: "Core offer pricing, upsell stack, guarantee messaging, and tiered packaging — built on Hormozi's value equation." },
  { num: 4, icon: "✍️",  title: "Copywriter",         desc: "Hero headlines, email subject lines, welcome email sequence, product descriptions, FAQs, and urgency hooks." },
  { num: 5, icon: "📢", title: "Ad Strategist",      desc: "Meta ad creatives, Google keyword lists, channel budget allocation, and an organic content pillar strategy." },
  { num: 6, icon: "🚀", title: "Launch Planner",     desc: "Week-by-week pre-launch milestones, day-by-day launch week plan, KPIs, and 6-month revenue projections." },
];

const FEATURES = [
  "Market size + growth rate","Competitor gap analysis","ICP persona breakdown",
  "Brand name suggestions","Color palette + rationale","Positioning statement",
  "Offer stack + pricing","Upsell sequence","Risk-reversing guarantee",
  "Hero headlines + CTAs","Email subject line bank","Welcome email sequence",
  "Meta ad creatives (3+)","Google keyword lists","Content pillars + hooks",
  "Pre-launch milestones","Day-by-day launch week","6-month revenue forecast",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-lg">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          AI Brand Architect
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2">Sign In</Link>
          <Link href="/signup" className="text-sm font-medium bg-primary text-primary-foreground rounded-md px-4 py-2 hover:bg-primary/90 transition-colors">Start Free Trial</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full">
          <Sparkles className="w-4 h-4" />6 AI Agents · 1 Complete Brand Strategy
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
          Your Full Ecommerce Brand<br />
          <span className="text-primary">Built in Under 2 Minutes</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Six specialized AI agents run in sequence — market analysis, positioning, offer architecture, copy, ad strategy, and a 90-day launch plan.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href="/signup" className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-md px-8 py-3 text-base font-medium hover:bg-primary/90 transition-colors">
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/pricing" className="inline-flex items-center justify-center gap-2 border border-input bg-background rounded-md px-8 py-3 text-base font-medium hover:bg-accent transition-colors">
            See Pricing
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">7-day free trial · No credit card required · Cancel anytime</p>
      </section>

      {/* Agents */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-center mb-2">Meet Your 6-Agent Brand Team</h2>
        <p className="text-center text-muted-foreground mb-10 text-sm">Each agent is a specialist. Each output feeds the next.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AGENTS.map((agent) => (
            <div key={agent.title} className="border rounded-xl p-5 bg-card hover:shadow-md hover:border-primary/30 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{agent.icon}</span>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Agent {agent.num}</p>
                  <p className="font-semibold text-sm">{agent.title}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{agent.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/signup" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-md px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors">
            Generate Your Brand Kit <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/40 border-y py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Everything in one output</h2>
          <p className="text-muted-foreground text-sm mb-10">18 deliverables. One generation run.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2 text-left">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /><span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-24 text-center space-y-4">
        <h2 className="text-3xl font-bold">Ready to build your brand?</h2>
        <p className="text-muted-foreground">Join founders and agencies cutting weeks of strategy work down to minutes.</p>
        <div className="pt-2">
          <Link href="/signup" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-md px-8 py-3 text-base font-medium hover:bg-primary/90 transition-colors">
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} AI Brand Architect.{" · "}
        <Link href="/pricing" className="hover:underline">Pricing</Link>{" · "}
        <a href="mailto:support@yourdomain.com" className="hover:underline">Support</a>
      </footer>
    </div>
  );
}
