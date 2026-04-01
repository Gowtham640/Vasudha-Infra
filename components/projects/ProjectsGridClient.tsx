/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useResponsiveGalleryViewMode } from "../../lib/useResponsiveGalleryViewMode";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, LayoutGrid, Layers, MapPin, SlidersHorizontal, X } from "lucide-react";
import { useI18n } from "../i18n/I18nProvider";
import { AP_TG_CITIES, AP_TG_DISTRICTS, OPEN_PLOT_AMENITIES } from "../../lib/projectMetadata";

export type ProjectsListItem = {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  district?: string | null;
  amenities?: string[] | null;
  price?: number | null;
  status?: string | null;
  imageUrl?: string | null;
};

export function ProjectsGridClient({ projects }: { projects: ProjectsListItem[] }) {
  const { t } = useI18n();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [cityQuery, setCityQuery] = useState("");
  const [districtQuery, setDistrictQuery] = useState("");
  const [amenityQuery, setAmenityQuery] = useState("");
  const [cityOpen, setCityOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);
  const [view, setView] = useResponsiveGalleryViewMode();
  const [current, setCurrent] = useState(0);
  const isDraggingRef = useRef(false);

  const cityOptions = useMemo(() => {
    const fromProjects = projects.map((project) => project.city).filter(Boolean) as string[];
    return Array.from(new Set([...AP_TG_CITIES, ...fromProjects]));
  }, [projects]);
  const districtOptions = useMemo(() => {
    const fromProjects = projects.map((project) => project.district).filter(Boolean) as string[];
    return Array.from(new Set([...AP_TG_DISTRICTS, ...fromProjects]));
  }, [projects]);
  const amenityOptions = useMemo(() => {
    const fromProjects = projects.flatMap((project) => project.amenities ?? []);
    return Array.from(new Set([...OPEN_PLOT_AMENITIES, ...fromProjects]));
  }, [projects]);

  const filteredCities = cityOptions.filter((city) => city.toLowerCase().includes(cityQuery.trim().toLowerCase()));
  const filteredDistricts = districtOptions.filter((district) =>
    district.toLowerCase().includes(districtQuery.trim().toLowerCase())
  );
  const filteredAmenities = amenityOptions.filter(
    (amenity) =>
      amenity.toLowerCase().includes(amenityQuery.trim().toLowerCase()) &&
      !selectedAmenities.some((selectedAmenity) => selectedAmenity.toLowerCase() === amenity.toLowerCase())
  );

  const filtered = useMemo(() => {
    return projects.filter((project) => {
      const cityMatch = selectedCity
        ? (project.city ?? "").toLowerCase() === selectedCity.toLowerCase()
        : true;
      const districtMatch = selectedDistrict
        ? (project.district ?? "").toLowerCase() === selectedDistrict.toLowerCase()
        : true;
      const amenitiesMatch =
        selectedAmenities.length > 0
          ? selectedAmenities.every((amenity) =>
              (project.amenities ?? []).some(
                (projectAmenity) => projectAmenity.toLowerCase() === amenity.toLowerCase()
              )
            )
          : true;
      return cityMatch && districtMatch && amenitiesMatch;
    });
  }, [projects, selectedAmenities, selectedCity, selectedDistrict]);

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
                            <span className="text-sm text-neutral-700">{project.address ?? t("common.amaravati")}</span>
                          </div>
                          <p className="font-heading text-amber-700 font-bold mt-2">
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
                <span>{t("projects.swipe")}</span>
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
                      <span className="text-xs text-neutral-500 truncate">{project.address ?? t("common.amaravati")}</span>
                    </div>
                    <p className="font-heading text-xs md:text-sm font-bold text-amber-700 mt-2">
                      {project.price ? `₹${project.price.toLocaleString("en-IN")}` : t("common.price_on_request")}
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
              <div className="space-y-4">
                <FilterSingleSelect
                  label="City"
                  query={cityQuery}
                  selectedValue={selectedCity}
                  isOpen={cityOpen}
                  options={filteredCities}
                  onQueryChange={(value) => {
                    setCityQuery(value);
                    if (value.trim().length > 0) {
                      setCityOpen(true);
                    }
                  }}
                  onToggle={() => setCityOpen((prev) => !prev)}
                  onSelect={(value) => {
                    setSelectedCity(value);
                    setCityQuery(value);
                    setCityOpen(false);
                  }}
                  onClear={() => {
                    setSelectedCity(null);
                    setCityQuery("");
                  }}
                />
                <FilterSingleSelect
                  label="District"
                  query={districtQuery}
                  selectedValue={selectedDistrict}
                  isOpen={districtOpen}
                  options={filteredDistricts}
                  onQueryChange={(value) => {
                    setDistrictQuery(value);
                    if (value.trim().length > 0) {
                      setDistrictOpen(true);
                    }
                  }}
                  onToggle={() => setDistrictOpen((prev) => !prev)}
                  onSelect={(value) => {
                    setSelectedDistrict(value);
                    setDistrictQuery(value);
                    setDistrictOpen(false);
                  }}
                  onClear={() => {
                    setSelectedDistrict(null);
                    setDistrictQuery("");
                  }}
                />
                <FilterMultiSelect
                  label="Amenities"
                  query={amenityQuery}
                  selectedValues={selectedAmenities}
                  isOpen={amenitiesOpen}
                  options={filteredAmenities}
                  onQueryChange={(value) => {
                    setAmenityQuery(value);
                    if (value.trim().length > 0) {
                      setAmenitiesOpen(true);
                    }
                  }}
                  onToggle={() => setAmenitiesOpen((prev) => !prev)}
                  onSelect={(value) => {
                    setSelectedAmenities((prev) => [...prev, value]);
                    setAmenityQuery("");
                  }}
                  onRemove={(value) => {
                    setSelectedAmenities((prev) => prev.filter((item) => item !== value));
                  }}
                />
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => {
                    setSelectedCity(null);
                    setSelectedDistrict(null);
                    setSelectedAmenities([]);
                    setCityQuery("");
                    setDistrictQuery("");
                    setAmenityQuery("");
                    setFilterOpen(false);
                  }}
                  className="flex-1 py-3 rounded-xl border border-neutral-300 text-neutral-900 font-medium"
                >
                  {t("common.clear")}
                </button>
                <button onClick={() => setFilterOpen(false)} className="flex-1 py-3 rounded-xl bg-green-700 text-white font-medium">
                  {t("common.apply")}
                </button>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

