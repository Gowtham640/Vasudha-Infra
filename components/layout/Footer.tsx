import Link from "next/link";

const links = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="container mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-neutral-500 md:flex-row md:items-center md:justify-between"></div>
    </footer>
  );
}
