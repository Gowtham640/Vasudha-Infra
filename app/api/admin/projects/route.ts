import { NextResponse } from "next/server";
import { createRouteSupabaseClient } from "../../../../lib/supabase/server";
import type { Database } from "../../../../lib/types";

/** Same normalization as @supabase/storage-js upload path cleanup — move() must use this exact key. */
const normalizeStorageObjectKey = (path: string) =>
  path.replace(/^\/|\/$/g, "").replace(/\/+/g, "/");

/** Dedupe while preserving order (duplicate paths => second move on same source => 404). */
const uniquePathsInOrder = (paths: string[]): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of paths) {
    const n = normalizeStorageObjectKey(p);
    if (seen.has(n)) {
      continue;
    }
    seen.add(n);
    out.push(n);
  }
  return out;
};

type ProjectPayload = {
  id?: string;
  name: string;
  slug: string;
  description: string | null;
  status: string | null;
  price: number | null;
  address: string | null;
  landmark: string | null;
  map_embed_url: string | null;
  /** Step 2 output: ordered storage paths from staging upload (PUT /api/admin/project-images). */
  image_paths?: string[];
  /** Which staged path is the cover; must match an entry in `image_paths` when set. */
  cover_image_path?: string | null;
};
type ProjectInsertResponse = {
  id: string;
};

/** Server-side — visible in the terminal running Next.js (stdout/stderr). */
const logProjects = (method: string, step: string, detail?: Record<string, unknown>) => {
  console.log(`[api/admin/projects ${method}] ${step}`, detail !== undefined ? JSON.stringify(detail) : "");
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isStorageNotFoundError = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return false;
  }
  const candidate = error as { status?: number; statusCode?: string; message?: string };
  return (
    candidate.status === 404 ||
    candidate.statusCode === "404" ||
    (typeof candidate.message === "string" && candidate.message.toLowerCase().includes("object not found"))
  );
};

const sourceObjectCandidates = (oldPath: string) => {
  const normalized = normalizeStorageObjectKey(oldPath);
  const withBucketPrefix = normalizeStorageObjectKey(`images/${normalized}`);
  return Array.from(new Set([normalized, withBucketPrefix]));
};

type StagedTransferResult = {
  sourcePath: string;
  finalPath: string;
};

const transferStagedImageToProjectPath = async (
  bucket: ReturnType<ReturnType<typeof createRouteSupabaseClient>["storage"]["from"]>,
  sourcePath: string,
  projectId: string,
  orderIndex: number
): Promise<StagedTransferResult> => {
  const sourceCandidates = sourceObjectCandidates(sourcePath);
  let blob: Blob | null = null;
  let resolvedSourcePath: string | null = null;
  let lastDownloadError: { message: string } | null = null;

  for (const candidate of sourceCandidates) {
    const { data, error } = await bucket.download(candidate);
    if (!error && data) {
      blob = data;
      resolvedSourcePath = candidate;
      break;
    }
    lastDownloadError = error ?? { message: "Unknown download error." };
  }

  if (!blob || !resolvedSourcePath) {
    throw new Error(lastDownloadError?.message ?? "Unable to download staged image.");
  }

  const sourceFileName = resolvedSourcePath.split("/").pop() ?? `${orderIndex}.bin`;
  const finalPath = `${projectId}/${sourceFileName}`;
  const { error: uploadError } = await bucket.upload(finalPath, blob, { upsert: false });
  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const removeCandidates = sourceObjectCandidates(resolvedSourcePath);
  await bucket.remove(removeCandidates);

  return {
    sourcePath: resolvedSourcePath,
    finalPath,
  };
};

