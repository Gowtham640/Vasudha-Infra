import { createServerComponentSupabaseClient } from "../../lib/supabase/server";
import { getSectionContent } from "../../lib/supabase/helpers";
import { AboutClient } from "../../components/about/AboutClient";
import { emptyCmsDoc } from "../../lib/tiptap/cmsDoc";

export default async function AboutPage() {
  const supabase = createServerComponentSupabaseClient();
  const [aboutHero, vision, mission, stats] = await Promise.all([
    getSectionContent(supabase, "about_hero"),
    getSectionContent(supabase, "vision"),
    getSectionContent(supabase, "mission"),
    getSectionContent(supabase, "about_stats"),
  ]);

  return (
    <main className="space-y-12">
      <AboutClient
        aboutHeroDoc={aboutHero?.content ?? emptyCmsDoc}
        visionDoc={vision?.content ?? emptyCmsDoc}
        missionDoc={mission?.content ?? emptyCmsDoc}
        statsDoc={stats?.content ?? emptyCmsDoc}
      />
    </main>
  );
}
