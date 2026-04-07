import { LeadForm } from "../../components/contact/LeadForm";
import { createServerComponentSupabaseClient } from "../../lib/supabase/server";
import { getSectionContent } from "../../lib/supabase/helpers";
import { ContactPrivacyNote } from "../../components/contact/ContactPrivacyNote";
import { SectionProse } from "../../components/cms/SectionProse";
import { emptyCmsDoc } from "../../lib/tiptap/cmsDoc";

export default async function ContactPage() {
  const supabase = createServerComponentSupabaseClient();
  const section = await getSectionContent(supabase, "contact_cta");

  return (
    <main className="space-y-24">
      <section className="min-h-[80vh] flex items-center py-12 px-4">
        <div className="container max-w-md">
          <div className="text-center">
            <SectionProse json={section?.content ?? emptyCmsDoc} className="mx-auto text-center [&_h1]:font-hero [&_h1]:text-3xl [&_h1]:md:text-4xl [&_h1]:font-bold [&_h1]:text-neutral-900" />
          </div>
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-card">
            <LeadForm />
          </div>
          <ContactPrivacyNote />
        </div>
      </section>
    </main>
  );
}
