import { NextResponse } from "next/server";
import { createRouteSupabaseClient } from "../../../../../lib/supabase/server";

type UpdateUserRolePayload = {
  userId?: string;
  role?: "admin" | "user";
};

export async function PATCH(request: Request) {
  const supabase = createRouteSupabaseClient();
  const payload = (await request.json()) as UpdateUserRolePayload;

  if (!payload.userId || !payload.role) {
    return NextResponse.json({ error: "userId and role are required." }, { status: 400 });
  }

  if (payload.role !== "admin" && payload.role !== "user") {
    return NextResponse.json({ error: "Role must be admin or user." }, { status: 400 });
  }

  const { data: isOwner, error: ownerCheckError } = await supabase.rpc("is_owner");
  if (ownerCheckError || !isOwner) {
    return NextResponse.json({ error: "Only owner can update user roles." }, { status: 403 });
  }

  const { error } = await supabase
    .from("users")
    .update({ role: payload.role })
    .eq("id", payload.userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
