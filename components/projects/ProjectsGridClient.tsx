/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, SlidersHorizontal, X } from "lucide-react";
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

  const locations = useMemo(() => {
    return Array.from(new Set(projects.map((project) => project.address?.split(",")[0]?.trim()).filter(Boolean))) as string[];
  }, [projects]);

  const filtered = useMemo(() => {
    if (!selectedLocation) return projects;
    return projects.filter((project) => (project.address ?? "").toLowerCase().includes(selectedLocation.toLowerCase()));
  }, [projects, selectedLocation]);

  return (
    <section className="py-8 px-4">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="font-hero text-3xl md:text-4xl font-bold text-neutral-900">{t("projects.title")}</h1>
          <p className="text-neutral-600 mt-2">{t("projects.subtitle")}</p>
        </motion.div>

        <div className="flex justify-end mb-6">
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-300 text-sm font-medium text-neutral-800 hover:bg-neutral-100 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t("projects.filter")}
          </button>
        </div>

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
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={project.imageUrl ?? "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&q=80"}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="font-heading font-semibold text-sm md:text-base text-neutral-900 truncate">{project.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-neutral-500 flex-shrink-0" />
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
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 max-h-[60vh]"
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
