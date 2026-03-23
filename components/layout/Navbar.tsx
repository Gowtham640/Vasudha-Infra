"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { Globe, LogIn, LogOut, Shield } from "lucide-react";
import { isAdminNavActive, isMainNavActive, MAIN_NAV_ITEMS } from "./nav";
import { useI18n } from "../i18n/I18nProvider";
import { createBrowserSupabaseClient } from "../../lib/supabase/client";

export function Navbar() {
  const { lang, setLang, t } = useI18n();
  const pathname = usePathname();
  const [role, setRole] = useState<"owner" | "admin" | "user" | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
        setIsLoggedIn(Boolean(data.role));
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
  const supabase = createBrowserSupabaseClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
      <div className="container mx-auto flex max-w-6xl flex-row items-center justify-between px-5 md:px-6 h-16">
        {/* Brand: visible on all breakpoints */}
        <div className="flex items-center gap-3">
          <Image src="/vasudha1.svg" alt="Vasudha Logo" width={120} height={10} />
        </div>

        {/* Large screens: text links + current route highlight (green pill) */}
        <nav className="flex items-center gap-1" aria-label="Primary">
          {MAIN_NAV_ITEMS.map((item) => {
            const active = isMainNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "text-sm font-medium transition-colors duration-200 ease-out",
                  "rounded-2xl px-4 py-2",
                  active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:text-primary"
                )}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}

          {canAccessAdmin ? (
            <Link
              href="/admin"
              className={clsx(
                "text-sm font-medium transition-colors duration-200 ease-out",
                "rounded-2xl px-4 py-2",
                  "flex items-center gap-1.5",
                  isAdminNavActive(pathname) ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:text-primary"
              )}
            >
                <Shield className="w-4 h-4" />
                {t("nav.admin")}
            </Link>
          ) : null}
        </nav>

        {/* Language and auth actions */}
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-sm font-medium hover:bg-secondary transition-colors"
            onClick={() => setLang(lang === "en" ? "te" : "en")}
            aria-label="Toggle language"
          >
            <Globe className="w-4 h-4" />
            {lang === "en" ? "తెలుగు" : "English"}
          </button>

          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            {t("nav.login")}
          </Link>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t("nav.logout")}
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
