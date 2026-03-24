"use client";

import { useEffect, useState } from "react";

/** Matches Tailwind default `lg` breakpoint (1024px). */
const LG_MIN_PX = 1024;

/**
 * Stack for mobile/tablet (&lt; lg), list for desktop (lg+).
 * Initial state is `list` for SSR; effect aligns with viewport after mount.
 */
export function useResponsiveGalleryViewMode() {
  const [view, setView] = useState<"stack" | "list">("list");

  useEffect(() => {
    const isLargeScreen = window.matchMedia(`(min-width: ${LG_MIN_PX}px)`).matches;
    setView(isLargeScreen ? "list" : "stack");
  }, []);

  return [view, setView] as const;
}
