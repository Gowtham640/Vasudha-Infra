import { LeadForm } from "../../components/contact/LeadForm";
import { createServerSupabaseClient } from "../../lib/supabase/client";
import { getSectionContent } from "../../lib/supabase/helpers";
import { parseSectionContent } from "../../lib/schemas/sectionContent";

const defaultContactCta = {
  title: "Ready to explore plots in Amaravati?",
  subtitle: "Our team will respond within a day and schedule a guided visit.",
  ctaLabel: "Send enquiry",
};

export default async function ContactPage() {
  const supabase = createServerSupabaseClient();
  const section = await getSectionContent(supabase, "contact_cta");
  const parsed = parseSectionContent("contact_cta", section?.content ?? defaultContactCta);
  const content = parsed.success.success ? parsed.success.data : defaultContactCta;

  return (
    <main className="pt-10 space-y-24">
      {/* pt-10 -> controls distance from navbar/top */}
      {/* space-y-24 -> controls spacing between sections (global layout control) */}
      <section className="grid gap-8 md:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-[0_30px_45px_rgba(8,60,32,0.08)]">
        {/* Removed space-y-4 -> vertical spacing now controlled by parent page (gives page full layout control) */}
          <p className="text-sm uppercase tracking-[0.4em] text-neutral-500">Contact</p>
          <h1 className="text-3xl font-semibold text-neutral-900">{content.title}</h1>
          {content.subtitle && <p className="text-neutral-600">{content.subtitle}</p>}
          <p className="text-sm text-neutral-500">+91 99999 99999 · hello@vasudha.com</p>
        </div>
        <LeadForm />
      </section>
    </main>
  );
}
