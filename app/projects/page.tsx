import { createServerComponentSupabaseClient } from "../../lib/supabase/server";
import { getProjectIdsForSection, getProjects } from "../../lib/supabase/helpers";
import { buildStorageUrl } from "../../lib/supabase/storage";
import { ProjectsGridClient } from "../../components/projects/ProjectsGridClient";
import type { Database } from "../../lib/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

export default async function ProjectsPage() {
  const supabase = createServerComponentSupabaseClient();
  const projects = (await getProjects(supabase)) as ProjectRow[];
  const orderedProjectIds = await getProjectIdsForSection(
    supabase,
    "projects",
    "projects_list"
  );
  const projectImageRows = await supabase
    .from("project_images")
    .select("project_id,image_path,is_cover,order_index")
    .order("is_cover", { ascending: false })
    .order("order_index", { ascending: true });

  const imageMap = new Map<string, string>();
  for (const row of projectImageRows.data ?? []) {
    if (!row.project_id || imageMap.has(row.project_id)) continue;
    imageMap.set(row.project_id, buildStorageUrl(row.image_path));
  }

  const projectById = new Map(projects.map((project) => [project.id, project]));
  const orderedProjectsFromSection = orderedProjectIds
    .map((projectId) => projectById.get(projectId))
    .filter((project): project is ProjectRow => Boolean(project));
  const includedIds = new Set(orderedProjectsFromSection.map((project) => project.id));
  const missingProjects = projects.filter((project) => !includedIds.has(project.id));
  const displayProjects =
    orderedProjectsFromSection.length > 0
      ? [...orderedProjectsFromSection, ...missingProjects]
      : projects;

  return (
    <main className="space-y-24">
      <ProjectsGridClient
        projects={displayProjects.map((project) => ({
          id: project.id,
          name: project.name,
          address: project.address,
          city: project.city,
          district: project.district,
          amenities: project.amenities,
          price: project.price,
          status: project.status,
          imageUrl: imageMap.get(project.id) ?? null,
        }))}
      />
    </main>
  );
}
