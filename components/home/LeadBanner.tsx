import { CTAButton } from "../ui/CTAButton";

export type LeadBannerContent = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref?: string;
};

export function LeadBanner({ content }: { content: LeadBannerContent }) {
  return (
    <section className="rounded-[2rem] bg-neutral-900 px-6 text-white shadow-xl md:px-10">
      {/* Removed py-10 -> vertical spacing now controlled by parent page (gives page full layout control) */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.5em] text-neutral-400">Schedule a site visit</p>
          {/* Removed mt-2 -> vertical spacing now controlled by parent page (gives page full layout control) */}
          <h3 className="text-3xl font-semibold">{content.title}</h3>
          {/* Removed mt-3 -> vertical spacing now controlled by parent page (gives page full layout control) */}
          <p className="text-base text-neutral-200">{content.description}</p>
        </div>
        <CTAButton label={content.ctaLabel} href={content.ctaHref} />
      </div>
    </section>
  );
}
