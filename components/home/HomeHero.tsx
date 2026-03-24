"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useI18n } from "../i18n/I18nProvider";

export type HomeHeroContent = {
  title: string;
  subtitle: string;
  description?: string;
  ctaLabel: string;
  ctaHref?: string;
};

export function HomeHero({ content }: { content: HomeHeroContent }) {
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
          <h1 className="font-hero text-4xl md:text-6xl font-bold text-white leading-tight">{t("hero.title")}</h1>
          <p className="mt-4 text-lg text-white/85 max-w-md">{t("hero.subtitle")}</p>
          <div className="flex flex-wrap gap-3 mt-8">
            <button
              onClick={() => router.push("/projects")}
              className="px-6 py-3 rounded-xl gradient-gold font-heading font-semibold text-black shadow-lg flex items-center gap-2"
            >
              {t("hero.cta")}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push("/contact")}
              className="px-6 py-3 rounded-xl border-2 border-white/40 text-white font-heading font-semibold backdrop-blur-sm hover:bg-white/10 transition-colors"
            >
              {t("hero.secondary")}
            </button>
          </div>
        </motion.div>
      </div>
      <div className="hidden">{content.title}</div>
    </section>
  );
}