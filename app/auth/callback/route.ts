import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error");

  if (oauthError || !code) {
    // OAuth failed or callback is missing required `code`.
    redirect("/login");
  }

  const supabase = createServerSupabaseClient();

  // Exchange OAuth `code` for Supabase session (sets auth cookies).
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    console.error("OAuth exchangeCodeForSession failed", exchangeError);
    redirect("/login");
  }

  // Success => home page.
  redirect("/");
}

