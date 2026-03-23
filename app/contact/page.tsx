import { LeadForm } from "../../components/contact/LeadForm";
import { createServerComponentSupabaseClient } from "../../lib/supabase/server";
import { getSectionContent } from "../../lib/supabase/helpers";
import { parseSectionContent } from "../../lib/schemas/sectionContent";

const defaultContactCta = {
  title: "Ready to explore plots in Amaravati?",
  subtitle: "Our team will respond within a day and schedule a guided visit.",
  ctaLabel: "Send enquiry",
};

export default async function ContactPage() {
  const supabase = createServerComponentSupabaseClient();
  const section = await getSectionContent(supabase, "contact_cta");
  const parsed = parseSectionContent("contact_cta", section?.content ?? defaultContactCta);
  const content = parsed.success.success ? parsed.success.data : defaultContactCta;

  return (
    <main className="space-y-24">
      <section className="min-h-[80vh] flex items-center py-12 px-4">
        <div className="container max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🏡</span>
            </div>
            <h1 className="font-hero text-3xl md:text-4xl font-bold text-neutral-900">{content.title}</h1>
            <p className="text-neutral-600 mt-3">{content.subtitle}</p>
          </div>
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-card">
            <LeadForm />
          </div>
          <p className="mt-6 text-center text-xs text-neutral-500">Your information is safe with us. We do not spam.</p>
        </div>
      </section>
    </main>
  );
}
