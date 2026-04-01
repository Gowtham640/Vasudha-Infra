"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useI18n } from "../i18n/I18nProvider";

type LeadFormProps = {
  projectId?: string;
  compact?: boolean;
};

export function LeadForm({ projectId, compact = false }: LeadFormProps) {
  const { t } = useI18n();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange =
    (field: keyof typeof form) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...form, project_id: projectId }),
    });

    if (response.ok) {
      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "" });
    } else {
      setStatus("error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col ${compact ? "gap-3 rounded-xl bg-white/95 p-4" : "gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-card"}`}
    >
      <div className={`grid gap-3 ${compact ? "grid-cols-1" : "md:grid-cols-2"}`}>
        <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-700">
          {t("lead.name")}
          <input
            required
            value={form.name}
            onChange={handleChange("name")}
            className="rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-green-700"
          />
        </label>
        {compact ? null : (
          <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-700">
            {t("lead.email")}
            <input
              type="email"
              required
              value={form.email}
              onChange={handleChange("email")}
              className="rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-green-700"
            />
          </label>
        )}
      </div>
      <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-700">
        {t("lead.phone")}
        <input
          required
          value={form.phone}
          onChange={handleChange("phone")}
          className="rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-green-700"
        />
      </label>
      {compact ? null : (
        <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-700">
          {t("lead.message")}
          <textarea
            required
            value={form.message}
            onChange={handleChange("message")}
            className="min-h-[120px] rounded-2xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-green-700"
          />
        </label>
      )}
      <p className="text-xs text-neutral-500">
        {compact ? t("lead.compact_note") : t("lead.full_note")}
      </p>
      <button
        type="submit"
        className={`w-full rounded-xl bg-green-700 text-center text-sm font-semibold text-white transition-colors hover:bg-green-800 ${compact ? "py-2.5" : "py-3"}`}
        disabled={status === "submitting"}
      >
        {status === "submitting" ? t("lead.sending") : compact ? t("lead.get_callback") : t("lead.request_callback")}
      </button>
      {status === "success" && <p className="text-sm text-green-600">{t("lead.success")}</p>}
      {status === "error" && <p className="text-sm text-red-600">{t("lead.error")}</p>}
    </form>
  );
}
