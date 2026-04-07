/**
 * Shared routes and helpers for main site navigation (desktop navbar + mobile bottom bar).
 * Adjust labels or hrefs here to change both UIs together.
 */
export type MainNavItem = {
  href: string;
  labelKey: string;
};

export const MAIN_NAV_ITEMS: MainNavItem[] = [
  { href: "/", labelKey: "nav.home" },
  { href: "/projects", labelKey: "nav.projects" },
  { href: "/about", labelKey: "nav.about" },
  /** Lead capture / enquiry */
  { href: "/contact", labelKey: "nav.contact" },
];

/** True when this top-level route should show the active (highlighted) state */
export function isMainNavActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Admin area: any path under /admin */
export function isAdminNavActive(pathname: string): boolean {
  return pathname.startsWith("/admin");
}
