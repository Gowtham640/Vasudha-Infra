"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

export type BrowserSupabaseClient = SupabaseClient<Database>;

/**
 * Browser-only Supabase client. Import this file only from Client Components (`"use client"`).
 * Server code must use `lib/supabase/server.ts` instead.
 */
export function createBrowserSupabaseClient(): BrowserSupabaseClient {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
}
