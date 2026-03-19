import { NextResponse } from "next/server";
import { createRouteSupabaseClient } from "../../../../lib/supabase/client";
import type { Database } from "../../../../lib/types";

type SectionContentUpdatePayload = {
  section_id: string;
  content: Database["public"]["Tables"]["section_content"]["Row"]["content"];
};

export async function PATCH(request: Request) {
  const supabase = createRouteSupabaseClient();
  const { section_id, content } = (await request.json()) as SectionContentUpdatePayload;

  const { error } = await (supabase as any)
    .from("section_content")
    .update({ content })
    .eq("section_id", section_id);

  if (error) {
    console.error("section update failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
