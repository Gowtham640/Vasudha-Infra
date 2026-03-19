import { ProjectSummary, ProjectCard } from "../projects/ProjectCard";

export function FeaturedProjects({ projects }: { projects: ProjectSummary[] }) {
  return (
    <section className="flex flex-col gap-6">
      {/* Removed space-y-6 -> vertical spacing now controlled by parent page (gives page full layout control) */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-neutral-500">Featured</p>
          <h2 className="text-3xl font-semibold text-neutral-900">Projects in Amaravati</h2>
        </div>
        <div className="text-sm text-neutral-500">Scroll to discover brilliant layouts</div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
