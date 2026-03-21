import { parseSectionContent } from "../../lib/schemas/sectionContent";
import { createServerComponentSupabaseClient } from "../../lib/supabase/server";
import { getSectionContent } from "../../lib/supabase/helpers";
import { SectionTitle } from "../../components/ui/SectionTitle";

type SectionStat = {
  label: string;
  value: string;
};

const defaultAbout = {
  headline: "About Vasudha",
  body: "An Amaravati-based real estate developer focused on lakeside plots, curated layouts, and premium homes.",
  stats: [
    { label: "Plots delivered", value: "120+" },
    { label: "Trusted families", value: "450+" },
  ],
};

export default async function AboutPage() {
  // Fix: Cookies can only be modified in a Server Action or Route Handler.
  // Server Component: read-only Supabase client (no cookie writes during render).
  const supabase = createServerComponentSupabaseClient();
  const section = await getSectionContent(supabase, "about_overview");
  const parsed = parseSectionContent("about_overview", section?.content ?? defaultAbout);
  const content = parsed.success.success ? parsed.success.data : defaultAbout;

  return (
    <main className="pt-10 space-y-24">
      {/* pt-10 -> controls distance from navbar/top */}
      {/* space-y-24 -> controls spacing between sections (global layout control) */}
      <section className="flex flex-col gap-6">
        {/* Removed space-y-10 -> vertical spacing now controlled by parent page (gives page full layout control) */}
        <SectionTitle title={content.headline} />
        <p className="text-neutral-600">{content.body}</p>
        <div className="grid gap-6 md:grid-cols-2">
          {content.stats.map((stat: SectionStat) => (
            <div key={stat.label} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_20px_45px_rgba(8,60,32,0.08)]">
              <div className="flex flex-col gap-2">
                <p className="text-sm uppercase tracking-[0.4em] text-neutral-500">{stat.label}</p>
                {/* Removed mt-3 -> vertical spacing now controlled by parent page (gives page full layout control) */}
                <p className="text-3xl font-semibold text-neutral-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
