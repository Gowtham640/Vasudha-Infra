/* eslint-disable @next/next/no-img-element */
import { HomeHero } from "../components/home/HomeHero";
import { WhyChooseUs } from "../components/home/WhyChooseUs";
import { FeaturedProjects } from "../components/home/FeaturedProjects";
import { createServerComponentSupabaseClient } from "../lib/supabase/server";
import { getProjectIdsForSection, getProjects, getSectionContent } from "../lib/supabase/helpers";
import { buildStorageUrl } from "../lib/supabase/storage";
import { LeadForm } from "../components/contact/LeadForm";
import { HomeContactInfo } from "../components/home/HomeContactInfo";
import { SectionProse } from "../components/cms/SectionProse";
import { emptyCmsDoc } from "../lib/tiptap/cmsDoc";

export default async function HomePage() {
  const supabase = createServerComponentSupabaseClient();

  const [
    heroSection,
    whyIntroSection,
    why1,
    why2,
    why3,
    why4,
    leadSection,
    projects,
    homeProjectIds,
    projectImageRows,
  ] = await Promise.all([
    getSectionContent(supabase, "home_hero"),
    getSectionContent(supabase, "why_us_intro"),
    getSectionContent(supabase, "why_us_1"),
    getSectionContent(supabase, "why_us_2"),
    getSectionContent(supabase, "why_us_3"),
    getSectionContent(supabase, "why_us_4"),
    getSectionContent(supabase, "home_lead_banner"),
    getProjects(supabase),
    getProjectIdsForSection(supabase, "home", "home_projects"),
    supabase
      .from("project_images")
      .select("project_id,image_path,is_cover,order_index")
      .order("order_index", { ascending: true }),
  ]);

  const heroDoc = heroSection?.content ?? emptyCmsDoc;
  const whyIntroDoc = whyIntroSection?.content ?? emptyCmsDoc;
  const cardDocs = [
    why1?.content ?? emptyCmsDoc,
    why2?.content ?? emptyCmsDoc,
    why3?.content ?? emptyCmsDoc,
    why4?.content ?? emptyCmsDoc,
  ] as const;
  const leadDoc = leadSection?.content ?? emptyCmsDoc;

  const imageMap = new Map<string, string>();
  for (const row of projectImageRows.data ?? []) {
    if (!row.project_id || imageMap.has(row.project_id)) continue;
    imageMap.set(row.project_id, buildStorageUrl(row.image_path));
  }

  const projectById = new Map(projects.map((project) => [project.id, project]));
  const homeProjects = homeProjectIds
    .map((projectId) => projectById.get(projectId))
    .filter((project): project is (typeof projects)[number] => Boolean(project));

  return (
    <main className="flex flex-col gap-20 ">
      <HomeHero doc={heroDoc} />
      <div className="px-2">
        <WhyChooseUs introDoc={whyIntroDoc} cardDocs={cardDocs} />
        <FeaturedProjects
          projects={homeProjects.map((project) => ({
            id: project.id,
            name: project.name,
            address: project.address,
            price: project.price,
            imageUrl: imageMap.get(project.id) ?? null,
          }))}
        />
      </div>
      <section className="relative overflow-hidden bg-green-700 py-10 px-4">
        <img
          src="/vasudha1white.svg"
          alt="Vasudha background logo"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10 invert-brightness-0"
        />
        <div className="container relative">
          <div className="glass grid grid-cols-2 items-center gap-4 rounded-3xl border border-white/40 bg-white/20 p-3 backdrop-blur-xl md:gap-8 md:p-6">
            <div>
              <SectionProse
                json={leadDoc}
                className="prose-headings:text-neutral-900 prose-p:text-neutral-800 [&_h1]:[font-family:var(--font-hero)] [&_h2]:[font-family:var(--font-hero)] [&_h3]:[font-family:var(--font-hero)] [&_p]:[font-family:var(--font-heading)]"
              />
              <div className="mt-3">
                <LeadForm compact />
              </div>
            </div>
            <HomeContactInfo />
          </div>
        </div>
      </section>
    </main>
  );
}
