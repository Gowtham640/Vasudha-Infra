/**
 * Shared routes and helpers for main site navigation (desktop navbar + mobile bottom bar).
 * Adjust labels or hrefs here to change both UIs together.
 */
export type MainNavItem = {
  href: string;
  /** Shown on large screens in the top navbar */
  label: string;
};

export const MAIN_NAV_ITEMS: MainNavItem[] = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About Us" },
  /** Lead capture / enquiry */
  { href: "/contact", label: "Contact" },
];

/** True when this top-level route should show the active (green) state */
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
