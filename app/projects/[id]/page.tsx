import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "../../../lib/supabase/client";
import { getProjectById, getProjectImages } from "../../../lib/supabase/helpers";
import type { Database } from "../../../lib/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
import { ProjectDetail } from "../../../components/projects/ProjectDetail";

type Props = {
  params: {
    id: string;
  };
};

export default async function ProjectDetailPage({ params }: Props) {
  const supabase = createServerSupabaseClient() as any;
  const project = (await getProjectById(supabase, params.id)) as ProjectRow | null;

  if (!project) {
    notFound();
  }

  const images = await getProjectImages(supabase, params.id);

  return (
    <main className="pt-10 space-y-24">
      {/* pt-10 -> controls distance from navbar/top */}
      {/* space-y-24 -> controls spacing between sections (global layout control) */}
      <ProjectDetail
        project={{
          ...project,
          project_images: images,
        }}
      />
    </main>
  );
}
