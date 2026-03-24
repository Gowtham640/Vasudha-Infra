/**
 * Google Maps (and similar) embed snippets often paste as a full <iframe> tag.
 * The database and public iframe only need the `src` URL.
 */

/** Decode common HTML entities inside an attribute value (e.g. &amp; in query strings). */
function decodeSrcAttribute(value: string): string {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

/**
 * If `raw` is iframe HTML, returns the `src` attribute value; otherwise returns trimmed text.
 * Bare `https?://` URLs are returned trimmed unchanged.
 */
export function normalizeMapEmbedUrlInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }

  // Only parse as markup when the user pasted tag(s), not while typing a plain URL.
  if (/<iframe/i.test(trimmed)) {
    const match = /<iframe[\s\S]*?\bsrc\s*=\s*["']([^"']+)["']/i.exec(trimmed);
    if (match?.[1]) {
      return decodeSrcAttribute(match[1].trim());
    }
    // Incomplete iframe snippet (e.g. mid-paste); keep raw value so the field is not cleared.
    return trimmed;
  }

  return trimmed;
}
