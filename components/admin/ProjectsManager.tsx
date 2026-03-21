"use client";

import { useState, useEffect } from "react";
import type { Database } from "../../lib/types";
import { ProjectEditor } from "./ProjectEditor";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type ProjectImageRow = Database["public"]["Tables"]["project_images"]["Row"];

type ProjectEditorProject = Pick<
  ProjectRow,
  "id" | "name" | "slug" | "description" | "status" | "price" | "address" | "landmark" | "map_embed_url"
>;

type ProjectImageForEditor = Pick<
  ProjectImageRow,
  "id" | "image_path" | "order_index" | "alt_text" | "is_cover"
>;

type ProjectWithImages = ProjectEditorProject & {
  project_images: ProjectImageForEditor[];
};


export function ProjectsManager({ projects }: { projects: ProjectWithImages[] }) {
  const [editor, setEditor] = useState<null | {
    isNew: boolean;
    project: ProjectEditorProject;
    images: ProjectImageForEditor[];
  }>(null);

  useEffect(() => {
    if (editor) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [editor]);
  const openAdd = () => {
    setEditor({
      isNew: true,
      project: {
        id: "",
        name: "",
        slug: "",
        description: null,
        status: "available",
        price: null,
        address: null,
        landmark: null,
        map_embed_url: null,
      },
      images: [],
    });
  };

  const openEdit = (project: ProjectWithImages) => {
    const { project_images, ...p } = project;
    setEditor({
      isNew: false,
      project: p,
      images: project_images,
    });
  };

  return (
    <main className="pt-10 space-y-24">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-neutral-900">Project Catalog</h2>
          <div className="flex items-center gap-3">
            <p className="text-sm text-neutral-500">Manage projects below.</p>
            <button
              type="button"
              onClick={openAdd}
              className="rounded-full border border-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-[var(--brand-primary)]"
            >
              Add project
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
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
                <button
                  type="button"
                  className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700"
                  onClick={() => openEdit(project)}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editor && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-neutral-900/40 pt-10">
          <div className="w-full max-w-2xl px-4">
          <div className="project-manager max-h-[80vh] overflow-y-auto rounded-2xl bg-white p-4">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setEditor(null)}
                className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700"
              >
                Close
              </button>
            </div>

            {/* Key remounts the editor when switching projects so `images` state matches fetched `project_images`. */}
            <ProjectEditor
              key={editor.isNew ? "new" : editor.project.id}
              isNew={editor.isNew}
              stayOnList
              onAfterSave={() => setEditor(null)}
              onAfterDelete={() => setEditor(null)}
              project={editor.project}
              images={editor.images}
            />
          </div>
          </div>
          <style jsx>{`
            .project-manager {
              overscroll-behavior: contain;
              -webkit-overflow-scrolling: touch;
            }

            .project-manager::-webkit-scrollbar {
              width: 6px;
            }

            .project-manager::-webkit-scrollbar-track {
              background: transparent;
            }

            .project-manager::-webkit-scrollbar-thumb {
              background: rgba(100, 100, 100, 0.3);
              border-radius: 999px;
            }

            .project-manager::-webkit-scrollbar-thumb:hover {
              background: rgba(100, 100, 100, 0.5);
            }

            .project-manager {
              scrollbar-width: thin;
              scrollbar-color: rgba(100, 100, 100, 0.3) transparent;
            }
          `}</style>
        </div>
      )}
    </main>
  );
}

