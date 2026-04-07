/* eslint-disable @next/next/no-img-element */
"use client";

import { motion } from "framer-motion";
import { LeadForm } from "../contact/LeadForm";
import { useI18n } from "../i18n/I18nProvider";
import { SectionProse } from "../cms/SectionProse";
import { parseCmsTiptapDoc } from "../../lib/tiptap/cmsDoc";
import { extractHeadingParagraphPairs } from "../../lib/tiptap/plainText";

type AboutClientProps = {
  aboutHeroDoc: unknown;
  visionDoc: unknown;
  missionDoc: unknown;
  statsDoc: unknown;
  /** Admin CMS preview: stack grids and cap hero width to the preview column. */
  preview?: boolean;
};

export function AboutClient({
  aboutHeroDoc,
  visionDoc,
  missionDoc,
  statsDoc,
  preview = false,
}: AboutClientProps) {
  const { t } = useI18n();
  const statsParsed = parseCmsTiptapDoc(statsDoc).doc;
  const stats = extractHeadingParagraphPairs(statsParsed, 3);

  return (
    <div className="space-y-12">
      <section className="relative min-h-[55vh] flex items-center overflow-hidden">
        <img
          src="https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
          alt="About hero"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-transparent" />
        <div className={preview ? "relative max-w-full px-4 py-16" : "relative max-w-2xl px-8 py-16"}>
          <SectionProse json={aboutHeroDoc} variant="heroDark" />
        </div>
      </section>

      <section className="py-4">
        <div
          className={
            preview
              ? "mx-auto grid max-w-full grid-cols-1 gap-4"
              : "mx-auto grid max-w-xl grid-cols-2 gap-4"
          }
        >
          {stats.map((stat, i) => (
            <motion.div
              key={`${stat.label}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center bg-white rounded-2xl p-4 shadow-card"
            >
              <p className="font-hero text-3xl md:text-4xl font-bold text-green-700">{stat.value}</p>
              <p className="text-xs md:text-sm text-neutral-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="h-[300px] md:h-[400px] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200"
      >
        <video
          src="/Turntable_Rotation_A_miniature_isometric_cityscape_unfolds_Bu0Sckp7.mp4"
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
      </motion.div>

      <div className={preview ? "grid grid-cols-1 gap-6" : "grid gap-6 md:grid-cols-2"}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-6 shadow-card"
        >
          <SectionProse json={visionDoc} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-6 shadow-card"
        >
          <SectionProse json={missionDoc} />
        </motion.div>
      </div>

      <section
        className={
          preview
            ? "glass grid grid-cols-1 gap-8 rounded-2xl border border-white/40 bg-white/20 p-6 backdrop-blur-xl"
            : "glass grid gap-8 rounded-2xl border border-white/40 bg-white/20 p-6 backdrop-blur-xl md:grid-cols-2 md:p-8"
        }
      >
        <div>
          <h3 className="font-hero text-3xl text-neutral-900">{t("common.contact_us")}</h3>
          <p className="mt-3 text-neutral-700">{t("about.contact_prompt")}</p>
          <div className="mt-6 space-y-2 text-neutral-900">
            <a href="tel:+917416264646" className="block hover:text-green-800">
              +91 7416 264 646
            </a>
            <a href="mailto:hello@vasudha.com" className="block hover:text-green-800 text-[12px]">
              hello@vasudha.com
            </a>
          </div>
        </div>
        <LeadForm />
      </section>
    </div>
  );
}
