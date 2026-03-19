import type { CookieOptions, SetAllCookies } from "@supabase/ssr";

type CookieList = Parameters<SetAllCookies>[0];
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "../types";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

type NextCookieOptions = {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: "lax" | "strict" | "none";
  secure?: boolean;
};

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

const buildCookieMethods = () => {
  const requestCookies = () => cookies();

  return {
    getAll: async () =>
      (await requestCookies())
        .getAll()
        .map((cookie) => ({
          name: cookie.name,
          value: cookie.value ?? "",
        })),
    setAll: async (cookieList: CookieList) => {
      const cookieStore = await requestCookies();
      cookieList.forEach(({ name, value, options }) => {
        cookieStore.set(name, value ?? "", normalizeCookieOptions(options));
      });
    },
  };
};

const createSupabaseServerClient = () =>
  createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: buildCookieMethods(),
  });

export const createServerSupabaseClient = () => createSupabaseServerClient();
export const createRouteSupabaseClient = () => createSupabaseServerClient();
