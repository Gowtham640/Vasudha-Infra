import { NextResponse } from "next/server";
import { createRouteSupabaseClient } from "../../../lib/supabase/client";
import { logEvent } from "../../../lib/supabase/helpers";

export async function POST(request: Request) {
  const payload = await request.json();
  const supabase = createRouteSupabaseClient();
  await logEvent(supabase, payload.event, payload.metadata);
  return NextResponse.json({ success: true });
}
