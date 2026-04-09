"use client";

import { motion } from "framer-motion";
import { Shield, MapPin, BadgeDollarSign, CreditCard } from "lucide-react";
import { SectionProse } from "../cms/SectionProse";

const WHY_ICONS = [Shield, MapPin, BadgeDollarSign, CreditCard] as const;

type Four = readonly [unknown, unknown, unknown, unknown];

/**
 * Intro + four cards: each block is Tiptap JSON from Supabase (`why_us_intro`, `why_us_1`…`why_us_4`).
 */
export function WhyChooseUs({
  introDoc,
  cardDocs,
  /** Admin CMS preview: single column so cards fit narrow preview width. */
  preview = false,
}: {
  introDoc: unknown;
  cardDocs: Four;
  preview?: boolean;
}) {
  return (
    <section className="py-16 px-4 bg-secondary/50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mx-auto max-w-3xl [&_.prose]:mx-auto"
        >
          <SectionProse json={introDoc} className="[&_h2]:font-hero [&_h2]:text-3xl [&_h2]:md:text-4xl [&_h2]:font-bold [&_h2]:text-foreground" />
        </motion.div>

        <div
          className={
            preview
              ? "mt-6 grid grid-cols-1 gap-3"
              : "mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
          }
        >
          {cardDocs.map((doc, i) => {
            const Icon = WHY_ICONS[i] ?? Shield;
            return (
              <motion.div
                key={`why-card-${i}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl border border-white/40 bg-white/35 p-5 text-center shadow-card backdrop-blur-xl"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Icon className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="mt-3 text-left">
                  <SectionProse json={doc} variant="compact" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
