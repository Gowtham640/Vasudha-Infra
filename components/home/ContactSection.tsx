import Link from "next/link";

export type ContactSectionContent = {
  title: string;
  description: string;
};

export function ContactSection({ content }: { content: ContactSectionContent }) {
  return (
    <section className="rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-[0_20px_45px_rgba(8,60,32,0.05)] md:p-12">
      <div className="flex flex-col gap-4">
        {/* Removed space-y-4 -> vertical spacing now controlled by parent page (gives page full layout control) */}
        <h3 className="text-xs font-semibold text-neutral-900">{content.title}</h3>
        <p className="text-neutral-600">{content.description}</p>
        <div className="flex flex-col gap-2 text-sm text-neutral-500">
          <Link href="tel:+919999999999" className="text-neutral-700 hover:text-[var(--brand-primary)]">
            +91 99999 99999
          </Link>
          <Link href="mailto:hello@vasudha.com" className="text-neutral-700 hover:text-[var(--brand-primary)]">
            hello@vasudha.com
          </Link>
        </div>
      </div>
    </section>
  );
}
