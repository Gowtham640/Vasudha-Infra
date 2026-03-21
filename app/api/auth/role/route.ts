import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "../../../../lib/supabase/server";

export async function GET() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ role: null });
  }

  // Mirror the same functions your RLS policies rely on.
  // This avoids direct reads from `public.users` which may be restricted by RLS.
  let isOwner = false;
  let isAdmin = false;

  try {
    const { data } = await supabase.rpc("is_owner");
    isOwner = Boolean(data);
  } catch {
    isOwner = false;
  }

  try {
    const { data } = await supabase.rpc("is_admin");
    isAdmin = Boolean(data);
  } catch {
    isAdmin = false;
  }

  const role = isOwner ? "owner" : isAdmin ? "admin" : "user";
  return NextResponse.json({ role });
}

