/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";
import { useI18n } from "../i18n/I18nProvider";

export type HomeProject = {
  id: string;
  name: string;
  address?: string | null;
  price?: number | null;
  imageUrl?: string | null;
};

export function FeaturedProjects({ projects }: { projects: HomeProject[] }) {
  const { t } = useI18n();
  const [current, setCurrent] = useState(0);
  const featured = useMemo(() => projects, [projects]);
  const isDraggingRef = useRef(false);

  const handleNext = () => {
    if (current < featured.length - 1) setCurrent(current + 1);
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  return (
    <section className="py-16 px-4">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
          <h2 className="font-hero text-3xl md:text-4xl font-bold text-neutral-900">{t("featured.title")}</h2>
          <p className="text-neutral-600 mt-2">{t("featured.subtitle")}</p>
        </motion.div>
        {/* Mobile and tablet: swipe stack cards */}
        <div className="relative w-full overflow-hidden lg:hidden">
            <div className="relative h-[380px] md:h-[440px] flex items-center justify-center">
              <AnimatePresence mode="popLayout">
                {featured.map((project, index) => {
                  const offset = index - current;
                  if (offset < -1 || offset > 2) return null;
                  const isActive = offset === 0;
                  return (
                    <motion.div
                      key={project.id}
                      className="absolute w-[85%] md:w-[400px] h-[340px] md:h-[400px] cursor-pointer"
                      initial={{ scale: 0.9, x: 300, opacity: 0 }}
                      animate={{
                        scale: isActive ? 1 : 0.9 - Math.abs(offset) * 0.05,
                        x: offset * 40,
                        zIndex: featured.length - Math.abs(offset),
                        opacity: Math.abs(offset) > 1 ? 0 : 1 - Math.abs(offset) * 0.3,
                        rotateY: offset * -5,
                      }}
                      exit={{ scale: 0.85, x: -300, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.1}
                      onDragStart={() => {
                        isDraggingRef.current = true;
                      }}
                      onDragEnd={(_, info) => {
                        if (info.offset.x < -50) handleNext();
                        else if (info.offset.x > 50) handlePrev();
                        // Reset after current click event cycle to avoid accidental navigation while dragging with mouse.
                        window.setTimeout(() => {
                          isDraggingRef.current = false;
                        }, 0);
                      }}
                    >
                      <Link
                        href={`/projects/${project.id}`}
                        onClick={(event) => {
                          if (isDraggingRef.current) {
                            event.preventDefault();
                          }
                        }}
                        className="relative block w-full h-full rounded-2xl overflow-hidden shadow-card-hover"
                      >
                        <img src={project.imageUrl ?? "/vasudha1.svg"} alt={project.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-linear-to-tl from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 p-5">
                          <h3 className="font-heading text-lg font-bold text-white">{project.name}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-white/80" />
                            <span className="text-sm text-white/80">{project.address ?? t("common.amaravati")}</span>
                          </div>
                          <p className="font-heading text-amber-300 font-bold mt-2">
                            {project.price ? `₹${project.price.toLocaleString("en-IN")}` : t("common.price_on_request")}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {featured.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-green-700" : "w-2 bg-neutral-300"}`} />
              ))}
            </div>
            {current === 0 ? (
              <motion.div className="flex items-center justify-center gap-1 mt-3 text-neutral-500 text-sm" animate={{ x: [0, 10, 0] }} transition={{ repeat: 3, duration: 1 }}>
                <span>{t("projects.swipe")}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            ) : null}
          </div>

        {/* Desktop and larger: always show horizontal card layout */}
        <div className="hidden items-center justify-center  lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featured.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              whileHover={{ y: -4 }}
              className="group cursor-pointer rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all bg-white"
            >
              <Link href={`/projects/${project.id}`}>
                <div className="relative aspect-4/3 overflow-hidden">
                  <img src={project.imageUrl ?? "/vasudha1.svg"} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-transparent to-white" />
                </div>
                <div className="p-4">
                  <h3 className="font-heading font-semibold text-base text-neutral-900 truncate">{project.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
                    <span className="text-sm text-neutral-500 truncate">{project.address ?? t("common.amaravati")}</span>
                  </div>
                  <p className="font-heading text-sm font-bold text-amber-700 mt-2">
                    {project.price ? `₹${project.price.toLocaleString("en-IN")}` : t("common.price_on_request")}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
