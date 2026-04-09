import { createServerComponentSupabaseClient } from "../../../lib/supabase/server";
import { ProjectSectionManager } from "../../../components/admin/ProjectSectionManager";
import { ContentManagementClient } from "../../../components/admin/ContentManagementClient";
import type { Database } from "../../../lib/types";
import { buildStorageUrl } from "../../../lib/supabase/storage";

type ProjectRow = Pick<
  Database["public"]["Tables"]["projects"]["Row"],
  "id" | "name" | "address" | "price" | "created_at"
>;

export default async function AdminSectionsPage() {
  const supabase = createServerComponentSupabaseClient();

  const [projectsResponse, pagesResponse, projectImagesResponse] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, address, price, created_at")
      .order("created_at", { ascending: true }),
    supabase.from("pages").select("id, slug").in("slug", ["home", "projects"]),
    supabase
      .from("project_images")
      .select("project_id, image_path, order_index")
      .order("order_index", { ascending: true }),
  ]);

  const projects = (projectsResponse.data ?? []) as ProjectRow[];
  const pages = (pagesResponse.data ?? []) as Array<{ id: string; slug: string }>;
  const pageIdBySlug = new Map(pages.map((page) => [page.slug, page.id]));

  const sectionPageIds = [
    pageIdBySlug.get("home"),
    pageIdBySlug.get("projects"),
  ].filter((id): id is string => Boolean(id));
  const sectionsResponse = sectionPageIds.length
    ? await supabase
        .from("sections")
        .select("id, page_id, type")
        .in("page_id", sectionPageIds)
        .in("type", ["home_projects", "projects_list"])
    : { data: [] as Array<{ id: string; page_id: string | null; type: string }> };

  const sectionRows = (sectionsResponse.data ?? []) as Array<{
    id: string;
    page_id: string | null;
    type: string;
  }>;

  const homeProjectsSectionId =
    sectionRows.find(
      (row) => row.page_id === pageIdBySlug.get("home") && row.type === "home_projects"
    )?.id ?? "";
  const projectsListSectionId =
    sectionRows.find(
      (row) =>
        row.page_id === pageIdBySlug.get("projects") && row.type === "projects_list"
    )?.id ?? "";

  const sectionIds = [homeProjectsSectionId, projectsListSectionId].filter(Boolean);
  const sectionContentResponse = sectionIds.length
    ? await supabase
        .from("section_content")
        .select("section_id, order, project")
        .in("section_id", sectionIds)
        .order("order", { ascending: true })
    : { data: [] as Array<{ section_id: string | null; order: number | null; project: string | null }> };

  const contentRows = (sectionContentResponse.data ?? []) as Array<{
    section_id: string | null;
    project: string | null;
  }>;

  const defaultOrderIds = projects.map((project) => project.id);
  const projectsPageIdsFromTable = contentRows
    .filter((row) => row.section_id === projectsListSectionId)
    .map((row) => row.project)
    .filter((id): id is string => Boolean(id));
  const selectedHomeIds = contentRows
    .filter((row) => row.section_id === homeProjectsSectionId)
    .map((row) => row.project)
    .filter((id): id is string => Boolean(id));

  const seen = new Set(projectsPageIdsFromTable);
  const projectsPageOrderIds = [
    ...projectsPageIdsFromTable,
    ...defaultOrderIds.filter((id) => !seen.has(id)),
  ];

  const imageMap = new Map<string, string>();
  for (const row of projectImagesResponse.data ?? []) {
    if (!row.project_id || imageMap.has(row.project_id)) {
      continue;
    }
    imageMap.set(row.project_id, buildStorageUrl(row.image_path));
  }

  const projectById = new Map(projects.map((project) => [project.id, project]));
  const homePreviewProjects = selectedHomeIds
    .map((projectId) => projectById.get(projectId))
    .filter((project): project is ProjectRow => Boolean(project))
    .map((project) => ({
      id: project.id,
      name: project.name,
      address: project.address,
      price: project.price,
      imageUrl: imageMap.get(project.id) ?? null,
    }));

  return (
    <main className="w-full min-w-0 max-w-full space-y-10 overflow-x-hidden">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">Project Sections</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Site copy, featured projects on the home page, and project listing order.
        </p>
      </header>

      <ContentManagementClient homePreviewProjects={homePreviewProjects} />
      <ProjectSectionManager
        projects={projects.map((project) => ({ id: project.id, name: project.name }))}
        initialProjectsPageOrder={projectsPageOrderIds}
        initialHomeSelection={selectedHomeIds}
      />
    </main>
  );
}
