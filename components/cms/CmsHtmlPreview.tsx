"use client";

import { useMemo } from "react";
import { clsx } from "clsx";
import { generateCmsHtmlFromJson } from "../../lib/tiptap/generateCmsHtml";

type Props = {
  json: unknown;
  className?: string;
};

/**
 * Client-side HTML preview (same pipeline as `SectionProse` on the server).
 */
export function CmsHtmlPreview({ json, className }: Props) {
  const html = useMemo(() => generateCmsHtmlFromJson(json), [json]);
  return (
    <div
      className={clsx(
        "prose prose-lg md:prose-xl max-w-none prose-headings:font-hero prose-headings:font-bold prose-p:leading-relaxed text-neutral-700 prose-p:text-neutral-600",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
