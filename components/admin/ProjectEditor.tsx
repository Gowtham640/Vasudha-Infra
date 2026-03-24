"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { buildStorageUrl } from "../../lib/supabase/storage";
import { normalizeMapEmbedUrlInput } from "../../lib/mapEmbedUrl";

type ProjectEditorProps = {
  isNew?: boolean;
  formId?: string;
  hideDefaultActions?: boolean;
  /**
   * When true, create/delete should not navigate away from the current admin page.
   * This is used by the in-page widget UI on `/admin/projects`.
   */
  stayOnList?: boolean;
  onDraftChangeAction?: (draft: {
    name: string;
    slug: string;
    description: string;
    status: string;
    price: string;
    address: string;
    landmark: string;
    map_embed_url: string;
  }) => void;
  /**
   * Called after a successful project save (including image upload).
   * Used by parent widgets to close modals.
   */
  onAfterSaveAction?: () => void;
  /**
   * Called after a successful project delete.
   * Used by parent widgets to close modals.
   */
  onAfterDeleteAction?: () => void;
  project: {
    id: string;
    name: string;
    slug: string;
    status?: string | null;
    price?: number | null;
    description?: string | null;
    address?: string | null;
    landmark?: string | null;
    map_embed_url?: string | null;
  };
  images: Array<{
    id: string;
    image_path: string;
    order_index: number | null;
    alt_text: string | null;
    is_cover: boolean | null;
  }>;
};

