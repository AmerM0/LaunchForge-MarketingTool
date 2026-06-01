import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import RegenerateButton from "@/components/brand/RegenerateButton";

// Next.js 15+/16: params is a Promise
interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!project) notFound();

  const statusColor: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    complete:   "default",
    generating: "secondary",
    failed:     "destructive",
    draft:      "outline",
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/projects"><ArrowLeft className="w-4 h-4 mr-2" />All Projects</Link>
        </Button>
        <div className="flex items-center gap-3 mt-3">
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <Badge variant={statusColor[project.status] ?? "outline"} className="capitalize">
            {project.status}
          </Badge>
        </div>
      </div>

      <div className="border rounded-xl p-5 space-y-4">
        {[
          { label: "Product Idea",     value: project.product_idea },
          { label: "Niche",            value: project.niche },
          { label: "Target Audience",  value: project.target_audience },
          { label: "Budget Range",     value: project.budget_range ?? "—" },
          { label: "Competitors",      value: project.competitors?.join(", ") ?? "—" },
          { label: "Unique Selling Point", value: project.unique_selling_point ?? "—" },
        ].map(({ label, value }) => (
          <div key={label} className="grid grid-cols-3 gap-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-sm col-span-2">{value}</p>
          </div>
        ))}
      </div>

      {project.status === "complete" && (
        <Button asChild size="lg" className="w-full gap-2">
          <Link href={`/brand-kit/${project.id}`}>
            <Sparkles className="w-4 h-4" /> View Brand Kit
          </Link>
        </Button>
      )}

      {(project.status === "draft" || project.status === "failed") && (
        <div className="space-y-3">
          {project.status === "failed" && (
            <p className="text-sm text-muted-foreground text-center">
              Generation failed — your details are saved. Click below to try again.
            </p>
          )}
          <RegenerateButton project={{
            id:                   project.id,
            product_idea:         project.product_idea,
            niche:                project.niche,
            target_audience:      project.target_audience,
            budget_range:         project.budget_range,
            competitors:          project.competitors,
            unique_selling_point: project.unique_selling_point,
          }} />
        </div>
      )}
    </div>
  );
}
