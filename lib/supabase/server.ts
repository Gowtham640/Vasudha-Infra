import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions, SetAllCookies } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

type CookieList = Parameters<SetAllCookies>[0];

export type SupabaseDatabaseClient = SupabaseClient<Database>;

type NextCookieOptions = {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: "lax" | "strict" | "none";
  secure?: boolean;
};

/**
 * Maps Supabase cookie options to the shape Next.js `cookies().set` expects.
 */
const normalizeCookieOptions = (options?: CookieOptions): NextCookieOptions | undefined => {
  if (!options) {
    return undefined;
  }

  const mapped: NextCookieOptions = {};

  if (options.domain) {
    mapped.domain = options.domain;
  }
  if (options.expires) {
    mapped.expires = options.expires;
  }
  if (options.httpOnly) {
    mapped.httpOnly = options.httpOnly;
  }
  if (options.maxAge !== undefined) {
    mapped.maxAge = options.maxAge;
  }
  if (options.path) {
    mapped.path = options.path;
  }
  if (typeof options.sameSite === "string") {
    mapped.sameSite = options.sameSite;
  }
  if (options.secure) {
    mapped.secure = options.secure;
  }

  return Object.keys(mapped).length === 0 ? undefined : mapped;
};

/**
 * Cookie adapter for Route Handlers and Server Actions: reads and writes session cookies.
 * `setAll` is wrapped so unexpected contexts (e.g. mis-imported server client) do not crash the render.
 */
const buildRouteAndActionCookieMethods = () => ({
  getAll: async () => {
    const cookieStore = await cookies();
    return cookieStore.getAll().map((cookie) => ({
      name: cookie.name,
      value: cookie.value ?? "",
    }));
  },
  setAll: async (cookieList: CookieList) => {
    try {
      const cookieStore = await cookies();
      cookieList.forEach(({ name, value, options }) => {
        cookieStore.set(name, value ?? "", normalizeCookieOptions(options));
      });
    } catch (error) {
      // Next.js 16 only allows `cookies().set` in Route Handlers and Server Actions.
      // If this client is ever used elsewhere, swallowing avoids hard crashes (auth still may not persist).
      console.warn("[supabase] cookie setAll skipped (not in a mutable context)", error);
    }
  },
});

/**
 * Cookie adapter for Server Components: read cookies for session lookup.
 * `setAll` is a no-op so Supabase never attempts `cookies().set` during RSC render (avoids Next.js errors).
 */
const buildServerComponentCookieMethods = () => ({
  getAll: async () => {
    const cookieStore = await cookies();
    return cookieStore.getAll().map((cookie) => ({
      name: cookie.name,
      value: cookie.value ?? "",
    }));
  },
  setAll: async (cookieList: CookieList) => {
    // Intentionally empty: Server Components must not mutate cookies (Next.js 16).
    // Session refresh belongs in Route Handlers / Server Actions using `createServerSupabaseClient`.
    void cookieList;
  },
});

const createTypedServerClient = (
  cookieMethods: ReturnType<typeof buildRouteAndActionCookieMethods>
): SupabaseDatabaseClient =>
  createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: cookieMethods,
  });

/**
 * Use in Route Handlers and Server Actions when auth cookies may be written (OAuth, refresh, etc.).
 */
export function createServerSupabaseClient(): SupabaseDatabaseClient {
  return createTypedServerClient(buildRouteAndActionCookieMethods());
}

/**
 * Alias for API routes: same mutable cookie behavior as `createServerSupabaseClient`.
 */
export function createRouteSupabaseClient(): SupabaseDatabaseClient {
  return createTypedServerClient(buildRouteAndActionCookieMethods());
}

/**
 * Use in Server Components / layouts: reads auth cookies; never writes them during render.
 */
export function createServerComponentSupabaseClient(): SupabaseDatabaseClient {
  return createTypedServerClient(buildServerComponentCookieMethods());
}
