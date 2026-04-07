import ProjectForm from "@/components/forms/ProjectForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewProjectPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New Brand Kit</h1>
        <p className="text-muted-foreground mt-2">
          Tell the AI agents about your product. They'll build a complete brand
          strategy — market analysis, positioning, offer, copy, ads, and a
          90-day launch plan.
        </p>
      </div>

      <div className="bg-muted/40 border rounded-xl p-4">
        <p className="text-sm font-medium mb-3">What gets generated:</p>
        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          {[
            "🔍 Market Analysis",
            "🎯 Brand Positioning",
            "💎 Offer Architecture",
            "✍️  Conversion Copy",
            "📢 Ad Strategy",
            "🚀 90-Day Launch Plan",
          ].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 border-t pt-3">
          ⏱ Generation takes ~90 seconds. Don't close this tab.
        </p>
      </div>

      <ProjectForm />
    </div>
  );
}
