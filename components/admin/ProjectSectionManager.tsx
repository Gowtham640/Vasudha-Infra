"use client";

import { useMemo, useState } from "react";
import { GripVertical, Trash2 } from "lucide-react";

type ProjectItem = {
  id: string;
  name: string;
};

type Props = {
  projects: ProjectItem[];
  initialProjectsPageOrder: string[];
  initialHomeSelection: string[];
};

const dedupeIds = (ids: string[]) => Array.from(new Set(ids));

const moveByDrag = (items: string[], fromIndex: number, toIndex: number) => {
  if (fromIndex === toIndex || toIndex < 0 || toIndex >= items.length) {
    return items;
  }
  const copy = [...items];
  const [item] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, item);
  return copy;
};

export function ProjectSectionManager({
  projects,
  initialProjectsPageOrder,
  initialHomeSelection,
}: Props) {
  const [projectsPageOrder, setProjectsPageOrder] = useState(
    dedupeIds(initialProjectsPageOrder)
  );
  const [homeSelection, setHomeSelection] = useState(dedupeIds(initialHomeSelection));
  const [status, setStatus] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [draggedProjectsIndex, setDraggedProjectsIndex] = useState<number | null>(null);
  const [draggedHomeIndex, setDraggedHomeIndex] = useState<number | null>(null);

  const projectById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects]
  );

  const homeAvailable = projects.filter((project) => !homeSelection.includes(project.id));
  const homeSelected = homeSelection
    .map((id) => projectById.get(id))
    .filter((project): project is ProjectItem => Boolean(project));
  const orderedProjectsPage = projectsPageOrder
    .map((id) => projectById.get(id))
    .filter((project): project is ProjectItem => Boolean(project));

  const addToHome = (projectId: string) => {
    if (homeSelection.includes(projectId)) {
      return;
    }
    setHomeSelection((prev) => [...prev, projectId]);
  };

  const removeFromHome = (projectId: string) => {
    setHomeSelection((prev) => prev.filter((id) => id !== projectId));
  };

  const saveChanges = async () => {
    setSaving(true);
    setStatus("Saving...");
    try {
      const response = await fetch("/api/admin/sections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeProjectIds: homeSelection,
          projectsPageOrderIds: projectsPageOrder,
        }),
      });

      if (!response.ok) {
        setStatus("Save failed");
        return;
      }
      setStatus("Saved");
    } catch (error) {
      console.error("saveChanges", error);
      setStatus("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="glass rounded-2xl border border-white/40 bg-white/40 p-6 shadow-sm backdrop-blur-xl">
        <h2 className="text-xl font-semibold text-neutral-900">
          Projects Page Order
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          The lowest order is shown first on the Projects page.
        </p>

        <div className="mt-5 space-y-3">
          {orderedProjectsPage.map((project, index) => (
            <div
              key={project.id}
              draggable
              onDragStart={() => setDraggedProjectsIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (draggedProjectsIndex === null) return;
                setProjectsPageOrder((prev) => moveByDrag(prev, draggedProjectsIndex, index));
                setDraggedProjectsIndex(null);
              }}
              className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3"
            >
              <p className="font-medium text-neutral-900">{project.name}</p>
              <GripVertical className="h-4 w-4 text-neutral-500" />
            </div>
          ))}
        </div>
      </section>

      <section className="glass rounded-2xl border border-white/40 bg-white/40 p-6 shadow-sm backdrop-blur-xl">
        <h2 className="text-xl font-semibold text-neutral-900">
          Home Page Projects
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          Add selected projects and set the exact display order.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="glass rounded-xl border border-white/40 bg-white/25 p-4 backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-neutral-700">Available Projects</h3>
            <div className="mt-3 space-y-2">
              {homeAvailable.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between rounded-lg border border-white/40 bg-white/20 px-3 py-2"
                >
                  <p className="text-sm text-neutral-800">{project.name}</p>
                  <button
                    type="button"
                    onClick={() => addToHome(project.id)}
                    className="rounded-lg border border-green-700 px-2.5 py-1 text-xs text-green-700"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-xl border border-white/40 bg-white/25 p-4 backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-neutral-700">Selected for Home</h3>
            <div className="mt-3 space-y-2">
              {homeSelected.map((project, index) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between rounded-lg border border-white/40 bg-white/20 px-3 py-2"
                >
                  <p className="text-sm text-neutral-800">{project.name}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!confirm("Remove this project from home section?")) return;
                        removeFromHome(project.id);
                      }}
                      className="rounded-lg border border-red-300 p-1.5 text-red-700"
                      aria-label={`Remove ${project.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <span
                      draggable
                      onDragStart={() => setDraggedHomeIndex(index)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (draggedHomeIndex === null) return;
                        setHomeSelection((prev) => moveByDrag(prev, draggedHomeIndex, index));
                        setDraggedHomeIndex(null);
                      }}
                      className="rounded-md border border-neutral-300 p-1 text-neutral-500"
                    >
                      <GripVertical className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={saveChanges}
          disabled={saving}
          className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save project section changes"}
        </button>
        {status ? <p className="text-sm text-neutral-600">{status}</p> : null}
      </div>
    </div>
  );
}
