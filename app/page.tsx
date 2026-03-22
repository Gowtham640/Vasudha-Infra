import { HomeHero } from "../components/home/HomeHero";
import { WhyChooseUs } from "../components/home/WhyChooseUs";
import { FeaturedProjects } from "../components/home/FeaturedProjects";
import { LeadBanner } from "../components/home/LeadBanner";
import { ContactSection } from "../components/home/ContactSection";
import { createServerComponentSupabaseClient } from "../lib/supabase/server";
import { getProjects, getSectionContent } from "../lib/supabase/helpers";
import { SectionKey } from "../lib/types";
import { parseSectionContent } from "../lib/schemas/sectionContent";

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

const defaultContact = {
  title: "Need personalised guidance?",
  description: "Call us or drop a message anytime. We respond within 24 hours.",
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
  const contactSection = await getSectionContent(supabase, "home_contact");
  const projects = await getProjects(supabase);

  const heroContent = safeParseSection("home_hero", heroSection?.content, defaultHero);
  const whyContent = safeParseSection("home_why_us", whySection?.content, defaultWhyUs);
  const leadContent = safeParseSection("home_lead_banner", leadSection?.content, defaultLead);
  const contactContent = safeParseSection("home_contact", contactSection?.content, defaultContact);

  return (
    <main className="flex flex-col gap-24">
      {/* pt-10 -> controls distance from navbar/top */}
      {/* space-y-24 -> controls spacing between sections (global layout control) */}
      <HomeHero content={heroContent} />
      <WhyChooseUs content={whyContent} />
      <FeaturedProjects projects={projects} />
      <LeadBanner content={leadContent} />
      <ContactSection content={contactContent} />
    </main>
  );
}
