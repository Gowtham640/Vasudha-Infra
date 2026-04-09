"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { createPortal } from "react-dom";
import { Eye, EyeOff, SplitSquareHorizontal, X } from "lucide-react";
import { getCmsEditorExtensions } from "../../lib/tiptap/cmsExtensions";
import { emptyCmsDoc, parseCmsTiptapDoc } from "../../lib/tiptap/cmsDoc";
import type { CmsContentSectionName } from "../../lib/types";
import { CmsLivePreview } from "./CmsLivePreview";
import { cmsPreviewPageForSection } from "../../lib/cms/cmsPreviewPage";
import type { HomeProject } from "../home/FeaturedProjects";

type SectionRow = {
  name: string;
  label: string | null;
  is_visible: boolean | null;
  content: unknown;
  updated_at: string | null;
};

const logCmsUi = (message: string, detail?: Record<string, unknown>) => {
  console.log(`[ContentManagement] ${message}`, detail !== undefined ? JSON.stringify(detail) : "");
};

function CmsEditorField({
  docJson,
  onChange,
}: {
  docJson: unknown;
  onChange: (json: unknown) => void;
}) {
  const initial = useMemo(() => {
    const { doc } = parseCmsTiptapDoc(docJson);
    return doc;
  }, [docJson]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: getCmsEditorExtensions("Write here…"),
    content: initial,
    editorProps: {
      attributes: {
        // Site typography (font-hero, font-heading) applies only via SectionProse on the public site — not in the editor.
        class:
          "min-h-[220px] w-full max-w-none rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-green-700/30",
      },
      handleDrop: () => {
        return true;
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getJSON());
    },
  });

  /* Styling toolbar disabled — admins edit plain copy only; fonts come from SectionProse + globals.
  const [blockValue, setBlockValue] = useState("p");
  useEffect(() => {
    if (!editor) return;
    const syncBlock = () => {
      if (editor.isActive("heading", { level: 1 })) setBlockValue("1");
      else if (editor.isActive("heading", { level: 2 })) setBlockValue("2");
      else if (editor.isActive("heading", { level: 3 })) setBlockValue("3");
      else setBlockValue("p");
    };
    syncBlock();
    editor.on("selectionUpdate", syncBlock);
    editor.on("transaction", syncBlock);
    return () => {
      editor.off("selectionUpdate", syncBlock);
      editor.off("transaction", syncBlock);
    };
  }, [editor]);
  const setBlock = useCallback((value: string) => {
    if (!editor) return;
    const chain = editor.chain().focus();
    if (value === "p") {
      chain.setParagraph().run();
      return;
    }
    const level = Number(value) as 1 | 2 | 3;
    chain.setHeading({ level }).run();
  }, [editor]);
  */

  useEffect(() => {
    if (!editor) {
      return;
    }
    const { doc } = parseCmsTiptapDoc(docJson);
    const current = JSON.stringify(editor.getJSON());
    const next = JSON.stringify(doc);
    if (current !== next) {
      editor.commands.setContent(doc, { emitUpdate: false });
    }
  }, [docJson, editor]);

  if (!editor) {
    return <p className="text-sm text-neutral-500">Loading editor…</p>;
  }

  return (
    <div className="space-y-2">
      {/*
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1.5">
        Bold / Italic / block type / hard break — removed so content stays unstyled in storage.
      </div>
      */}
      <EditorContent editor={editor} />
    </div>
  );
}

type PreviewMode = "mobile" | "desktop";

