import { NextResponse } from "next/server";
import { createRouteSupabaseClient } from "../../../../lib/supabase/server";
import type { Database } from "../../../../lib/types";

const sanitizeFileName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, "_");

/** Match StorageFileApi path cleanup so move() uses the same key the upload API stored. */
const normalizeStorageObjectKey = (path: string) =>
  path.replace(/^\/|\/$/g, "").replace(/\/+/g, "/");

/** Must match `storage.from("...")` bucket id — used to strip prefix from API `Key` when present. */
const STORAGE_BUCKET_ID = "images";

/** Server-side logs (stdout/stderr) — visible in the terminal running `next dev` / Node. */
const logPut = (step: string, detail?: Record<string, unknown>) => {
  console.log(`[api/admin/project-images PUT] ${step}`, detail !== undefined ? JSON.stringify(detail) : "");
};
const logPostImg = (step: string, detail?: Record<string, unknown>) => {
  console.log(`[api/admin/project-images POST] ${step}`, detail !== undefined ? JSON.stringify(detail) : "");
};
const logPatchImg = (step: string, detail?: Record<string, unknown>) => {
  console.log(`[api/admin/project-images PATCH] ${step}`, detail !== undefined ? JSON.stringify(detail) : "");
};
const logDeleteImg = (step: string, detail?: Record<string, unknown>) => {
  console.log(`[api/admin/project-images DELETE] ${step}`, detail !== undefined ? JSON.stringify(detail) : "");
};

/**
 * `upload()` returns `path` (client `cleanPath`) and `fullPath` (server `Key`). The stored object key
 * may differ (e.g. casing); `move()` must use the canonical key from `fullPath`.
 * See `StorageFileApi.uploadOrUpdate` return `{ path: cleanPath, fullPath: data.Key }`.
 */
function objectKeyFromUploadResult(
  uploaded: { path?: string; fullPath?: string } | null | undefined,
  fallbackPath: string
): string {
  const normalizedFallback = normalizeStorageObjectKey(fallbackPath);
  if (!uploaded) {
    return normalizedFallback;
  }
  const raw = uploaded.fullPath ?? uploaded.path ?? fallbackPath;
  let key = normalizeStorageObjectKey(raw);
  const prefix = `${STORAGE_BUCKET_ID}/`;
  if (key.startsWith(prefix)) {
    key = key.slice(prefix.length);
  }
  return key;
}

type ProjectImage = {
  id: string;
  image_path: string;
};

type ProjectImageRow = Database["public"]["Tables"]["project_images"]["Row"];
type ProjectImageInsert = Database["public"]["Tables"]["project_images"]["Insert"];
type ProjectImageUpdate = Database["public"]["Tables"]["project_images"]["Update"];

type ProjectImageListItem = Pick<ProjectImageRow, "id" | "image_path" | "alt_text" | "is_cover" | "order_index">;

/**
 * Step 1 (create flow): upload files to the `images` bucket only — no DB rows.
 * Returns ordered storage paths under `pending/{batchId}/…` for step 3.
 */
