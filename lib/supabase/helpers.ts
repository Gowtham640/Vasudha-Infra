import type { Database, SectionKey, Json } from "../types";
import type { SupabaseDatabaseClient } from "./server";

/**
 * Determines whether the authenticated user already has a public profile.
 */
export async function hasPublicUser(
  supabase: SupabaseDatabaseClient,
  userId?: string | null
): Promise<boolean> {
  if (!userId) {
    return false;
  }

  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("hasPublicUser", error);
    return false;
  }

  const typedData = data as { id?: string } | null;
  return Boolean(typedData?.id);
}

export async function getSectionContent(
  supabase: SupabaseDatabaseClient,
  key: SectionKey
) {
  const { data: section, error: sectionError } = await supabase
    .from("sections")
    .select("id, type, is_visible, order_index, page_id")
    .eq("type", key)
    .limit(1)
    .maybeSingle();

  if (sectionError) {
    console.error("getSectionContent", key, sectionError);
    return null;
  }

  const typedSection = section as (Record<string, unknown> & { id?: string }) | null;

  if (!typedSection?.id) {
    return null;
  }

  const { data: sectionContent, error: sectionContentError } = await supabase
    .from("section_content")
    .select("content")
    .eq("section_id", typedSection.id)
    .maybeSingle();

  if (sectionContentError) {
    console.error("getSectionContent", key, sectionContentError);
    return null;
  }

  const typedSectionContent = sectionContent as (Record<string, unknown> & { content?: Json }) | null;

  if (!typedSectionContent?.content) {
    return null;
  }

  return {
    ...typedSection,
    content: typedSectionContent.content,
  };
}

export async function getPageMetadata(
  supabase: SupabaseDatabaseClient,
  slug: string
) {
  const { data, error } = await supabase
    .from("pages")
    .select("title, seo_title, seo_description")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getPageMetadata:", error);
    return null;
  }

  return data;
}

export async function getProjects(
  supabase: SupabaseDatabaseClient,
  filter?: { featured?: boolean }
) {
  const query = supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: true });

  if (filter?.featured) {
    query.eq("status", "featured");
  }

  const { data, error } = await query;

  if (error) {
    console.error("getProjects", error);
    return [];
  }

  return data ?? [];
}

export async function getProjectById(
  supabase: SupabaseDatabaseClient,
  id: string
) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getProjectById", error);
    return null;
  }

  return data;
}

export async function getProjectImages(
  supabase: SupabaseDatabaseClient,
  projectId: string
) {
  const { data, error } = await supabase
    .from("project_images")
    .select("*")
    .eq("project_id", projectId)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("getProjectImages", error);
    return [];
  }

  return data ?? [];
}

export async function insertLead(
  supabase: SupabaseDatabaseClient,
  payload: {
    name?: string;
    phone?: string;
    email?: string;
    message?: string;
    project_id?: string;
  }
) {
  const row: Database["public"]["Tables"]["leads"]["Insert"] = {
    name: payload.name ?? null,
    phone: payload.phone ?? null,
    email: payload.email ?? null,
    message: payload.message ?? null,
    project_id: payload.project_id ?? null,
  };

  const { error } = await supabase.from("leads").insert(row);

  if (error) {
    console.error("insertLead", error);
    return false;
  }

  return true;
}

export async function logEvent(
  supabase: SupabaseDatabaseClient,
  event: string,
  metadata?: Record<string, unknown>
) {
  const row: Database["public"]["Tables"]["logs"]["Insert"] = {
    event,
    metadata: (metadata ?? null) as Json,
  };

  const { error } = await supabase.from("logs").insert(row);

  if (error) {
    console.error("logEvent", error);
  }
}
