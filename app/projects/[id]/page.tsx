import { notFound } from "next/navigation";
import { createServerComponentSupabaseClient } from "../../../lib/supabase/server";
import { getProjectById, getProjectImages } from "../../../lib/supabase/helpers";
import type { Database } from "../../../lib/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
import { ProjectDetail } from "../../../components/projects/ProjectDetail";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  // Fix: Cookies can only be modified in a Server Action or Route Handler.
  // Server Component: read-only Supabase client (no cookie writes during render).
  if (!id) {
    console.log("ID is undefined"); // debug
    notFound();
  }
  const supabase = createServerComponentSupabaseClient();
  const project = (await getProjectById(supabase, id)) as ProjectRow | null;

  if (!project) {
    notFound();
  }

  const images = await getProjectImages(supabase, id);

  return (
    <main className="space-y-24">
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
