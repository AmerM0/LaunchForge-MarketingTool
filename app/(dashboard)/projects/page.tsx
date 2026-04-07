import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default async function ProjectsPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const statusIcon: Record<string, React.ReactNode> = {
    complete:   <CheckCircle2 className="w-4 h-4 text-green-500" />,
    generating: <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />,
    failed:     <AlertCircle className="w-4 h-4 text-red-500" />,
    draft:      <Clock className="w-4 h-4 text-muted-foreground" />,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Projects</h1>
          <p className="text-muted-foreground mt-1">{projects?.length ?? 0} brand kits total</p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="w-4 h-4 mr-2" /> New Brand Kit
          </Link>
        </Button>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Project</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Niche</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {projects?.map((project) => (
              <tr key={project.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium">{project.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{project.product_idea}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{project.niche}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5">
                    {statusIcon[project.status]}
                    <span className="capitalize">{project.status}</span>
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                  {new Date(project.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  {project.status === "complete" ? (
                    <Button size="sm" asChild>
                      <Link href={`/brand-kit/${project.id}`}>View Kit →</Link>
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/projects/${project.id}`}>Details</Link>
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {(!projects || projects.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  No projects yet.{" "}
                  <Link href="/projects/new" className="text-primary hover:underline">
                    Create your first brand kit →
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
