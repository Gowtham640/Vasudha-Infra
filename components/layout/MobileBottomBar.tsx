"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Globe, Home, LogIn, LogOut, Phone, Shield, User } from "lucide-react";
import { isAdminNavActive, isMainNavActive } from "./nav";
import { useI18n } from "../i18n/I18nProvider";
import { createBrowserSupabaseClient } from "../../lib/supabase/client";

/**
 * Spacer height for scrollable content so nothing sits under the fixed bar.
 * Must match: h-14 row + safe-area padding on the bar wrapper in this file.
 */
export const MOBILE_BOTTOM_NAV_SPACER_CLASS =
  "h-[calc(3.5rem+env(safe-area-inset-bottom,0px))]";
const MOBILE_NAV_ITEMS = [
  { href: "/", labelKey: "nav.home", icon: Home },
  { href: "/projects", labelKey: "nav.projects", icon: Building2 },
  { href: "/about", labelKey: "nav.about", icon: User },
  { href: "/contact", labelKey: "nav.contact", icon: Phone },
] as const;

export function MobileBottomBar() {
  const { t, lang, setLang } = useI18n();
  const pathname = usePathname();
  const [role, setRole] = useState<"owner" | "admin" | "user" | null>(null);
  const supabase = createBrowserSupabaseClient();

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
  const isLoggedIn = Boolean(role);

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex flex-col">
      {/* Top utility bar to mirror plot-path-finder mobile behavior */}
      <div className="glass border-b border-border/30 flex items-center justify-between px-4 h-14">
        <Link href="/" className="font-hero text-lg font-bold text-primary">
          Vasudha
        </Link>
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/";
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
              aria-label={t("nav.logout")}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => (window.location.href = "/login")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium"
              aria-label={t("nav.login")}
            >
              <LogIn className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setLang(lang === "en" ? "te" : "en")}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-border text-xs font-medium hover:bg-secondary transition-colors"
            aria-label="Toggle language"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === "en" ? "తెలు" : "EN"}
          </button>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 pb-[env(safe-area-inset-bottom)]" aria-label="Primary">
        <div className="flex items-center justify-around py-2 px-2">
          {MOBILE_NAV_ITEMS.map((item) => {
            const active = isMainNavActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 py-1 px-3 relative"
              >
                {active ? (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                ) : null}
                <Icon className={`w-5 h-5 relative z-10 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-[10px] font-medium relative z-10 ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })}

          {canAccessAdmin ? (
            <Link
              href="/admin"
              className="flex flex-col items-center gap-0.5 py-1 px-3 relative"
            >
              {isAdminNavActive(pathname) ? (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              ) : null}
              <Shield className={`w-5 h-5 relative z-10 ${isAdminNavActive(pathname) ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-[10px] font-medium relative z-10 ${isAdminNavActive(pathname) ? "text-primary" : "text-muted-foreground"}`}>
                {t("nav.admin")}
              </span>
            </Link>
          ) : null}
        </div>
      </nav>
    </div>
  );
}
