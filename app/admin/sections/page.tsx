import { createServerComponentSupabaseClient } from "../../../lib/supabase/server";
import { ProjectSectionManager } from "../../../components/admin/ProjectSectionManager";
import type { Database } from "../../../lib/types";

type ProjectRow = Pick<
  Database["public"]["Tables"]["projects"]["Row"],
  "id" | "name" | "created_at"
>;

export default async function AdminSectionsPage() {
  const supabase = createServerComponentSupabaseClient();

  const projectsResponse = await supabase
    .from("projects")
    .select("id, name, created_at")
    .order("created_at", { ascending: true });

  const pagesResponse = await supabase
    .from("pages")
    .select("id, slug")
    .in("slug", ["home", "projects"]);

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

  return (
    <main className="pt-10">
      <ProjectSectionManager
        projects={projects.map((project) => ({ id: project.id, name: project.name }))}
        initialProjectsPageOrder={projectsPageOrderIds}
        initialHomeSelection={selectedHomeIds}
      />
    </main>
  );
}