export function ProjectEditor({
  isNew = false,
  formId,
  hideDefaultActions = false,
  stayOnList = false,
  onDraftChangeAction,
  onAfterSaveAction,
  onAfterDeleteAction,
  project,
  images: initialImages,
}: ProjectEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: project.name,
    slug: project.slug,
    description: project.description ?? "",
    status: project.status ?? "available",
    price: project.price?.toString() ?? "",
    address: project.address ?? "",
    landmark: project.landmark ?? "",
    map_embed_url: normalizeMapEmbedUrlInput(project.map_embed_url ?? ""),
  });
  const [projectId, setProjectId] = useState(project.id);
  const [images, setImages] = useState(initialImages);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  /** Index into `selectedFiles` for cover (default first file). Used only before staging upload on create. */
  const [coverFileIndex, setCoverFileIndex] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange =
    (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        field === "map_embed_url" ? normalizeMapEmbedUrlInput(event.target.value) : event.target.value;
      setForm((prev) => {
        const next = { ...prev, [field]: value };
        onDraftChangeAction?.(next);
        return next;
      });
    };

  const saveProject = async (options?: { image_paths?: string[]; cover_image_path?: string | null }) => {
    const payload: Record<string, unknown> = {
      id: projectId,
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      status: form.status || null,
      price: form.price ? Number(form.price) : null,
      address: form.address || null,
      landmark: form.landmark || null,
      map_embed_url: normalizeMapEmbedUrlInput(form.map_embed_url) || null,
    };

    if (isNew && options?.image_paths && options.image_paths.length > 0) {
      payload.image_paths = options.image_paths;
      payload.cover_image_path = options.cover_image_path ?? options.image_paths[0] ?? null;
    }

    const response = await fetch("/api/admin/projects", {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setMessage("Failed to save project.");
      return null;
    }

    const data = (await response.json()) as { id?: string };
    const id = isNew ? data.id ?? null : projectId;

    if (!id) {
      setMessage("Project saved but id is missing.");
      return null;
    }

    if (isNew) {
      setProjectId(id);
      if (!stayOnList) {
        router.replace(`/admin/projects/${id}`);
      }
    }

    return id;
  };

  /**
   * Step 1 (create): upload selected files to storage only; step 3 attaches rows via POST /projects.
   */
  const uploadStagedImagePaths = async (): Promise<string[] | null> => {
    if (selectedFiles.length === 0) {
      return [];
    }

    const body = new FormData();
    selectedFiles.forEach((file) => body.append("images", file));

    const response = await fetch("/api/admin/project-images", {
      method: "PUT",
      body,
    });

    if (!response.ok) {
      setMessage("Image staging upload failed.");
      return null;
    }

    const data = (await response.json()) as { paths?: string[] };
    const paths = data.paths ?? [];
    if (paths.length === 0) {
      setMessage("Image staging returned no paths.");
      return null;
    }

    return paths;
  };

  /** Add images to an existing project (storage + one row per file). */
  const uploadImages = async (id: string) => {
    if (selectedFiles.length === 0) {
      return true;
    }

    const body = new FormData();
    body.append("projectId", id);
    selectedFiles.forEach((file) => body.append("images", file));

    const response = await fetch("/api/admin/project-images", {
      method: "POST",
      body,
    });

    if (!response.ok) {
      setMessage("Project saved but image upload failed.");
      return false;
    }

    const data = (await response.json()) as {
      images: Array<{
        id: string;
        image_path: string;
        alt_text: string | null;
        is_cover: boolean | null;
        order_index: number | null;
      }>;
    };

    // `order_index` comes from the API (append-after-max); keep it for display + metadata saves.
    setImages((prev) => [...prev, ...data.images]);
    setSelectedFiles([]);
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("Saving...");

    if (isNew && selectedFiles.length > 0) {
      const paths = await uploadStagedImagePaths();
      if (paths === null) {
        return;
      }
      const coverPath = paths[coverFileIndex] ?? paths[0] ?? null;
      const id = await saveProject({ image_paths: paths, cover_image_path: coverPath });

      if (!id) {
        return;
      }

      setProjectId(id);
      setSelectedFiles([]);
      setCoverFileIndex(0);
      setMessage("Project saved.");
      router.refresh();
      onAfterSaveAction?.();
      return;
    }

    const id = await saveProject();

    if (!id) {
      return;
    }

    // Issue 3: Edit + new files — upload after PATCH so `projectId` is valid; allow save with images only.
    const uploadSuccess = await uploadImages(id);
    if (uploadSuccess) {
      setMessage("Project saved.");
      router.refresh();
      onAfterSaveAction?.();
    }
  };

  const handleDeleteProject = async () => {
    if (!projectId || !confirm("Delete this project? This will also delete linked images.")) {
      return;
    }

    setMessage("Deleting project...");
    const response = await fetch("/api/admin/projects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: projectId }),
    });

    if (!response.ok) {
      setMessage("Failed to delete project.");
      return;
    }

    if (stayOnList) {
      router.refresh();
    } else {
      router.push("/admin/projects");
      router.refresh();
    }
    onAfterDeleteAction?.();
  };

  const handleDeleteImage = async (id: string) => {
    const response = await fetch("/api/admin/project-images", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      setMessage("Failed to delete image.");
      return;
    }

    setImages((prev) => prev.filter((image) => image.id !== id));
    setMessage("Image deleted.");
  };

  const handleImageMetaSave = async (
    imageId: string,
    payload: { alt_text: string | null; order_index: number; is_cover: boolean }
  ) => {
    const response = await fetch("/api/admin/project-images", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: imageId,
        projectId,
        alt_text: payload.alt_text,
        order_index: payload.order_index,
        is_cover: payload.is_cover,
      }),
    });

    if (!response.ok) {
      setMessage("Failed to update image metadata.");
      return;
    }

    setImages((prev) =>
      prev.map((image) => {
        if (payload.is_cover) {
          return { ...image, is_cover: image.id === imageId };
        }
        return image.id === imageId ? { ...image, ...payload } : image;
      })
    );
    setMessage("Image metadata saved.");
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg"
    >
      <h3 className="text-lg font-semibold text-neutral-900">{isNew ? "Add project" : "Edit project"}</h3>
      <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600">
        Name
        <input
          value={form.name}
          onChange={handleChange("name")}
          className="rounded-xl border border-neutral-200 px-3 py-2 outline-none focus:border-[var(--brand-primary)]"
          required
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600">
        Slug
        <input
          value={form.slug}
          onChange={handleChange("slug")}
          className="rounded-xl border border-neutral-200 px-3 py-2 outline-none focus:border-[var(--brand-primary)]"
          required
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600">
        Status
        <input
          value={form.status}
          onChange={handleChange("status")}
          className="rounded-xl border border-neutral-200 px-3 py-2 outline-none focus:border-[var(--brand-primary)]"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600">
        Price
        <input
          type="number"
          value={form.price}
          onChange={handleChange("price")}
          className="rounded-xl border border-neutral-200 px-3 py-2 outline-none focus:border-[var(--brand-primary)]"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600">
        Description
        <textarea
          value={form.description}
          onChange={handleChange("description")}
          className="min-h-28 rounded-xl border border-neutral-200 px-3 py-2 outline-none focus:border-[var(--brand-primary)]"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600">
        Address
        <input
          value={form.address}
          onChange={handleChange("address")}
          className="rounded-xl border border-neutral-200 px-3 py-2 outline-none focus:border-[var(--brand-primary)]"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600">
        Landmark
        <input
          value={form.landmark}
          onChange={handleChange("landmark")}
          className="rounded-xl border border-neutral-200 px-3 py-2 outline-none focus:border-[var(--brand-primary)]"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600">
        Map Embed URL
        <input
          value={form.map_embed_url}
          onChange={handleChange("map_embed_url")}
          className="rounded-xl border border-neutral-200 px-3 py-2 outline-none focus:border-[var(--brand-primary)]"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600">
        Project Images
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(event) => {
            const next = Array.from(event.target.files ?? []);
            setSelectedFiles(next);
            setCoverFileIndex(0);
          }}
          className="rounded-xl border border-neutral-200 px-3 py-2"
          disabled={!projectId && !isNew}
        />
      </label>
      {isNew && selectedFiles.length > 0 && (
        <div className="rounded-xl border border-neutral-200 p-4">
          <p className="text-sm font-semibold text-neutral-900">Cover image</p>
          <p className="text-xs text-neutral-500">First file is the default cover; pick another if needed.</p>
          <ul className="mt-2 flex flex-col gap-2 text-sm text-neutral-700">
            {selectedFiles.map((file, index) => (
              <li key={`${file.name}-${index}`} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pending-cover"
                  checked={coverFileIndex === index}
                  onChange={() => setCoverFileIndex(index)}
                />
                <span className="truncate">{file.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {images.length > 0 && (
        <div className="rounded-xl border border-neutral-200 p-4">
          <p className="text-sm font-semibold text-neutral-900">Current Images</p>
          <div className="mt-3 flex flex-col gap-3">
            {images.map((image) => (
              <ImageMetaRow
                key={image.id}
                image={image}
                onDelete={handleDeleteImage}
                onSave={handleImageMetaSave}
              />
            ))}
          </div>
        </div>
      )}
      {!hideDefaultActions && (
        <div className="flex items-center gap-3">
          <button
            className="w-full rounded-full border border-green-700 px-4 py-2 text-sm font-semi"
            type="submit"
          >
            {isNew ? "Create project" : "Submit Changes"}
          </button>

          {!isNew && (
            <button
              type="button"
              onClick={handleDeleteProject}
              className="w-full rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-700"
            >
              Delete project
            </button>
          )}
        </div>
      )}
      {message && <p className="text-sm text-neutral-600">{message}</p>}
    </form>
  );
}

type ImageMetaRowProps = {
  image: {
    id: string;
    image_path: string;
    order_index: number | null;
    alt_text: string | null;
    is_cover: boolean | null;
  };
  onDelete: (id: string) => Promise<void>;
  onSave: (id: string, payload: { alt_text: string | null; order_index: number; is_cover: boolean }) => Promise<void>;
};

function ImageMetaRow({ image, onDelete, onSave }: ImageMetaRowProps) {
  const [altText, setAltText] = useState(image.alt_text ?? "");
  const [orderIndex, setOrderIndex] = useState(String(image.order_index ?? 0));
  const [isCover, setIsCover] = useState(Boolean(image.is_cover));

  return (
    <div className="rounded-lg border border-neutral-200 p-3">
      <div className="mb-3 h-40 overflow-hidden rounded-lg border border-neutral-200">
        {/* Issue 1: Use unoptimized so the Supabase public URL loads without the optimizer blocking unknown hosts. */}
        <Image
          src={buildStorageUrl(image.image_path)}
          alt={altText || "Project image"}
          width={640}
          height={400}
          unoptimized
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-col gap-2">
        <input
          value={altText}
          onChange={(event) => setAltText(event.target.value)}
          placeholder="Alt text"
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
        <input
          type="number"
          value={orderIndex}
          onChange={(event) => setOrderIndex(event.target.value)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" checked={isCover} onChange={(event) => setIsCover(event.target.checked)} />
          Set as cover image
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onSave(image.id, {
                alt_text: altText || null,
                order_index: Number(orderIndex) || 0,
                is_cover: isCover,
              })
            }
            className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold text-neutral-700"
          >
            Save metadata
          </button>
          <button
            type="button"
            onClick={() => onDelete(image.id)}
            className="rounded-full border border-red-300 px-3 py-1 text-xs font-semibold text-red-700"
          >
            Delete image
          </button>
        </div>
      </div>
    </div>
  );
}
