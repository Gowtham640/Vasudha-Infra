export type WhyChooseUsContent = {
  title: string;
  subtitle?: string;
  cards: Array<{
    title: string;
    description: string;
    stat?: string;
  }>;
};

export function WhyChooseUs({ content }: { content: WhyChooseUsContent }) {
  return (
    <section className="flex flex-col gap-8">
      {/* Removed space-y-8 -> vertical spacing now controlled by parent page (gives page full layout control) */}
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.4em] text-neutral-500">Why choose us</p>
        <h2 className="text-3xl font-semibold text-neutral-900">{content.title}</h2>
        {content.subtitle && <p className="text-base text-neutral-600">{content.subtitle}</p>}
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {content.cards.map((card) => (
          <div key={card.title} className="glass-panel border border-neutral-200 p-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">{card.stat}</p>
              {/* Removed mt-3 -> vertical spacing now controlled by parent page (gives page full layout control) */}
              <h3 className="text-xl font-semibold text-neutral-900">{card.title}</h3>
              {/* Removed mt-3 -> vertical spacing now controlled by parent page (gives page full layout control) */}
              <p className="text-neutral-600">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
