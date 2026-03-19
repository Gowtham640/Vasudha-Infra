import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "../../../../lib/supabase/client";
import { ProjectEditor } from "../../../../components/admin/ProjectEditor";

type Props = {
  params: {
    id: string;
  };
};

export default async function AdminProjectDetailPage({ params }: Props) {
  const supabase = createServerSupabaseClient() as any;
  const { data: project } = await supabase
    .from("projects")
    .select("id, name, description, status, price")
    .eq("id", params.id)
    .maybeSingle();

  if (!project) {
    notFound();
  }

  return <ProjectEditor project={project} />;
}
