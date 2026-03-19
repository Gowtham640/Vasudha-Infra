import { SectionTitle } from "../../components/ui/SectionTitle";
import { ProjectCard, ProjectSummary } from "../../components/projects/ProjectCard";
import { createServerSupabaseClient } from "../../lib/supabase/client";
import { getProjects, getSectionContent } from "../../lib/supabase/helpers";
import { parseSectionContent } from "../../lib/schemas/sectionContent";
import type { Database } from "../../lib/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

const defaultProjectsSection = {
  title: "Explore Our Projects",
  description: "Hand-picked plots, layouts, and premium homes designed for Amaravati.",
};

export default async function ProjectsPage() {
  const supabase = createServerSupabaseClient();
  const section = await getSectionContent(supabase, "projects_list");
  const projects = (await getProjects(supabase)) as ProjectRow[];
  const content = parseSectionContent("projects_list", section?.content ?? defaultProjectsSection);
  const sectionBody = content.success.success ? content.success.data : defaultProjectsSection;

  const projectSummaries: ProjectSummary[] = projects.map((project: ProjectRow) => ({
    id: project.id,
    name: project.name,
    slug: project.slug,
    location: project.address ?? undefined,
    price: project.price ?? undefined,
    status: project.status ?? undefined,
    description: project.description ?? undefined,
  }));

  return (
    <main className="pt-10 space-y-24">
      {/* pt-10 -> controls distance from navbar/top */}
      {/* space-y-24 -> controls spacing between sections (global layout control) */}
      <section className="flex flex-col gap-8">
        {/* Removed space-y-10 -> vertical spacing now controlled by parent page (gives page full layout control) */}
        <div className="flex flex-col gap-4">
          {/* Removed space-y-4 -> vertical spacing now controlled by parent page (gives page full layout control) */}
          <SectionTitle title={sectionBody.title} subtitle={sectionBody.description} />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {projectSummaries.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    </main>
  );
}
