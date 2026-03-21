import { createServerComponentSupabaseClient } from "../../../lib/supabase/server";
import type { Database } from "../../../lib/types";
import { ProjectsManager } from "../../../components/admin/ProjectsManager";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type ProjectImageRow = Database["public"]["Tables"]["project_images"]["Row"];
type ProjectImageForEditor = Pick<
  ProjectImageRow,
  "id" | "image_path" | "order_index" | "alt_text" | "is_cover"
>;

type ProjectEditorProject = Pick<
  ProjectRow,
  "id" | "name" | "slug" | "description" | "status" | "price" | "address" | "landmark" | "map_embed_url"
>;

export default async function AdminProjectsPage() {
  // Fix: Cookies can only be modified in a Server Action or Route Handler.
  // Server Component: read-only Supabase client (no cookie writes during render).
  const supabase = createServerComponentSupabaseClient();
  const projectsResponse = await supabase
    .from("projects")
    .select("id, name, slug, description, status, price, address, landmark, map_embed_url")
    .order("created_at", { ascending: false });
  const projects = (projectsResponse.data ?? []) as ProjectEditorProject[];

  const projectsWithImages = await Promise.all(
    projects.map(async (project) => {
      const imagesResponse = await supabase
        .from("project_images")
        .select("id, image_path, order_index, alt_text, is_cover")
        .eq("project_id", project.id)
        .order("order_index", { ascending: true });

      const projectImages = (imagesResponse.data ?? []) as ProjectImageForEditor[];

      return { ...project, project_images: projectImages };
    })
  );

  return <ProjectsManager projects={projectsWithImages} />;
}
