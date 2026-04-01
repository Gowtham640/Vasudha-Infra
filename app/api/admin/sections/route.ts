import { NextResponse } from "next/server";
import { createRouteSupabaseClient } from "../../../../lib/supabase/server";
 
type SectionProjectOrderPayload = {
  homeProjectIds: string[];
  projectsPageOrderIds: string[];
};

export async function PATCH(request: Request) {
  const supabase = createRouteSupabaseClient();
  const payload = (await request.json()) as SectionProjectOrderPayload;
  const homeProjectIds = Array.from(new Set(payload.homeProjectIds ?? []));
  const projectsPageOrderIds = Array.from(
    new Set(payload.projectsPageOrderIds ?? [])
  );

  const pagesResponse = await supabase
    .from("pages")
    .select("id, slug")
    .in("slug", ["home", "projects"]);
  if (pagesResponse.error) {
    return NextResponse.json(
      { error: pagesResponse.error.message },
      { status: 500 }
    );
  }
  const pages = pagesResponse.data ?? [];
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
    : { data: [], error: null };
  if (sectionsResponse.error) {
    return NextResponse.json(
      { error: sectionsResponse.error.message },
      { status: 500 }
    );
  }

  const sectionRows = (sectionsResponse.data ?? []) as Array<{
    id: string;
    page_id: string | null;
    type: string;
  }>;
  const homeSectionId =
    sectionRows.find(
      (row) => row.page_id === pageIdBySlug.get("home") && row.type === "home_projects"
    )?.id ?? "";
  const projectsSectionId =
    sectionRows.find(
      (row) =>
        row.page_id === pageIdBySlug.get("projects") && row.type === "projects_list"
    )?.id ?? "";

  if (!homeSectionId || !projectsSectionId) {
    return NextResponse.json(
      { error: "Required project sections not found." },
      { status: 400 }
    );
  }

  const projectsResponse = await supabase
    .from("projects")
    .select("id")
    .order("created_at", { ascending: true });

  if (projectsResponse.error) {
    return NextResponse.json(
      { error: projectsResponse.error.message },
      { status: 500 }
    );
  }

  const allProjectIds = (projectsResponse.data ?? []).map((project) => project.id);
  const validProjectIdSet = new Set(allProjectIds);

  const safeHomeIds = homeProjectIds.filter((id) => validProjectIdSet.has(id));
  const safeOrderedProjects = projectsPageOrderIds.filter((id) =>
    validProjectIdSet.has(id)
  );
  const safeOrderedSet = new Set(safeOrderedProjects);
  const finalProjectsOrder = [
    ...safeOrderedProjects,
    ...allProjectIds.filter((id) => !safeOrderedSet.has(id)),
  ];

  const clearHome = await supabase
    .from("section_content")
    .delete()
    .eq("section_id", homeSectionId);
  if (clearHome.error) {
    return NextResponse.json({ error: clearHome.error.message }, { status: 500 });
  }

  if (safeHomeIds.length > 0) {
    const homeRows = safeHomeIds.map((projectId, index) => ({
      section_id: homeSectionId,
      order: index,
      project: projectId,
    }));
    const insertHome = await supabase.from("section_content").insert(homeRows);
    if (insertHome.error) {
      return NextResponse.json({ error: insertHome.error.message }, { status: 500 });
    }
  }

  const clearProjects = await supabase
    .from("section_content")
    .delete()
    .eq("section_id", projectsSectionId);
  if (clearProjects.error) {
    return NextResponse.json(
      { error: clearProjects.error.message },
      { status: 500 }
    );
  }

  if (finalProjectsOrder.length > 0) {
    const projectsRows = finalProjectsOrder.map((projectId, index) => ({
      section_id: projectsSectionId,
      order: index,
      project: projectId,
    }));
    const insertProjects = await supabase.from("section_content").insert(projectsRows);
    if (insertProjects.error) {
      return NextResponse.json(
        { error: insertProjects.error.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true });
}
