export function buildStorageUrl(path: string | null | undefined) {
  if (!path) {
    return "";
  }

  if (path.startsWith("https://")) {
    return path;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!baseUrl) {
    return path;
  }

  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  return `${normalizedBase}/storage/v1/object/public/images/${path}`;
}
