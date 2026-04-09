import { NextResponse } from "next/server";
import { createRouteSupabaseClient } from "../../../../../lib/supabase/server";
import {
  CMS_CONTENT_SECTION_NAMES,
  type CmsContentSectionName,
} from "../../../../../lib/types";

type PatchBody = {
  name: string;
  isVisible: boolean;
};

function isCmsName(name: string): name is CmsContentSectionName {
  return (CMS_CONTENT_SECTION_NAMES as readonly string[]).includes(name);
}

export async function PATCH(request: Request) {
  const supabase = createRouteSupabaseClient();

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { name, isVisible } = body;
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Section name is required." }, { status: 400 });
  }
  if (!isCmsName(name)) {
    return NextResponse.json({ error: "Section is not editable in Content Management." }, { status: 400 });
  }
  if (typeof isVisible !== "boolean") {
    return NextResponse.json({ error: "Visibility flag must be boolean." }, { status: 400 });
  }

  const { data: section, error: sectionError } = await supabase
    .from("sections")
    .select("id")
    .eq("name", name)
    .maybeSingle();

  if (sectionError || !section?.id) {
    return NextResponse.json({ error: "Section not found." }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from("sections")
    .update({ is_visible: isVisible })
    .eq("id", section.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

