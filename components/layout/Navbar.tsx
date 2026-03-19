"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
                pathname === item.href ? "text-[var(--brand-primary)]" : "text-neutral-700"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold text-neutral-700 transition hover:border-[var(--brand-primary)]"
            onClick={() => setLanguage(language === "EN" ? "TE" : "EN")}
            aria-label="Toggle language"
          >
            {language}
          </button>
          <Link
            className="rounded-full border border-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-[var(--brand-primary)] transition hover:bg-[var(--brand-dark)] hover:text-white"
            href="/contact"
          >
            Talk with us
          </Link>
        </div>
      </div>
    </header>
  );
}