function PreviewModal({
  mode,
  isMobileDevice,
  onModeChange,
  onClose,
  children,
}: {
  mode: PreviewMode;
  isMobileDevice: boolean;
  onModeChange: (mode: PreviewMode) => void;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [contentOpacity, setContentOpacity] = useState<0 | 100>(100);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    setContentOpacity(0);
    const timeout = window.setTimeout(() => setContentOpacity(100), 120);
    return () => window.clearTimeout(timeout);
  }, [mode]);

  return (
    <div
      className="fixed inset-0 z-80 bg-black/50 backdrop-blur-2xl"
      role="presentation"
      onClick={onClose}
    >
      <div className="flex h-full min-h-0 w-full flex-col px-5 pb-[calc(1.25rem+5rem+env(safe-area-inset-bottom,0px))] pt-22 md:pb-5 md:pt-10">
        <div className="mb-2 flex shrink-0 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-50"
            aria-label="Exit preview"
            title="Exit preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div
          className="flex min-h-0 w-full flex-1 flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Live preview"
          onClick={(event) => event.stopPropagation()}
        >
          {!isMobileDevice ? (
            <div className="mb-2 flex shrink-0 items-center justify-center">
              <div className="relative isolate flex h-10 rounded-full bg-white/80 p-1 shadow-sm">
                <div
                  aria-hidden="true"
                  className={[
                    "absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-green-700 shadow-sm",
                    "transition-[transform,opacity] duration-300 ease-out",
                    mode === "mobile" ? "translate-x-0 opacity-100" : "translate-x-full opacity-100",
                  ].join(" ")}
                />
                <button
                  type="button"
                  onClick={() => onModeChange("mobile")}
                  className={[
                    "relative z-10 flex h-8 min-w-24 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors duration-200",
                    mode === "mobile" ? "text-white" : "text-neutral-700 hover:text-neutral-900",
                  ].join(" ")}
                >
                  Mobile
                </button>
                <button
                  type="button"
                  onClick={() => onModeChange("desktop")}
                  className={[
                    "relative z-10 flex h-8 min-w-24 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors duration-200",
                    mode === "desktop" ? "text-white" : "text-neutral-700 hover:text-neutral-900",
                  ].join(" ")}
                >
                  PC
                </button>
              </div>
            </div>
          ) : null}
          <div
            className={[
              "overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl",
              "transition-opacity duration-200 ease-out",
              contentOpacity === 100 ? "opacity-100" : "opacity-0",
              mode === "desktop" || isMobileDevice
                ? "h-full w-full"
                : "mx-auto aspect-412/915 w-full max-w-[412px] max-h-full",
            ].join(" ")}
            data-preview-mode={mode}
          >
            <div
              className={[
                "w-full min-w-0 overflow-x-hidden overflow-y-auto",
                mode === "mobile" ? "h-full" : "h-full",
              ].join(" ")}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type ContentManagementClientProps = {
  homePreviewProjects: HomeProject[];
};

export function ContentManagementClient({ homePreviewProjects }: ContentManagementClientProps) {
  const [rows, setRows] = useState<SectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedName, setSelectedName] = useState<string>("");
  const [draft, setDraft] = useState<unknown>(emptyCmsDoc);
  const [draftVisibility, setDraftVisibility] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("mobile");
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  const deferredDraft = useDeferredValue(draft);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/content-sections");
      if (!response.ok) {
        logCmsUi("load failed", { status: response.status });
        setStatus("Could not load sections.");
        return;
      }
      const data = (await response.json()) as { sections: SectionRow[] };
      setRows(data.sections ?? []);
    } catch (error) {
      console.error("ContentManagement load", error);
      setStatus("Load error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const syncMode = () => {
      const nextIsMobile = mediaQuery.matches;
      setIsMobileDevice(nextIsMobile);
      if (nextIsMobile) {
        setPreviewMode("mobile");
      }
    };
    syncMode();
    mediaQuery.addEventListener("change", syncMode);
    return () => {
      mediaQuery.removeEventListener("change", syncMode);
    };
  }, []);

  useEffect(() => {
    if (rows.length === 0 || selectedName) {
      return;
    }
    const first = rows[0];
    if (first?.name) {
      setSelectedName(first.name);
    }
  }, [rows, selectedName]);

  const selectedRow = useMemo(
    () => rows.find((row) => row.name === selectedName),
    [rows, selectedName]
  );

  useEffect(() => {
    if (!selectedRow) {
      return;
    }
    setDraft(parseCmsTiptapDoc(selectedRow.content).doc);
    setDraftVisibility(selectedRow.is_visible !== false);
  }, [selectedRow]);

  const previewContentMap = useMemo(() => {
    const m: Record<string, unknown> = {};
    for (const row of rows) {
      const isSelected = row.name === selectedName;
      m[row.name] = isSelected ? deferredDraft : (row.content ?? emptyCmsDoc);
    }
    return m;
  }, [rows, selectedName, deferredDraft]);

  const previewPage = selectedName ? cmsPreviewPageForSection(selectedName) : "home";

  const handleSectionChange = (name: string) => {
    setSelectedName(name);
  };

  const save = async () => {
    if (!selectedName) {
      return;
    }
    setSaving(true);
    setStatus("Saving…");
    try {
      const response = await fetch("/api/admin/content-sections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedName as CmsContentSectionName,
          content: draft,
          is_visible: draftVisibility,
        }),
      });
      if (!response.ok) {
        const err = (await response.json()) as { error?: string };
        setStatus(err.error ?? "Save failed.");
        return;
      }
      setStatus("Saved.");
      await load();
    } catch (error) {
      console.error("ContentManagement save", error);
      setStatus("Save error.");
    } finally {
      setSaving(false);
    }
  };

  const livePreview = (
    <CmsLivePreview contentByName={previewContentMap} page={previewPage} homeProjects={homePreviewProjects} />
  );

  return (
    <section className="glass w-full min-w-0 max-w-full overflow-x-hidden rounded-2xl border border-white/40 bg-white/40 p-6 shadow-sm backdrop-blur-xl">
      <h2 className="text-xl font-semibold text-neutral-900">Content Management</h2>
      

      {loading ? (
        <p className="mt-4 text-sm text-neutral-500">Loading…</p>
      ) : (
        <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-2">
          <div className="min-w-0 space-y-4">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Section</span>
              <select
                value={selectedName}
                onChange={(e) => handleSectionChange(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
              >
                {rows.map((row) => (
                  <option key={row.name} value={row.name}>
                    {row.label ?? row.name}
                  </option>
                ))}
              </select>
            </label>

            <CmsEditorField docJson={draft} onChange={setDraft} />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving}
                className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                disabled={saving || !selectedName}
                onClick={() => setDraftVisibility((currentValue) => !currentValue)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50"
                aria-label={draftVisibility ? "Section visible" : "Section hidden"}
                title={draftVisibility ? "Section visible" : "Section hidden"}
              >
                {draftVisibility ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              {status ? <span className="text-sm text-neutral-600">{status}</span> : null}
            </div>
           
          </div>

          <div className="min-w-0 space-y-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
              <SplitSquareHorizontal className="h-4 w-4" />
              Live preview
            </div>

            <button
              type="button"
              onClick={() => {
                setPreviewMode("mobile");
                setPreviewOpen(true);
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-green-800"
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
          </div>
        </div>
      )}

      {previewOpen && typeof document !== "undefined"
        ? createPortal(
            <PreviewModal
              mode={previewMode}
              isMobileDevice={isMobileDevice}
              onModeChange={setPreviewMode}
              onClose={() => setPreviewOpen(false)}
            >
              {livePreview}
            </PreviewModal>,
            document.body
          )
        : null}
    </section>
  );
}
