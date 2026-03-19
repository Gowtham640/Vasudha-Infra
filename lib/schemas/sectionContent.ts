import { z } from "zod";
import type { SectionKey } from "../types";

const heroSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  ctaLabel: z.string(),
  ctaHref: z.string().url().optional().or(z.literal("#")).default("#"),
  description: z.string().optional(),
});

const whyUsSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  cards: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      stat: z.string().optional(),
    })
  ),
});

const leadBannerSchema = z.object({
  title: z.string(),
  description: z.string(),
  ctaLabel: z.string(),
  ctaHref: z.string().url().optional().or(z.literal("#")).default("#"),
  background: z.string().optional(),
});

const contactSchema = z.object({
  title: z.string(),
  description: z.string(),
});

const projectsListSchema = z.object({
  title: z.string(),
  description: z.string(),
  spotlightProjectIds: z.array(z.string()).optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
});

const aboutSchema = z.object({
  headline: z.string(),
  body: z.string(),
  stats: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    })
  ),
});

const contactCtaSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  ctaLabel: z.string(),
});

type SchemaMap = {
  [key in SectionKey]: () => z.ZodTypeAny;
};

const schemaMap: SchemaMap = {
  home_hero: () => heroSchema,
  home_why_us: () => whyUsSchema,
  home_lead_banner: () => leadBannerSchema,
  home_contact: () => contactSchema,
  projects_list: () => projectsListSchema,
  about_overview: () => aboutSchema,
  contact_cta: () => contactCtaSchema,
};

export function parseSectionContent<T extends SectionKey>(key: T, value: unknown) {
  const schema = schemaMap[key]();
  return {
    success: schema.safeParse(value),
    schema,
  };
}
