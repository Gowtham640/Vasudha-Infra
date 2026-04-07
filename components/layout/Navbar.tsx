"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
  const [isAtHomeTop, setIsAtHomeTop] = useState(true);
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    let cancelled = false;

    const loadAuthState = async () => {
      try {
        const sessionResponse = await supabase.auth.getSession();
        if (!cancelled) {
          setIsLoggedIn(Boolean(sessionResponse.data.session));
        }

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

    loadAuthState();
    const authSubscription = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) {
        setIsLoggedIn(Boolean(session));
      }
    });

    return () => {
      cancelled = true;
      authSubscription.data.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    const onScroll = () => {
      if (pathname !== "/") {
        setIsAtHomeTop(false);
        return;
      }
      setIsAtHomeTop(window.scrollY < 10);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const canAccessAdmin = role === "owner" || role === "admin";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header
      className={clsx(
        "hidden md:flex fixed top-0 left-0 right-0 z-50 border-b transition-all duration-400 ease-out",
        isAtHomeTop ? "bg-transparent border-transparent" : "glass border-border/30"
      )}
    >
      <div className="container mx-auto flex max-w-6xl flex-row items-center justify-between px-5 md:px-6 h-14">
        {/* Brand: visible on all breakpoints */}
        <div className="flex items-center gap-3">
          <Image src="/vasudha1.svg" alt="Vasudha Logo" className="absolute  mix-blend-multiply pointer-events-none" width={120} height={10} />
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
            aria-label={lang === "en" ? "Switch to Telugu" : "Switch to English"}
          >
            <Globe className="w-4 h-4" />
            {lang === "en" ? "తెలుగు" : "English"}
          </button>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t("nav.logout")}
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              {t("nav.login")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
