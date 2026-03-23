import { parseSectionContent } from "../../lib/schemas/sectionContent";
import { createServerComponentSupabaseClient } from "../../lib/supabase/server";
import { getSectionContent } from "../../lib/supabase/helpers";
import { AboutClient } from "../../components/about/AboutClient";

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
  const supabase = createServerComponentSupabaseClient();
  const section = await getSectionContent(supabase, "about_overview");
  const parsed = parseSectionContent("about_overview", section?.content ?? defaultAbout);
  const content = parsed.success.success ? parsed.success.data : defaultAbout;

  return (
    <main className="space-y-12">
      <AboutClient headline={content.headline} body={content.body} stats={content.stats as SectionStat[]} />
    </main>
  );
}
