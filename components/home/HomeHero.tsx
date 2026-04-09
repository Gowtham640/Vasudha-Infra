"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useI18n } from "../i18n/I18nProvider";
import { SectionProse } from "../cms/SectionProse";

/**
 * Hero copy comes from Supabase (`home_hero`) as Tiptap JSON; buttons stay compact with i18n labels.
 */
export function HomeHero({ doc }: { doc: unknown }) {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
          alt="Premium land"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      </div>

      <div className="relative container px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-xl"
        >
          <SectionProse json={doc} variant="heroDark" className="max-w-xl" />
          <div className="flex flex-wrap gap-3 mt-8">
            <button
              type="button"
              onClick={() => router.push("/projects")}
              className="px-6 py-3 rounded-xl gradient-gold font-heading font-semibold text-black shadow-lg flex items-center gap-2"
            >
              {t("hero.cta")}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => router.push("/contact")}
              className="px-6 py-3 rounded-xl border-2 border-white/40 text-white font-heading font-semibold backdrop-blur-sm hover:bg-white/10 transition-colors"
            >
              {t("hero.secondary")}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
