/**
 * Maps CMS section `name` values to which full-page live preview to embed in admin.
 * Keeps preview in sync with public routes: `/`, `/about`, `/contact`.
 */

const HOME_SECTIONS = new Set<string>([
  "home_hero",
  "why_us_intro",
  "why_us_1",
  "why_us_2",
  "why_us_3",
  "why_us_4",
  "home_lead_banner",
]);

const ABOUT_SECTIONS = new Set<string>([
  "about_hero",
  "about_stats",
  "vision",
  "mission",
]);

export type CmsPreviewPage = "home" | "about" | "contact";

export function cmsPreviewPageForSection(sectionName: string): CmsPreviewPage {
  if (HOME_SECTIONS.has(sectionName)) {
    return "home";
  }
  if (ABOUT_SECTIONS.has(sectionName)) {
    return "about";
  }
  if (sectionName === "contact_cta") {
    return "contact";
  }
  return "home";
}
