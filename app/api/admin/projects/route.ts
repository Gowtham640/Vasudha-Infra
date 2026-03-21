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

    const imageRows: Database["public"]["Tables"]["project_images"]["Insert"][] = paths.map((image_path, order_index) => ({
      project_id: data.id,
      image_path,
      order_index,
      alt_text: null,
      is_cover: image_path === coverPath,
    }));

    logProjects("POST", "substep: bulk insert project_images", { rowCount: imageRows.length, imageRows });

    const { data: insertedRows, error: imagesError } = await supabase
      .from("project_images")
      .insert(imageRows)
      .select("id, image_path");

    if (imagesError) {
      console.error("[api/admin/projects POST] project_images.insert FAILED", imagesError.message, imagesError);
      logProjects("POST", "rollback: remove staged files + delete project", { paths });
      await supabase.storage.from("images").remove(paths);
      await supabase.from("projects").delete().eq("id", data.id);
      return NextResponse.json({ error: imagesError.message }, { status: 500 });
    }

    logProjects("POST", "substep: project_images rows inserted", { insertedRows });

    // Issue 2: After DB rows exist, move staged objects from `pending/...` to final `{projectId}/...` (same layout as POST /project-images).
    const bucket = supabase.storage.from("images");
    const moved: { oldPath: string; newPath: string }[] = [];

    let moveIndex = 0;
    for (const row of insertedRows ?? []) {
      moveIndex += 1;
      const oldPath = normalizeStorageObjectKey(row.image_path ?? "");
      const fileName = oldPath.split("/").pop() ?? "";
      const newPath = `${data.id}/${fileName}`;

      logProjects("POST", `substep: storage.move ${moveIndex}/${insertedRows?.length ?? 0}`, {
        sourceKeyOldPath: oldPath,
        destinationKeyNewPath: newPath,
        rowId: row.id,
        note: "move() looks up object at sourceKey inside bucket images",
      });

      const { error: moveError } = await bucket.move(oldPath, newPath);
      if (moveError) {
        console.error("[api/admin/projects POST] storage.move FAILED", moveError.message, moveError);
        logProjects("POST", "rollback: reverse previous moves", { movedCount: moved.length });
        for (const pair of [...moved].reverse()) {
          await bucket.move(pair.newPath, pair.oldPath);
        }
        await supabase.from("project_images").delete().eq("project_id", data.id);
        await supabase.from("projects").delete().eq("id", data.id);
        return NextResponse.json({ error: moveError.message }, { status: 500 });
      }

      logProjects("POST", "substep: move OK; updating DB image_path to final key", { rowId: row.id, newPath });

      moved.push({ oldPath, newPath });

      const { error: pathUpdateError } = await supabase
        .from("project_images")
        .update({ image_path: newPath })
        .eq("id", row.id);

      if (pathUpdateError) {
        console.error("[api/admin/projects POST] project_images.update after move FAILED", pathUpdateError.message, pathUpdateError);
        logProjects("POST", "rollback: move file back + reverse prior moves", { newPath, oldPath });
        await bucket.move(newPath, oldPath);
        for (const pair of [...moved.slice(0, -1)].reverse()) {
          await bucket.move(pair.newPath, pair.oldPath);
        }
        await supabase.from("project_images").delete().eq("project_id", data.id);
        await supabase.from("projects").delete().eq("id", data.id);
        return NextResponse.json({ error: pathUpdateError.message }, { status: 500 });
      }

      logProjects("POST", "substep: DB path updated for row", { rowId: row.id, image_path: newPath });
    }

    logProjects("POST", "done: all staging files moved and DB paths updated");
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
