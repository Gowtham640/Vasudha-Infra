"use client";

import { useState } from "react";

type SectionEditorProps = {
  title: string;
  sectionId: string;
  initialContent: Record<string, unknown>;
};

export function SectionEditor({ title, sectionId, initialContent }: SectionEditorProps) {
  const [json, setJson] = useState(JSON.stringify(initialContent ?? {}, null, 2));
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Saving...");
    const response = await fetch("/api/admin/sections", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section_id: sectionId,
        content: JSON.parse(json),
      }),
    });

    if (response.ok) {
      setStatus("Saved");
    } else {
      setStatus("Failed to save");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        <button
          type="submit"
          className="rounded-full border border-[var(--brand-primary)] px-4 py-1 text-xs font-semibold text-[var(--brand-primary)]"
        >
          Save
        </button>
      </div>
      <textarea
        value={json}
        onChange={(event) => setJson(event.target.value)}
        className="h-40 w-full rounded-xl border border-neutral-200 bg-neutral-50 p-3 font-mono text-xs"
      />
      {status && <p className="text-xs text-neutral-500">{status}</p>}
    </form>
  );
}
