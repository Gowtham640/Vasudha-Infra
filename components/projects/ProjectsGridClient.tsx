/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useResponsiveGalleryViewMode } from "../../lib/useResponsiveGalleryViewMode";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, LayoutGrid, Layers, MapPin, SlidersHorizontal, X } from "lucide-react";
import { useI18n } from "../i18n/I18nProvider";

export type ProjectsListItem = {
  id: string;
  name: string;
  address?: string | null;
  price?: number | null;
  status?: string | null;
  imageUrl?: string | null;
};

export function ProjectsGridClient({ projects }: { projects: ProjectsListItem[] }) {
  const { t } = useI18n();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [view, setView] = useResponsiveGalleryViewMode();
  const [current, setCurrent] = useState(0);
  const isDraggingRef = useRef(false);

  const locations = useMemo(() => {
    return Array.from(new Set(projects.map((project) => project.address?.split(",")[0]?.trim()).filter(Boolean))) as string[];
  }, [projects]);

  const filtered = useMemo(() => {
    if (!selectedLocation) return projects;
    return projects.filter((project) => (project.address ?? "").toLowerCase().includes(selectedLocation.toLowerCase()));
  }, [projects, selectedLocation]);

  const handleNext = () => {
    if (current < filtered.length - 1) setCurrent(current + 1);
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  return (
    <section className="py-8 px-4">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="font-hero text-3xl md:text-4xl font-bold text-neutral-900">{t("projects.title")}</h1>
          <p className="text-neutral-600 mt-2">{t("projects.subtitle")}</p>
        </motion.div>

        <div className="flex justify-end mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("stack")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                view === "stack" ? "bg-green-700 text-white" : "bg-neutral-100 text-neutral-700"
              }`}
            >
              <Layers className="w-4 h-4" />
              {t("scroll")}
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                view === "list" ? "bg-green-700 text-white" : "bg-neutral-100 text-neutral-700"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              {t("list")}
            </button>
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-300 text-sm font-medium text-neutral-800 hover:bg-neutral-100 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t("projects.filter")}
            </button>
          </div>
        </div>

        {view === "stack" ? (
          <div className="relative w-full overflow-hidden">
            <div className="relative h-[380px] md:h-[440px] flex items-center justify-center">
              <AnimatePresence mode="popLayout">
                {filtered.map((project, index) => {
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
                        zIndex: filtered.length - Math.abs(offset),
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
                        className="group relative block w-full h-full rounded-2xl overflow-hidden shadow-card-hover"
                      >
                        <img src={project.imageUrl ?? "/vasudha1.svg"} alt={project.name} className="w-full h-full object-cover" />
                        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-transparent to-white" />
                        <div className="absolute bottom-0 left-0 p-5">
                          <h3 className="font-heading text-lg font-bold text-neutral-900">{project.name}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-neutral-700" />
                            <span className="text-sm text-neutral-700">{project.address ?? "Amaravati"}</span>
                          </div>
                          <p className="font-heading text-amber-700 font-bold mt-2">
                            {project.price ? `₹${project.price.toLocaleString("en-IN")}` : "Price on request"}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {filtered.map((project, index) => (
                <button
                  key={project.id}
                  onClick={() => setCurrent(index)}
                  className={`h-2 rounded-full transition-all ${index === current ? "w-6 bg-green-700" : "w-2 bg-neutral-300"}`}
                />
              ))}
            </div>
            {current === 0 ? (
              <motion.div className="flex items-center justify-center gap-1 mt-3 text-neutral-500 text-sm" animate={{ x: [0, 10, 0] }} transition={{ repeat: 3, duration: 1 }}>
                <span>Swipe</span>
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            ) : null}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="group cursor-pointer rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all bg-white"
              >
                <Link href={`/projects/${project.id}`}>
                  <div className="relative aspect-4/3 overflow-hidden">
                    <img src={project.imageUrl ?? "/vasudha1.svg"} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-transparent to-white" />
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="font-heading font-semibold text-sm md:text-base text-neutral-900 truncate">{project.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
                      <span className="text-xs text-neutral-500 truncate">{project.address ?? "Amaravati"}</span>
                    </div>
                    <p className="font-heading text-xs md:text-sm font-bold text-amber-700 mt-2">
                      {project.price ? `₹${project.price.toLocaleString("en-IN")}` : "Price on request"}
                    </p>
                    <button className="mt-3 w-full py-2 rounded-lg bg-green-700/10 text-green-800 text-xs font-semibold hover:bg-green-700 hover:text-white transition-colors">
                      {t("projects.view_details")}
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {filterOpen ? (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 z-50" onClick={() => setFilterOpen(false)} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-15 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 max-h-[60vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading font-bold text-lg text-neutral-900">{t("projects.filter")}</h3>
                <button onClick={() => setFilterOpen(false)}>
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>
              <p className="font-heading font-medium text-sm text-neutral-900 mb-3">Location</p>
              <div className="flex flex-wrap gap-2">
                {locations.map((location) => (
                  <button
                    key={location}
                    onClick={() => setSelectedLocation(selectedLocation === location ? null : location)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedLocation === location ? "bg-green-700 text-white" : "bg-neutral-100 text-neutral-700"
                    }`}
                  >
                    {location}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={() => { setSelectedLocation(null); setFilterOpen(false); }} className="flex-1 py-3 rounded-xl border border-neutral-300 text-neutral-900 font-medium">
                  Clear
                </button>
                <button onClick={() => setFilterOpen(false)} className="flex-1 py-3 rounded-xl bg-green-700 text-white font-medium">
                  Apply
                </button>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
