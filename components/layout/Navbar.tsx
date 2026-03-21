"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

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
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-transparent border-b-neutral-200">
      <div className="mx-auto flex flex-row max-w-6xl items-center justify-between px-5 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-lg font-sora font-bold text-neutral-900">Vasudha</p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "text-sm font-medium transition-colors",
                pathname === item.href ? "text-(--brand-primary)" : "text-neutral-700"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold text-neutral-700 transition hover:border-(--brand-primary)"
            onClick={() => setLanguage(language === "EN" ? "TE" : "EN")}
            aria-label="Toggle language"
          >
            {language}
          </button>

          {/* Small person icon -> always goes to login. */}
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

          {/* Shield icon -> only visible for owner/admin. */}
          {canAccessAdmin && (
            <Link
              href="/admin"
              aria-label="Admin dashboard"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-(--brand-primary) bg-white text-(--brand-primary) transition hover:bg-(--brand-primary) hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2L20 6V12C20 17 16 21 12 22C8 21 4 17 4 12V6L12 2Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.5 12L11.2 13.7L14.8 10.1"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          )}

          <Link
            className="rounded-full border border-(--brand-primary) px-4 py-2 text-sm font-semibold text-(--brand-primary) transition hover:bg-(--brand-dark) hover:text-white"
            href="/contact"
          >
            Talk with us
          </Link>
        </div>
      </div>
    </header>
  );
}
