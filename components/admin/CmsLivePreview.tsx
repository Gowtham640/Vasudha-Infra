"use client";

import { HomeHero } from "../home/HomeHero";
import { WhyChooseUs } from "../home/WhyChooseUs";
import { FeaturedProjects, type HomeProject } from "../home/FeaturedProjects";
import { LeadForm } from "../contact/LeadForm";
import { HomeContactInfo } from "../home/HomeContactInfo";
import { SectionProse } from "../cms/SectionProse";
import { AboutClient } from "../about/AboutClient";
import { ContactPrivacyNote } from "../contact/ContactPrivacyNote";
import { emptyCmsDoc } from "../../lib/tiptap/cmsDoc";
import type { CmsPreviewPage } from "../../lib/cms/cmsPreviewPage";

type Props = {
  /** Merged section name → Tiptap JSON (same shape as Supabase `section_content.content`). */
  contentByName: Record<string, unknown>;
  page: CmsPreviewPage;
  /** Home featured strip — same data as `app/page.tsx` so the preview matches production. */
  homeProjects: HomeProject[];
};

function doc(map: Record<string, unknown>, key: string): unknown {
  const v = map[key];
  return v ?? emptyCmsDoc;
}

/**
 * Renders the same building blocks as public pages, with injected CMS JSON — no mock layouts.
 */
export function CmsLivePreview({ contentByName, page, homeProjects }: Props) {
  if (page === "home") {
    const cardDocs = [
      doc(contentByName, "why_us_1"),
      doc(contentByName, "why_us_2"),
      doc(contentByName, "why_us_3"),
      doc(contentByName, "why_us_4"),
    ] as const;

    return (
      <main className="flex w-full min-w-0 max-w-full flex-col gap-20 overflow-x-hidden">
        <HomeHero doc={doc(contentByName, "home_hero")} />
        <div className="min-w-0 px-2">
          <WhyChooseUs introDoc={doc(contentByName, "why_us_intro")} cardDocs={cardDocs} preview />
          <FeaturedProjects projects={homeProjects} preview />
        </div>
        <section className="relative overflow-x-hidden bg-green-700 px-4 py-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/vasudha1white.svg"
            alt="Vasudha background logo"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10 invert-brightness-0"
          />
          <div className="container relative">
            <div className="glass grid grid-cols-1 items-center gap-4 rounded-3xl border border-white/40 bg-white/20 p-3 backdrop-blur-xl md:gap-8 md:p-6">
              <div>
                <SectionProse
                  json={doc(contentByName, "home_lead_banner")}
                  className="prose-headings:text-neutral-900 prose-p:text-neutral-800 [&_h1]:[font-family:var(--font-hero)] [&_h2]:[font-family:var(--font-hero)] [&_h3]:[font-family:var(--font-hero)] [&_p]:[font-family:var(--font-heading)]"
                />
                <div className="mt-3">
                  <LeadForm compact />
                </div>
              </div>
              <HomeContactInfo />
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (page === "about") {
    return (
      <main className="w-full min-w-0 max-w-full space-y-12 overflow-x-hidden">
        <AboutClient
          aboutHeroDoc={doc(contentByName, "about_hero")}
          visionDoc={doc(contentByName, "vision")}
          missionDoc={doc(contentByName, "mission")}
          statsDoc={doc(contentByName, "about_stats")}
          preview
        />
      </main>
    );
  }

  return (
    <main className="w-full min-w-0 max-w-full space-y-24 overflow-x-hidden">
      <section className="flex min-h-[80vh] items-center px-4 py-12">
        <div className="container max-w-md">
          <div className="text-center">
            <SectionProse
              json={doc(contentByName, "contact_cta")}
              className="mx-auto text-center [&_h1]:font-hero [&_h1]:text-3xl [&_h1]:md:text-4xl [&_h1]:font-bold [&_h1]:text-neutral-900"
            />
          </div>
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-card">
            <LeadForm />
          </div>
          <ContactPrivacyNote />
        </div>
      </section>
    </main>
  );
}
