import { NextResponse } from "next/server";
import { createRouteSupabaseClient } from "../../../../../lib/supabase/server";

type PatchBody = {
  homeProjectsVisible: boolean;
  projectsListVisible: boolean;
};

export async function PATCH(request: Request) {
  const supabase = createRouteSupabaseClient();

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { homeProjectsVisible, projectsListVisible } = body;
  if (typeof homeProjectsVisible !== "boolean" || typeof projectsListVisible !== "boolean") {
    return NextResponse.json(
      { error: "Both visibility booleans are required." },
      { status: 400 }
    );
  }

  const pagesResponse = await supabase
    .from("pages")
    .select("id, slug")
    .in("slug", ["home", "projects"]);

  if (pagesResponse.error) {
    return NextResponse.json({ error: pagesResponse.error.message }, { status: 500 });
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
    return NextResponse.json({ error: sectionsResponse.error.message }, { status: 500 });
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

  const updateHome = await supabase
    .from("sections")
    .update({ is_visible: homeProjectsVisible })
    .eq("id", homeSectionId);

  if (updateHome.error) {
    return NextResponse.json({ error: updateHome.error.message }, { status: 500 });
  }

  const updateProjects = await supabase
    .from("sections")
    .update({ is_visible: projectsListVisible })
    .eq("id", projectsSectionId);

  if (updateProjects.error) {
    return NextResponse.json({ error: updateProjects.error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

