import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Sparkles, Clock, CheckCircle2, AlertCircle } from "lucide-react";

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

  const statusIcon = {
    complete:   <CheckCircle2 className="w-4 h-4 text-green-500" />,
    generating: <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />,
    failed:     <AlertCircle className="w-4 h-4 text-red-500" />,
    draft:      <Clock className="w-4 h-4 text-muted-foreground" />,
  } as const;

  const statusColor = {
    complete:   "default",
    generating: "secondary",
    failed:     "destructive",
    draft:      "outline",
  } as const;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Your AI-generated brand strategies
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="w-4 h-4 mr-2" />
            New Brand Kit
          </Link>
        </Button>
      </div>

      {(!projects || projects.length === 0) ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No brand kits yet</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">
                Create your first brand kit and let 6 AI agents build your complete
                ecommerce brand strategy.
              </p>
            </div>
            <Button asChild>
              <Link href="/projects/new">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Brand Kit
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base line-clamp-1">{project.name}</CardTitle>
                  <Badge variant={statusColor[project.status as keyof typeof statusColor] ?? "outline"}>
                    <span className="flex items-center gap-1">
                      {statusIcon[project.status as keyof typeof statusIcon]}
                      {project.status}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.product_idea}
                </p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span className="bg-muted px-2 py-0.5 rounded">{project.niche}</span>
                </div>
                <div className="pt-1">
                  {project.status === "complete" ? (
                    <Button asChild size="sm" className="w-full">
                      <Link href={`/brand-kit/${project.id}`}>View Brand Kit →</Link>
                    </Button>
                  ) : project.status === "generating" ? (
                    <Button size="sm" className="w-full" disabled>
                      <Clock className="w-3 h-3 mr-2 animate-spin" />
                      Generating...
                    </Button>
                  ) : (
                    <Button asChild size="sm" variant="outline" className="w-full">
                      <Link href={`/projects/${project.id}`}>View Project</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="border-dashed hover:border-primary/50 transition-colors">
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[180px]">
              <Button asChild variant="ghost">
                <Link href="/projects/new" className="flex flex-col gap-2 items-center">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                  <span className="text-muted-foreground text-sm">New Brand Kit</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
