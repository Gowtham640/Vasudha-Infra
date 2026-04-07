import { clsx } from "clsx";
import { generateCmsHtmlFromJson } from "../../lib/tiptap/generateCmsHtml";

export type SectionProseVariant = "default" | "heroDark" | "compact";

const variantClass: Record<SectionProseVariant, string> = {
  default:
    "prose prose-lg md:prose-xl max-w-none prose-headings:font-hero prose-headings:font-bold prose-p:leading-relaxed text-neutral-700 prose-p:text-neutral-600",
  // Hero: headings (H1–H3) = font-hero; body lines are <p> = font-heading (matches CMS: H1 title + P subtitle).
  heroDark:
    "prose prose-lg md:prose-xl max-w-none prose-invert prose-headings:font-hero prose-headings:font-bold prose-headings:text-white prose-p:text-white/85 [&_p]:[font-family:var(--font-heading)] [&_h1]:[font-family:var(--font-hero)] [&_h2]:[font-family:var(--font-hero)] [&_h3]:[font-family:var(--font-hero)]",
  compact:
    "prose prose-sm md:prose-base max-w-none prose-headings:font-heading prose-headings:font-semibold font-foreground prose-p:text-muted-foreground",
};

type Props = {
  json: unknown;
  variant?: SectionProseVariant;
  className?: string;
};

/**
 * Renders Tiptap JSON as HTML inside Tailwind Typography (controlled extensions only).
 */
export function SectionProse({ json, variant = "default", className }: Props) {
  const html = generateCmsHtmlFromJson(json);
  return (
    <div
      className={clsx(variantClass[variant], className)}
      // CMS HTML from trusted admin-only Tiptap JSON
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
