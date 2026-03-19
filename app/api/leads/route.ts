import { NextResponse } from "next/server";
import { createRouteSupabaseClient } from "../../../lib/supabase/client";
import { logEvent, insertLead } from "../../../lib/supabase/helpers";

export async function POST(request: Request) {
  const payload = await request.json();
  const supabase = createRouteSupabaseClient();
  const success = await insertLead(supabase, {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    message: payload.message,
    project_id: payload.project_id,
  });

  await logEvent(supabase, "lead_submission", { name: payload.name, projectId: payload.project_id });

  if (!success) {
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
