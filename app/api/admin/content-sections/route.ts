import { NextResponse } from "next/server";
import { createRouteSupabaseClient } from "../../../../lib/supabase/server";
import { assertValidCmsTiptapDoc } from "../../../../lib/tiptap/cmsDoc";
import {
  CMS_CONTENT_SECTION_NAMES,
  type CmsContentSectionName,
  type Json,
} from "../../../../lib/types";

const logContent = (step: string, detail?: Record<string, unknown>) => {
  console.log(`[api/admin/content-sections] ${step}`, detail !== undefined ? JSON.stringify(detail) : "");
};

function isCmsName(name: string): name is CmsContentSectionName {
  return (CMS_CONTENT_SECTION_NAMES as readonly string[]).includes(name);
}

export async function GET() {
  const supabase = createRouteSupabaseClient();
  const { data: sections, error: sectionsError } = await supabase
    .from("sections")
    .select("id, name, label")
    .in("name", [...CMS_CONTENT_SECTION_NAMES])
    .order("label", { ascending: true });

  if (sectionsError) {
    logContent("GET sections error", { message: sectionsError.message });
    return NextResponse.json({ error: sectionsError.message }, { status: 500 });
  }

  const rows = sections ?? [];
  const ids = rows.map((row) => row.id);

  const { data: contents, error: contentsError } = await supabase
    .from("section_content")
    .select("section_id, content, updated_at")
    .in("section_id", ids)
    .is("project", null);

  if (contentsError) {
    logContent("GET section_content error", { message: contentsError.message });
    return NextResponse.json({ error: contentsError.message }, { status: 500 });
  }

  const contentBySection = new Map<string, { content: unknown; updated_at: string | null }>();
  for (const row of contents ?? []) {
    if (!row.section_id) {
      continue;
    }
    contentBySection.set(row.section_id, {
      content: row.content ?? null,
      updated_at: row.updated_at ?? null,
    });
  }

  const payload = rows.map((section) => {
    const row = contentBySection.get(section.id);
    return {
      name: section.name,
      label: section.label,
      content: row?.content ?? null,
      updated_at: row?.updated_at ?? null,
    };
  });

  return NextResponse.json({ sections: payload });
}

type PatchBody = {
  name: string;
  content: unknown;
};

export async function PATCH(request: Request) {
  const supabase = createRouteSupabaseClient();
  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { name, content } = body;
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Section name is required." }, { status: 400 });
  }
  if (!isCmsName(name)) {
    return NextResponse.json({ error: "Section is not editable in Content Management." }, { status: 400 });
  }

  try {
    assertValidCmsTiptapDoc(content);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid document.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { data: section, error: sectionError } = await supabase
    .from("sections")
    .select("id")
    .eq("name", name)
    .maybeSingle();

  if (sectionError || !section?.id) {
    logContent("PATCH section lookup failed", { name, message: sectionError?.message });
    return NextResponse.json({ error: "Section not found." }, { status: 404 });
  }

  const { data: existing, error: existingError } = await supabase
    .from("section_content")
    .select("id")
    .eq("section_id", section.id)
    .is("project", null)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (existing?.id) {
    const { error: updateError } = await supabase
      .from("section_content")
      .update({ content: content as Json, updated_at: new Date().toISOString() })
      .eq("id", existing.id);

    if (updateError) {
      logContent("PATCH update failed", { message: updateError.message });
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  } else {
    const { error: insertError } = await supabase.from("section_content").insert({
      section_id: section.id,
      content: content as Json,
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      logContent("PATCH insert failed", { message: insertError.message });
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  logContent("PATCH ok", { name });
  return NextResponse.json({ success: true });
}
