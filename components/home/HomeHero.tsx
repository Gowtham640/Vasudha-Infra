import { CTAButton } from "../ui/CTAButton";

export type HomeHeroContent = {
  title: string;
  subtitle: string;
  description?: string;
  ctaLabel: string;
  ctaHref?: string;
};

export function HomeHero({ content }: { content: HomeHeroContent }) {
  return (
    <section className="relative overflow-hidden  bg-gray-500 shadow-[0_30px_80px_rgba(8,60,32,0.08)]">
      <div className="relative flex flex-col gap-8 px-6 md:flex-row md:items-center md:justify-between md:px-12">
        {/* Removed py-16 -> vertical spacing now controlled by parent page (gives page full layout control) */}
        <div className="max-w-xl space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-neutral-500">Exclusive Plots</p>
          <h1 className="text-4xl font-semibold leading-tight text-neutral-900 md:text-5xl">
            {content.title}
          </h1>
          <p className="text-lg text-neutral-600">{content.subtitle}</p>
          {content.description && <p className="text-base text-neutral-500">{content.description}</p>}
          <CTAButton label={content.ctaLabel} href={content.ctaHref} />
        </div>
        <div className="flex flex-1 flex-col gap-2 rounded-2xl border border-neutral-200 bg-gradient-to-br from-[var(--brand-primary)]/90 to-neutral-900 p-8 text-white shadow-lg shadow-[0_30px_60px_rgba(15,90,38,0.25)]">
          {/* Kept gap-2 -> internal vertical spacing within gradient card (does not affect page layout) */}
          <p className="text-sm uppercase tracking-[0.3em]">Amaravati Living</p>
          {/* Removed mt-3 -> vertical spacing now controlled by parent page (gives page full layout control) */}
          <p className="text-2xl font-semibold">Plots · Layouts · Homes</p>
          {/* Removed mt-2 -> vertical spacing now controlled by parent page (gives page full layout control) */}
          <p className="text-sm text-neutral-100">Handcrafted communities around the lake and riverfront.</p>
        </div>
      </div>
    </section>
  );
}
