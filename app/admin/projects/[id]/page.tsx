import { notFound } from "next/navigation";
import { createServerComponentSupabaseClient } from "../../../../lib/supabase/server";
import { ProjectEditor } from "../../../../components/admin/ProjectEditor";

type Props = {
  params: {
    id: string;
  };
};

export default async function AdminProjectDetailPage({ params }: Props) {
  // Fix: Cookies can only be modified in a Server Action or Route Handler.
  // Server Component: read-only Supabase client (no cookie writes during render).
  const supabase = createServerComponentSupabaseClient();

  if (params.id === "new") {
    return (
      <ProjectEditor
        isNew
        project={{
          id: "",
          name: "",
          slug: "",
          description: "",
          status: "available",
          price: null,
          address: "",
          landmark: "",
          map_embed_url: "",
          city: "",
          district: "",
          amenities: [],
        }}
        images={[]}
      />
    );
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, slug, description, status, price, address, landmark, map_embed_url, city, district, amenities")
    .eq("id", params.id)
    .maybeSingle();

  if (!project) {
    notFound();
  }

  const { data: images } = await supabase
    .from("project_images")
    .select("id, image_path, order_index, alt_text, is_cover")
    .eq("project_id", params.id)
    .order("order_index", { ascending: true });

  return <ProjectEditor project={project} images={images ?? []} />;
}
