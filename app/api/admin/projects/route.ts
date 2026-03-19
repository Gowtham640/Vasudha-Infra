import { NextResponse } from "next/server";
import { createRouteSupabaseClient } from "../../../../lib/supabase/client";
import type { Database } from "../../../../lib/types";

type ProjectUpdatePayload = {
  id: string;
  name: string;
  status: string | null;
  price: number | null;
};

export async function PATCH(request: Request) {
  const supabase = createRouteSupabaseClient();
  const payload = (await request.json()) as ProjectUpdatePayload;

  const updateData: Database["public"]["Tables"]["projects"]["Update"] = {
    name: payload.name,
    status: payload.status,
    price: payload.price,
  };

  const { error } = await (supabase as any)
    .from("projects")
    .update(updateData)
    .eq("id", payload.id);

  if (error) {
    console.error("admin project update failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
