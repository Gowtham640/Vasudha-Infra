type SectionTitleProps = {
  title: string;
  subtitle?: string;
};

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.5em] text-neutral-500">Vasudha</p>
      <h2 className="text-3xl font-semibold text-neutral-900 md:text-4xl">{title}</h2>
      {subtitle && <p className="text-base text-neutral-600">{subtitle}</p>}
    </div>
  );
}
