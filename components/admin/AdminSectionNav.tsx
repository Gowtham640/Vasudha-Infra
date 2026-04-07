"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navItems = [
  { href: "/admin", label: "Default Admin" },
  { href: "/admin/projects", label: "Manage Projects" },
  { href: "/admin/sections", label: "Manage Sections" },
  { href: "/admin/analytics", label: "Analytics" },
] as const;

export function AdminSectionNav() {
  const pathname = usePathname();

  return (
    <nav className="glass sticky top-16 z-40 flex flex-wrap items-center gap-2 rounded-2xl border border-white/40 bg-white/35 p-3 backdrop-blur-xl">
      {navItems.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-green-700/85 text-white"
                : "border border-white/40 bg-white/25 text-neutral-900 hover:bg-white/40"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