export async function PATCH(request: Request) {
  logProjects("PATCH", "start update project");
  const supabase = createRouteSupabaseClient();
  const payload = (await request.json()) as ProjectPayload;

  const updateData: Database["public"]["Tables"]["projects"]["Update"] = {
    name: payload.name,
    slug: payload.slug,
    description: payload.description,
    status: payload.status,
    price: payload.price,
    address: payload.address,
    landmark: payload.landmark,
    map_embed_url: payload.map_embed_url,
  };

  if (!payload.id) {
    logProjects("PATCH", "FAIL: missing project id");
    return NextResponse.json({ error: "Project id is required." }, { status: 400 });
  }

  logProjects("PATCH", "substep: supabase.from(projects).update", { projectId: payload.id, fields: Object.keys(updateData) });

  const { error } = await supabase.from("projects").update(updateData).eq("id", payload.id);

  if (error) {
    console.error("[api/admin/projects PATCH] projects.update FAILED", error.message, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  logProjects("PATCH", "done: success", { projectId: payload.id });
  return NextResponse.json({ success: true });
}

export async function POST(request: Request) {
  logProjects("POST", "start create project (optional staged images + move)");
  const supabase = createRouteSupabaseClient();
  const payload = (await request.json()) as ProjectPayload;

  const insertData: Database["public"]["Tables"]["projects"]["Insert"] = {
    name: payload.name,
    slug: payload.slug,
    description: payload.description,
    status: payload.status,
    price: payload.price,
    address: payload.address,
    landmark: payload.landmark,
    map_embed_url: payload.map_embed_url,
  };

  logProjects("POST", "substep: inserting into public.projects", { slug: payload.slug });

  const { data, error } = await supabase
    .from("projects")
    .insert(insertData)
    .select("id")
    .single<ProjectInsertResponse>();

  if (error) {
    console.error("[api/admin/projects POST] projects.insert FAILED", error.message, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    logProjects("POST", "abort: insert returned no data row");
    return NextResponse.json({ error: "Insert failed, no data returned." }, { status: 500 });
  }

  logProjects("POST", "substep: project row created", { projectId: data.id });

  const rawPaths = payload.image_paths ?? [];
  if (rawPaths.length > 0) {
    logProjects("POST", "substep: raw image_paths from request body", { rawPaths, cover_image_path: payload.cover_image_path });

    const paths = uniquePathsInOrder(rawPaths);
    logProjects("POST", "substep: paths after dedupe (order preserved)", { paths });

    const allowed = paths.every(
      (p) => typeof p === "string" && p.startsWith("pending/") && !p.includes("..")
    );
    if (!allowed) {
      logProjects("POST", "FAIL: image_paths validation (must be pending/…)", { paths });
      await supabase.storage.from("images").remove(paths);
      await supabase.from("projects").delete().eq("id", data.id);
      return NextResponse.json({ error: "Invalid image_paths; only pending/ staging paths are allowed." }, { status: 400 });
    }

    const coverNormalized = payload.cover_image_path != null ? normalizeStorageObjectKey(payload.cover_image_path) : null;
    const coverPath =
      coverNormalized && paths.includes(coverNormalized) ? coverNormalized : paths[0];

    logProjects("POST", "substep: resolved cover path", { coverPath });

    // Rewrite: transfer staged objects to final project folder first, then insert DB rows with final paths.
    const bucket = supabase.storage.from("images");
    const transferred: StagedTransferResult[] = [];

    for (let index = 0; index < paths.length; index += 1) {
      const stagedPath = paths[index];
      try {
        logProjects("POST", "substep: transfer staged image", {
          index,
          stagedPath,
          projectId: data.id,
        });
        const transfer = await transferStagedImageToProjectPath(bucket, stagedPath, data.id, index);
        transferred.push(transfer);
        logProjects("POST", "substep: transfer OK", transfer);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to transfer staged image.";
        console.error("[api/admin/projects POST] staged transfer FAILED", message, error);
        logProjects("POST", "rollback: remove final uploads + delete project", {
          uploadedCount: transferred.length,
          projectId: data.id,
        });
        if (transferred.length > 0) {
          await bucket.remove(transferred.map((entry) => entry.finalPath));
        }
        await supabase.from("projects").delete().eq("id", data.id);
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }

    const coverTransfer = transferred.find(
      (entry) => normalizeStorageObjectKey(entry.sourcePath) === normalizeStorageObjectKey(coverPath)
    );
    const coverFinalPath = coverTransfer?.finalPath ?? transferred[0]?.finalPath ?? null;

    const imageRows: Database["public"]["Tables"]["project_images"]["Insert"][] = transferred.map((entry, order_index) => ({
      project_id: data.id,
      image_path: entry.finalPath,
      order_index,
      alt_text: null,
      is_cover: entry.finalPath === coverFinalPath,
    }));

    logProjects("POST", "substep: bulk insert project_images with final paths", { rowCount: imageRows.length, imageRows });

    const { error: imagesError } = await supabase.from("project_images").insert(imageRows);
    if (imagesError) {
      console.error("[api/admin/projects POST] project_images.insert FAILED", imagesError.message, imagesError);
      logProjects("POST", "rollback: remove final uploads + delete project", {
        projectId: data.id,
        finalPaths: transferred.map((entry) => entry.finalPath),
      });
      await bucket.remove(transferred.map((entry) => entry.finalPath));
      await supabase.from("projects").delete().eq("id", data.id);
      return NextResponse.json({ error: imagesError.message }, { status: 500 });
    }

    logProjects("POST", "done: transferred from pending to final and inserted DB rows");
  } else {
    logProjects("POST", "no image_paths; skip project_images + storage move");
  }

  logProjects("POST", "done: success", { projectId: data.id });
  return NextResponse.json({ success: true, id: data.id });
}

export async function DELETE(request: Request) {
  logProjects("DELETE", "start delete project");
  const supabase = createRouteSupabaseClient();
  const payload = (await request.json()) as { id?: string };

  if (!payload.id) {
    logProjects("DELETE", "FAIL: missing project id");
    return NextResponse.json({ error: "Project id is required." }, { status: 400 });
  }

  logProjects("DELETE", "substep: supabase.from(projects).delete", { projectId: payload.id });

  const { error } = await supabase.from("projects").delete().eq("id", payload.id);

  if (error) {
    console.error("[api/admin/projects DELETE] projects.delete FAILED", error.message, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  logProjects("DELETE", "done: success", { projectId: payload.id });
  return NextResponse.json({ success: true });
}
