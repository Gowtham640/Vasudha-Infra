"use client";

import { ChangeEvent, FormEvent, useState } from "react";

type ProjectEditorProps = {
  project: {
    id: string;
    name: string;
    status?: string | null;
    price?: number | null;
    description?: string | null;
  };
};

export function ProjectEditor({ project }: ProjectEditorProps) {
  const [form, setForm] = useState({
    name: project.name,
    status: project.status ?? "available",
    price: project.price?.toString() ?? "",
  });
  const [message, setMessage] = useState<string | null>(null);

  const handleChange =
    (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("Saving...");
    const response = await fetch("/api/admin/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: project.id,
        name: form.name,
        status: form.status,
        price: form.price ? Number(form.price) : null,
      }),
    });

    if (response.ok) {
      setMessage("Project saved.");
    } else {
      setMessage("Failed to save.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg">
      {/* Removed space-y-4 -> vertical spacing now controlled by parent page (gives page full layout control) */}
      <h3 className="text-lg font-semibold text-neutral-900">Edit project</h3>
      <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600">
        Name
        <input
          value={form.name}
          onChange={handleChange("name")}
          className="rounded-xl border border-neutral-200 px-3 py-2 outline-none focus:border-[var(--brand-primary)]"
        />
        {/* Removed mt-1 -> vertical spacing now controlled by parent page (gives page full layout control) */}
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600">
        Status
        <input
          value={form.status}
          onChange={handleChange("status")}
          className="rounded-xl border border-neutral-200 px-3 py-2 outline-none focus:border-[var(--brand-primary)]"
        />
        {/* Removed mt-1 -> vertical spacing now controlled by parent page (gives page full layout control) */}
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600">
        Price
        <input
          type="number"
          value={form.price}
          onChange={handleChange("price")}
          className="rounded-xl border border-neutral-200 px-3 py-2 outline-none focus:border-[var(--brand-primary)]"
        />
        {/* Removed mt-1 -> vertical spacing now controlled by parent page (gives page full layout control) */}
      </label>
      <button className="primary-button w-full text-center" type="submit">
        Save changes
      </button>
      {message && <p className="text-sm text-neutral-600">{message}</p>}
    </form>
  );
}