type FilterSingleSelectProps = {
  label: string;
  query: string;
  selectedValue: string | null;
  isOpen: boolean;
  options: string[];
  onQueryChange: (value: string) => void;
  onToggle: () => void;
  onSelect: (value: string) => void;
  onClear: () => void;
};

function FilterSingleSelect({
  label,
  query,
  selectedValue,
  isOpen,
  options,
  onQueryChange,
  onToggle,
  onSelect,
  onClear,
}: FilterSingleSelectProps) {
  return (
    <div className="relative space-y-2">
      <p className="font-heading font-medium text-sm text-neutral-900">{label}</p>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={`Type ${label.toLowerCase()}`}
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none"
        />
        <button
          type="button"
          onClick={onToggle}
          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-700"
        >
          Select
        </button>
      </div>
      {selectedValue ? (
        <button
          type="button"
          onClick={onClear}
          className="rounded-full bg-neutral-200 px-3 py-1 text-xs text-neutral-800"
        >
          {selectedValue} ×
        </button>
      ) : null}
      {isOpen ? (
        <div className="w-full rounded-xl border border-neutral-300 bg-white p-3 shadow-lg">
          <div className="max-h-32 overflow-y-auto">
            <div className="flex flex-wrap gap-2">
              {options.length > 0 ? (
                options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onSelect(option)}
                    className="rounded-full bg-neutral-200 px-3 py-1 text-xs text-neutral-800"
                  >
                    {option}
                  </button>
                ))
              ) : (
                <span className="text-xs text-neutral-500">No matching results</span>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type FilterMultiSelectProps = {
  label: string;
  query: string;
  selectedValues: string[];
  isOpen: boolean;
  options: string[];
  onQueryChange: (value: string) => void;
  onToggle: () => void;
  onSelect: (value: string) => void;
  onRemove: (value: string) => void;
};

function FilterMultiSelect({
  label,
  query,
  selectedValues,
  isOpen,
  options,
  onQueryChange,
  onToggle,
  onSelect,
  onRemove,
}: FilterMultiSelectProps) {
  return (
    <div className="relative space-y-2">
      <p className="font-heading font-medium text-sm text-neutral-900">{label}</p>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={`Type ${label.toLowerCase()}`}
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none"
        />
        <button
          type="button"
          onClick={onToggle}
          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-700"
        >
          Select
        </button>
      </div>
      {selectedValues.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedValues.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onRemove(value)}
              className="rounded-full bg-neutral-200 px-3 py-1 text-xs text-neutral-800"
            >
              {value} ×
            </button>
          ))}
        </div>
      ) : null}
      {isOpen ? (
        <div className="w-full rounded-xl border border-neutral-300 bg-white p-3 shadow-lg">
          <div className="max-h-32 overflow-y-auto">
            <div className="flex flex-wrap gap-2">
              {options.length > 0 ? (
                options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onSelect(option)}
                    className="rounded-full bg-neutral-200 px-3 py-1 text-xs text-neutral-800"
                  >
                    {option}
                  </button>
                ))
              ) : (
                <span className="text-xs text-neutral-500">No matching results</span>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
