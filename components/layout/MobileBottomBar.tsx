"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import clsx from "clsx";
import { isAdminNavActive, isMainNavActive, MAIN_NAV_ITEMS } from "./nav";

/**
 * Spacer height for scrollable content so nothing sits under the fixed bar.
 * Must match: h-14 row + safe-area padding on the bar wrapper in this file.
 */
export const MOBILE_BOTTOM_NAV_SPACER_CLASS =
  "h-[calc(3.5rem+env(safe-area-inset-bottom,0px))]";

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 10.5L12 3L21 10.5V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V10.5Z"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinejoin="round"
      />
      <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" />
    </svg>
  );
}

function ProjectsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 7.5L12 3L21 7.5V17C21 17.5304 20.7893 18.0391 20.4142 18.4142C20.0391 18.7893 19.5304 19 19 19H5C4.46957 19 3.96086 18.7893 3.58579 18.4142C3.21071 18.0391 3 17.5304 3 17V7.5Z"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinejoin="round"
      />
      <path d="M9 19V9.5H15V19" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" />
    </svg>
  );
}

function AboutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.85" />
      <path
        d="M6 19.5C6 16.4624 8.68629 14 12 14C15.3137 14 18 16.4624 18 19.5"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LeadCaptureIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6H20V18H4V6Z"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinejoin="round"
      />
      <path d="M4 8L12 13L20 8" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AdminIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2L20 6V12C20 17 16 21 12 22C8 21 4 17 4 12V6L12 2Z"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 12L11.2 13.7L14.8 10.1"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  "/": HomeIcon,
  "/projects": ProjectsIcon,
  "/about": AboutIcon,
  "/contact": LeadCaptureIcon,
};

export function MobileBottomBar() {
  const pathname = usePathname();
  const [role, setRole] = useState<"owner" | "admin" | "user" | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadRole = async () => {
      try {
        const res = await fetch("/api/auth/role", { method: "GET" });
        if (!res.ok) {
          return;
        }

        const data = (await res.json()) as { role?: "owner" | "admin" | "user" | null };
        if (cancelled) return;
        setRole(data.role ?? null);
      } catch {
        // Hide admin tab if role cannot be fetched
      }
    };

    loadRole();
    return () => {
      cancelled = true;
    };
  }, []);

  const canAccessAdmin = role === "owner" || role === "admin";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Primary"
    >
      <div className="w-full rounded-t-2xl border border-neutral-200/90 bg-white/95 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] backdrop-blur-md">
        <div className="flex h-14 items-center justify-around gap-1 px-2">
          {MAIN_NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.href];
            const active = isMainNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className={clsx(
                  "flex min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-2xl p-2 transition-all duration-200 ease-out",
                  "active:scale-[0.94] active:opacity-90",
                  active ? "bg-green-600 text-white shadow-sm" : "text-neutral-600 hover:text-neutral-900"
                )}
              >
                {Icon ? <Icon className="shrink-0" /> : null}
              </Link>
            );
          })}

          {canAccessAdmin ? (
            <Link
              href="/admin"
              aria-label="Admin"
              className={clsx(
                "flex min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-2xl p-2 transition-all duration-200 ease-out",
                "active:scale-[0.94] active:opacity-90",
                isAdminNavActive(pathname)
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              <AdminIcon className="shrink-0" />
            </Link>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
