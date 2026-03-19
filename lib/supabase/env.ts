const PLACEHOLDER_PATTERNS = ["your-", "example", "placeholder"];

const normalize = (value?: string) => value?.trim() ?? "";

const isLikelyPlaceholder = (value: string) =>
  PLACEHOLDER_PATTERNS.some((pattern) => value.toLowerCase().includes(pattern));

const isRealValue = (value: string) => Boolean(value) && !isLikelyPlaceholder(value);

const urlSource = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const keySource = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const SUPABASE_URL = normalize(urlSource);
export const SUPABASE_ANON_KEY = normalize(keySource);

export const hasSupabaseCredentials = isRealValue(SUPABASE_URL) && isRealValue(SUPABASE_ANON_KEY);

export const browserSupabaseHint = hasSupabaseCredentials
  ? null
  : "Set SUPABASE_URL and SUPABASE_ANON_KEY to real HTTPS values so Supabase integrations can run.";
