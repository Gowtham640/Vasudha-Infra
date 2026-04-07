"use client";

import Link from "next/link";
import { useI18n } from "../i18n/I18nProvider";

export type ProjectSummary = {
  id: string;
  name: string;
  location?: string | null;
  price?: number | null;
  status?: string | null;
  description?: string | null;
};

export function ProjectCard({ project }: { project: ProjectSummary }) {
  const { t } = useI18n();

  return (
    <Link
      href={`/projects/${project.id}`}
      className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-linear-to-b from-white/0 to-white p-5 shadow-[0_20px_45px_rgba(8,60,32,0.05)] transition hover:-translate-y-1 hover:shadow-[0_35px_75px_rgba(8,60,32,0.1)]"
    >
      <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">{project.status || t("projects.available")}</div>
      {/* Removed mt-3 -> vertical spacing now controlled by parent page (gives page full layout control) */}
      <h3 className="text-2xl font-semibold text-neutral-900">{project.name}</h3>
      {/* Removed mt-2 -> vertical spacing now controlled by parent page (gives page full layout control) */}
      <p className="text-sm text-neutral-600">{project.location}</p>
      {/* Removed mt-4 -> vertical spacing now controlled by parent page (gives page full layout control) */}
      <p className="text-lg font-semibold text-(--brand-dark)">
        {project.price ? `₹${project.price.toLocaleString("en-IN")}` : t("common.price_on_request")}
      </p>
      {/* Removed mt-5 -> vertical spacing now controlled by parent page (gives page full layout control) */}
      <div className="flex items-center justify-between text-sm text-neutral-500">
        <span>{t("projects.view_details")}</span>
        <span aria-hidden="true">→</span>
      </div>
    </Link>
  );
}
