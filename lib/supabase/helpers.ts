import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database, SectionKey } from "../types";

export type SupabaseDatabaseClient = SupabaseClient<Database>;

const hasName = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const resolveUserName = (user: User) => {
  const metadata = user.user_metadata as Record<string, unknown> | null;
  if (metadata) {
    if (hasName(metadata.full_name)) {
      return metadata.full_name;
    }
    if (hasName(metadata.name)) {
      return metadata.name;
    }
    if (hasName(metadata.username)) {
      return metadata.username;
    }
    if (hasName(metadata.given_name) && hasName(metadata.family_name)) {
      return `${metadata.given_name} ${metadata.family_name}`;
    }
    if (hasName(metadata.given_name)) {
      return metadata.given_name;
    }
  }

  return user.email ?? "Vasudha User";
};

export async function ensurePublicUser(
  supabase: SupabaseDatabaseClient,
  user: User | null | undefined
) {
  if (!user?.id) {
    return;
  }

  const {
    data: existingUser,
    error: fetchError,
  } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (fetchError) {
    console.error("ensurePublicUser(fetch)", fetchError);
    return;
  }

  if (existingUser) {
    return;
  }

  const { error: insertError } = await supabase.from("users").insert({
    id: user.id,
    name: resolveUserName(user),
    email: user.email ?? "",
    role: "user",
  });

  if (insertError && insertError.code !== "23505") {
    console.error("ensurePublicUser(insert)", insertError);
  }
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

  if (!section?.id) {
    return null;
  }

  const { data: sectionContent, error: sectionContentError } = await supabase
    .from("section_content")
    .select("content")
    .eq("section_id", section.id)
    .maybeSingle();

  if (sectionContentError) {
    console.error("getSectionContent", key, sectionContentError);
    return null;
  }

  if (!sectionContent?.content) {
    return null;
  }

  return {
    ...section,
    content: sectionContent.content,
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
  const { error } = await supabase.from("leads").insert({
    name: payload.name ?? null,
    phone: payload.phone ?? null,
    email: payload.email ?? null,
    message: payload.message ?? null,
    project_id: payload.project_id ?? null,
  });

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
  const { error } = await supabase.from("logs").insert({
    event,
    metadata: metadata ?? null,
  });

  if (error) {
    console.error("logEvent", error);
  }
}
