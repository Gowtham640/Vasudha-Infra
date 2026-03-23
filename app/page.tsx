/* eslint-disable @next/next/no-img-element */
import { HomeHero } from "../components/home/HomeHero";
import { WhyChooseUs } from "../components/home/WhyChooseUs";
import { FeaturedProjects } from "../components/home/FeaturedProjects";
import { createServerComponentSupabaseClient } from "../lib/supabase/server";
import { getProjects, getSectionContent } from "../lib/supabase/helpers";
import { SectionKey } from "../lib/types";
import { parseSectionContent } from "../lib/schemas/sectionContent";
import { buildStorageUrl } from "../lib/supabase/storage";
import { LeadForm } from "../components/contact/LeadForm";

const defaultHero = {
  title: "Symbol of Growth and Trust",
  subtitle: "Sculpted living spaces near the river and expressway.",
  description: "Fixed sections, flexible content, premium experiences.",
  ctaLabel: "Talk with us",
  ctaHref: "/contact",
};

const defaultWhyUs = {
  title: "Building trust since 1998",
  subtitle: "We craft communities with thoughtful planning and transparent pricing.",
  cards: [
    { title: "Decades of Experience", description: "Delivering 40+ layouts across Andhra Pradesh.", stat: "25 yrs" },
    { title: "Prime Locations", description: "Plots close to Amaravati's planned city and riverfront.", stat: "5+ layouts" },
    { title: "Transparent Payments", description: "Milestone-based payment schedules with digital receipts.", stat: "100% clarity" },
  ],
};

const defaultLead = {
  title: "Schedule a visit",
  description: "Speak with a Vasudha expert to tour layouts and available plots.",
  ctaLabel: "Book a walk-through",
  ctaHref: "/contact",
};

const safeParseSection = <T extends SectionKey>(key: T, payload: unknown, fallback: unknown) => {
  const parsed = parseSectionContent(key, payload);
  return parsed.success.success ? parsed.success.data : fallback;
};

export default async function HomePage() {
  // Fix: Cookies can only be modified in a Server Action or Route Handler.
  // Server Component: read-only Supabase client (no cookie writes during render).
  const supabase = createServerComponentSupabaseClient();
  const heroSection = await getSectionContent(supabase, "home_hero");
  const whySection = await getSectionContent(supabase, "home_why_us");
  const leadSection = await getSectionContent(supabase, "home_lead_banner");
  const projects = await getProjects(supabase);
  const projectImageRows = await supabase
    .from("project_images")
    .select("project_id,image_path,is_cover,order_index")
    .order("order_index", { ascending: true });

  const heroContent = safeParseSection("home_hero", heroSection?.content, defaultHero);
  const whyContent = safeParseSection("home_why_us", whySection?.content, defaultWhyUs);
  const leadContent = safeParseSection("home_lead_banner", leadSection?.content, defaultLead);
  const imageMap = new Map<string, string>();
  for (const row of projectImageRows.data ?? []) {
    if (!row.project_id || imageMap.has(row.project_id)) continue;
    imageMap.set(row.project_id, buildStorageUrl(row.image_path));
  }

  return (
    <main className="flex flex-col gap-20">
      <HomeHero content={heroContent} />
      <WhyChooseUs content={whyContent} />
      <FeaturedProjects
        projects={projects.map((project) => ({
          id: project.id,
          name: project.name,
          address: project.address,
          price: project.price,
          imageUrl: imageMap.get(project.id) ?? null,
        }))}
      />
      <section className="relative overflow-hidden bg-green-700 py-14 px-4">
        <img src="/vasudha1.svg" alt="Vasudha background logo" className="absolute inset-0 h-full w-full object-contain opacity-10 pointer-events-none" />
        <div className="container relative grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl bg-white/95 p-6 shadow-card">
            <h2 className="font-hero text-2xl text-neutral-900">{leadContent.title}</h2>
            <p className="text-neutral-600 mt-2">{leadContent.description}</p>
            <div className="mt-5">
              <LeadForm />
            </div>
          </div>
          <div className="rounded-2xl bg-black/20 text-white p-8">
            <h3 className="font-heading text-2xl">Contact Us</h3>
            <p className="mt-3 text-white/85">Call or message us to discuss available plots, layouts, and visits.</p>
            <div className="mt-6 space-y-3">
              <a href="tel:+919999999999" className="block text-lg hover:text-amber-300 transition-colors">
                +91 99999 99999
              </a>
              <a href="mailto:hello@vasudha.com" className="block text-lg hover:text-amber-300 transition-colors">
                hello@vasudha.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
