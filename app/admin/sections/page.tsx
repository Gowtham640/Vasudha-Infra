import { createServerComponentSupabaseClient } from "../../../lib/supabase/server";
import { getSectionContent } from "../../../lib/supabase/helpers";
import { SectionEditor } from "../../../components/admin/SectionEditor";

const sectionKeys = [
  { key: "home_hero", title: "Home Hero" },
  { key: "home_why_us", title: "Why Choose Us" },
  { key: "home_lead_banner", title: "Lead Banner" },
  { key: "home_contact", title: "Contact Section" },
  { key: "projects_list", title: "Projects Intro" },
  { key: "contact_cta", title: "Contact CTA" },
] as const;

export default async function AdminSectionsPage() {
  // Fix: Cookies can only be modified in a Server Action or Route Handler.
  // Server Component: read-only Supabase client (no cookie writes during render).
  const supabase = createServerComponentSupabaseClient();
  const sections = await Promise.all(
    sectionKeys.map(async (entry) => {
      const section = await getSectionContent(supabase, entry.key);
      return {
        ...entry,
        id: section?.id ?? "",
        content: section?.content ?? {},
      };
    })
  );

  return (
    <main className="pt-10 space-y-24">
      {/* pt-10 -> controls distance from navbar/top */}
      {/* space-y-24 -> controls spacing between sections (global layout control) */}
      <div className="flex flex-col gap-6">
        {/* Removed space-y-6 -> vertical spacing now controlled by parent page (gives page full layout control) */}
        {sections.map((section) => (
          <SectionEditor
            key={section.key}
            title={section.title}
            sectionId={section.id}
            initialContent={section.content as Record<string, unknown>}
          />
        ))}
      </div>
    </main>
  );
}
