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
    { title: "Easy Payments", description: "Simple and hassle-free payment options.", stat: "Varied options available" },
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
    <main className="flex flex-col gap-20 ">
      <HomeHero content={heroContent} />
      <div className="px-2">
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
      </div>
      <section className="relative overflow-hidden bg-green-700 py-10 px-4">
        <img src="/vasudha1.svg" alt="Vasudha background logo" className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-multiply pointer-events-none" />
        <div className="container relative grid grid-cols-2 gap-4 md:gap-8 items-start">
          <div className="rounded-xl bg-white/90 p-2 md:p-5">
            <h2 className="font-hero text-xl md:text-2xl text-neutral-900">{leadContent.title}</h2>
            <div className="mt-3">
              <LeadForm compact />
            </div>
          </div>
          <div className="text-white py-1 md:py-3">
            <h3 className="font-heading text-xl md:text-2xl">Contact Us</h3>
            <p className="mt-2 text-white/90 text-sm md:text-base">Call or message us to discuss available plots, layouts, and visits.</p>
            <div className="mt-4 space-y-2 text-sm md:text-base">
              <a href="tel:+919999999999" className="block underline-offset-2 hover:underline">+91 99999 99999</a>
              <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="block underline-offset-2 hover:underline">WhatsApp: +91 99999 99999</a>
              <a href="mailto:hello@vasudhaproperties.com" className="block underline-offset-2 hover:underline">hello@vasudhaproperties.com</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
