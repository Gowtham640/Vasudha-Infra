"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { isAdminNavActive, isMainNavActive, MAIN_NAV_ITEMS } from "./nav";

export function Navbar() {
  const [language, setLanguage] = useState<"EN" | "TE">("EN");
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
        // If role cannot be fetched, we hide the admin link by default.
      }
    };

    loadRole();
    return () => {
      cancelled = true;
    };
  }, []);

  const canAccessAdmin = role === "owner" || role === "admin";

  return (
    <header className="sticky top-0 z-50 bg-white backdrop-blur border-b border-transparent border-b-neutral-200">
      <div className="mx-auto flex max-w-6xl flex-row items-center justify-between px-5  md:px-6">
        {/* Brand: visible on all breakpoints */}
        <div className="flex items-center gap-3">
        <Image
          src="/vasudha1.svg"
          alt="Vasudha Logo"
          width={120}
          height={10}
        />
        </div>

        {/* Large screens: text links + current route highlight (green pill) */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {MAIN_NAV_ITEMS.map((item) => {
            const active = isMainNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "text-sm font-medium transition-colors duration-200 ease-out",
                  "rounded-2xl px-4 py-2",
                  active ? "bg-green-600 text-white" : "text-neutral-700 hover:text-neutral-900"
                )}
              >
                {item.label}
              </Link>
            );
          })}

          {canAccessAdmin ? (
            <Link
              href="/admin"
              className={clsx(
                "text-sm font-medium transition-colors duration-200 ease-out",
                "rounded-2xl px-4 py-2",
                isAdminNavActive(pathname)
                  ? "bg-green-600 text-white"
                  : "text-neutral-700 hover:text-neutral-900"
              )}
            >
              Admin
            </Link>
          ) : null}
        </nav>

        {/* Language + login only (mobile has no other header links) */}
        <div className="flex items-center gap-3">
          <button
            className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold text-neutral-700 transition hover:border-(--brand-primary)"
            onClick={() => setLanguage(language === "EN" ? "TE" : "EN")}
            aria-label="Toggle language"
          >
            {language}
          </button>

          <Link
            href="/login"
            aria-label="Login"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 bg-white transition hover:border-(--brand-primary)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M20 21C20 17.134 16.4183 14 12 14C7.58172 14 4 17.134 4 21"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
