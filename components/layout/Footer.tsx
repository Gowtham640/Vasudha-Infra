import Link from "next/link";

const links = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-neutral-500 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Vasudha Realtors. All rights reserved.</p>
        <div className="flex items-center gap-3">
          <Link href="tel:+919999999999" className="text-neutral-700 hover:text-[var(--brand-primary)]">
            +91 99999 99999
          </Link>
          <span className="text-neutral-300">•</span>
          <Link href="mailto:hello@vasudha.com" className="text-neutral-700 hover:text-[var(--brand-primary)]">
            hello@vasudha.com
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-neutral-500 hover:text-[var(--brand-primary)]">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
