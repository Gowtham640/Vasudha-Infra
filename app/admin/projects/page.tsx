import Link from "next/link";
import { createServerSupabaseClient } from "../../../lib/supabase/client";
import type { Database } from "../../../lib/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

export default async function AdminProjectsPage() {
  const supabase = createServerSupabaseClient() as any;
  const projectsResponse = await supabase
    .from("projects")
    .select("id, name, status, price")
    .order("created_at", { ascending: false });
  const projects = (projectsResponse.data ?? []) as ProjectRow[];

  return (
    <main className="pt-10 space-y-24">
      {/* pt-10 -> controls distance from navbar/top */}
      {/* space-y-24 -> controls spacing between sections (global layout control) */}
      <div className="flex flex-col gap-6">
        {/* Removed space-y-6 -> vertical spacing now controlled by parent page (gives page full layout control) */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-neutral-900">Project Catalog</h2>
          <p className="text-sm text-neutral-500">You can edit existing projects below.</p>
        </div>
        <div className="flex flex-col gap-4">
          {/* Removed space-y-4 -> vertical spacing now controlled by parent page (gives page full layout control) */}
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-6 py-4"
            >
              <div>
                <p className="text-lg font-semibold text-neutral-900">{project.name}</p>
                <p className="text-sm text-neutral-500">Status: {project.status ?? "available"}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm text-neutral-600">
                  {project.price ? `₹${project.price.toLocaleString("en-IN")}` : "Price on request"}
                </p>
                <Link
                  className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700"
                  href={`/admin/projects/${project.id}`}
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