export async function PUT(request: Request) {
  logPut("start staging upload (bucket=images, folder=pending/{batchId})");
  const supabase = createRouteSupabaseClient();
  const formData = await request.formData();
  const files = formData.getAll("images");

  if (files.length === 0) {
    logPut("abort: no files in formData");
    return NextResponse.json({ error: "At least one image is required." }, { status: 400 });
  }

  const batchId = crypto.randomUUID();
  logPut("substep: generated batchId", { batchId, fileCount: files.length });
  const paths: string[] = [];
  let fileOrdinal = 0;

  for (let index = 0; index < files.length; index += 1) {
    const fileEntry = files[index];

    if (!(fileEntry instanceof File)) {
      logPut("substep: skip non-File entry", { index });
      continue;
    }

    const fileName = `${fileOrdinal}-${sanitizeFileName(fileEntry.name)}`;
    const imagePath = `pending/${batchId}/${fileName}`;
    fileOrdinal += 1;

    logPut("substep: calling storage.upload", {
      bucket: STORAGE_BUCKET_ID,
      intendedObjectKey: imagePath,
      ordinal: fileOrdinal - 1,
      originalFileName: fileEntry.name,
      contentType: fileEntry.type || "application/octet-stream",
    });

    const { data: uploaded, error: uploadError } = await supabase.storage.from("images").upload(imagePath, fileEntry, {
      upsert: false,
      contentType: fileEntry.type || "application/octet-stream",
    });

    if (uploadError) {
      console.error("[api/admin/project-images PUT] storage.upload FAILED", uploadError.message, uploadError);
      logPut("rollback: removing already-staged paths", { count: paths.length, paths });
      if (paths.length > 0) {
        await supabase.storage.from("images").remove(paths);
      }
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    logPut("substep: storage.upload OK", {
      returnedPath: uploaded?.path,
      returnedFullPath: uploaded?.fullPath,
      intendedObjectKey: imagePath,
    });

    const storedPath = objectKeyFromUploadResult(uploaded, imagePath);
    logPut("substep: canonical key for DB/move chain", {
      canonicalKey: storedPath,
      note: "POST /api/admin/projects move() uses this string as sourceKey",
    });
    paths.push(storedPath);
  }

  if (paths.length === 0) {
    logPut("abort: no valid File entries after loop");
    return NextResponse.json({ error: "No valid image files were uploaded." }, { status: 400 });
  }

  logPut("done: returning paths to client", { pathCount: paths.length, paths });
  return NextResponse.json({ success: true, paths });
}

export async function POST(request: Request) {
  logPostImg("start append images to existing project");
  const supabase = createRouteSupabaseClient();
  const formData = await request.formData();
  const projectId = formData.get("projectId");
  const files = formData.getAll("images");

  if (typeof projectId !== "string" || !projectId) {
    logPostImg("abort: missing projectId");
    return NextResponse.json({ error: "projectId is required." }, { status: 400 });
  }

  if (files.length === 0) {
    logPostImg("abort: no files");
    return NextResponse.json({ error: "At least one image is required." }, { status: 400 });
  }

  logPostImg("substep: query max order_index for project", { projectId });

  // Issue 3: Append after existing rows — `order_index` must continue from the current max for this project.
  const { data: maxOrderRow } = await supabase
    .from("project_images")
    .select("order_index")
    .eq("project_id", projectId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const baseOrder =
    typeof maxOrderRow?.order_index === "number" && !Number.isNaN(maxOrderRow.order_index)
      ? maxOrderRow.order_index
      : -1;

  logPostImg("substep: max order result", { maxOrderRow, baseOrder });

  const uploaded: ProjectImageListItem[] = [];
  let fileOrdinal = 0;

  for (let index = 0; index < files.length; index += 1) {
    const fileEntry = files[index];

    if (!(fileEntry instanceof File)) {
      logPostImg("substep: skip non-File", { index });
      continue;
    }

    const fileName = `${Date.now()}-${fileOrdinal}-${sanitizeFileName(fileEntry.name)}`;
    const imagePath = `${projectId}/${fileName}`;
    fileOrdinal += 1;

    logPostImg("substep: storage.upload", {
      bucket: STORAGE_BUCKET_ID,
      intendedObjectKey: imagePath,
      order_index: baseOrder + fileOrdinal,
    });

    const { data: uploadData, error: uploadError } = await supabase.storage.from("images").upload(imagePath, fileEntry, {
      upsert: false,
      contentType: fileEntry.type || "application/octet-stream",
    });

    if (uploadError) {
      console.error("[api/admin/project-images POST] storage.upload FAILED", uploadError.message, uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    logPostImg("substep: storage.upload OK", {
      returnedPath: uploadData?.path,
      returnedFullPath: uploadData?.fullPath,
    });

    const storedImagePath = objectKeyFromUploadResult(uploadData, imagePath);
    logPostImg("substep: canonical key", { storedImagePath });

    const insertRow: ProjectImageInsert = {
      project_id: projectId,
      image_path: storedImagePath,
      order_index: baseOrder + fileOrdinal,
      alt_text: null,
      is_cover: false,
    };

    logPostImg("substep: inserting project_images row", { insertRow });

    const { data: createdImage, error: insertError } = await supabase
      .from("project_images")
      .insert(insertRow)
      .select("id, image_path, alt_text, is_cover, order_index")
      .single<ProjectImageListItem>();

    if (insertError || !createdImage) {
      if (insertError) {
        console.error("[api/admin/project-images POST] project_images insert FAILED", insertError.message, insertError);
      }
      logPostImg("rollback: storage.remove", { storedImagePath });
      await supabase.storage.from("images").remove([storedImagePath]);
      return NextResponse.json({ error: insertError?.message ?? "Insert returned no row." }, { status: 500 });
    }

    logPostImg("substep: insert OK", { rowId: createdImage.id, image_path: createdImage.image_path });
    uploaded.push(createdImage);
  }

  logPostImg("done", { imageCount: uploaded.length });
  return NextResponse.json({ success: true, images: uploaded });
}

export async function PATCH(request: Request) {
  logPatchImg("start update metadata");
  const supabase = createRouteSupabaseClient();
  const payload = (await request.json()) as {
    id?: string;
    projectId?: string;
    alt_text?: string | null;
    order_index?: number | null;
    is_cover?: boolean | null;
  };

  if (!payload.id || !payload.projectId) {
    logPatchImg("abort: missing id or projectId");
    return NextResponse.json({ error: "id and projectId are required." }, { status: 400 });
  }

  logPatchImg("payload", { id: payload.id, projectId: payload.projectId, is_cover: payload.is_cover });

  const updatePayload: ProjectImageUpdate = {
    alt_text: payload.alt_text ?? null,
    order_index: payload.order_index ?? 0,
    is_cover: payload.is_cover ?? false,
  };

  if (payload.is_cover) {
    logPatchImg("substep: clear other covers for project", { projectId: payload.projectId });
    const clearCover: ProjectImageUpdate = { is_cover: false };
    await supabase.from("project_images").update(clearCover).eq("project_id", payload.projectId);
  }

  logPatchImg("substep: update project_images row", { updatePayload });
  const { data, error } = await supabase
    .from("project_images")
    .update(updatePayload)
    .eq("id", payload.id)
    .select("id, image_path, alt_text, order_index, is_cover")
    .single<ProjectImageRow>();

  if (error) {
    console.error("[api/admin/project-images PATCH] update FAILED", error.message, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  logPatchImg("done", { image_path: data?.image_path });
  return NextResponse.json({ success: true, image: data });
}

export async function DELETE(request: Request) {
  logDeleteImg("start delete image row + storage object");
  const supabase = createRouteSupabaseClient();
  const payload = (await request.json()) as { id?: string };

  if (!payload.id) {
    logDeleteImg("abort: missing id");
    return NextResponse.json({ error: "Image id is required." }, { status: 400 });
  }

  logDeleteImg("substep: fetch row", { id: payload.id });

  const { data: imageRow, error: imageFetchError } = await supabase
  .from("project_images")
  .select("id, image_path")
  .eq("id", payload.id)
  .single<ProjectImage>();

  if (imageFetchError) {
    console.error("[api/admin/project-images DELETE] select FAILED", imageFetchError.message, imageFetchError);
    return NextResponse.json({ error: imageFetchError.message }, { status: 500 });
  }

  logDeleteImg("substep: delete DB row", { image_path: imageRow.image_path });

  const { error: deleteDbError } = await supabase.from("project_images").delete().eq("id", payload.id);

  if (deleteDbError) {
    console.error("[api/admin/project-images DELETE] DB delete FAILED", deleteDbError.message, deleteDbError);
    return NextResponse.json({ error: deleteDbError.message }, { status: 500 });
  }

  logDeleteImg("substep: storage.remove", { keys: [imageRow.image_path] });
  await supabase.storage.from("images").remove([imageRow.image_path]);

  logDeleteImg("done");
  return NextResponse.json({ success: true });
}
