import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import BrandKitDisplay from "@/components/brand-kit/BrandKitDisplay";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Next.js 15+/16: params is a Promise
interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function BrandKitPage({ params }: Props) {
  const { projectId } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: brandKit } = await supabase
    .from("brand_kits")
    .select("*, projects(name, product_idea, niche)")
    .eq("project_id", projectId)
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!brandKit) notFound();

  const kit = brandKit as any;
  const project = kit.projects;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight mt-2">
            {project?.name ?? "Brand Kit"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {project?.niche} · Generated in{" "}
            {kit.generation_time_ms
              ? `${Math.round(kit.generation_time_ms / 1000)}s`
              : "—"}
          </p>
        </div>
      </div>

      <BrandKitDisplay brandKit={kit} />
    </div>
  );
}
