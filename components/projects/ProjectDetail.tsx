/* eslint-disable @next/next/no-img-element */
"use client";

import { LeadForm } from "../contact/LeadForm";
import { buildStorageUrl } from "../../lib/supabase/storage";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowLeft, CheckCircle, Navigation, CreditCard, Image as ImageIcon, LayoutGrid, Layers, ArrowRight } from "lucide-react";
import Link from "next/link";

export type ProjectDetailProps = {
  id: string;
  name: string;
  description?: string | null;
  location?: string | null;
  price?: number | null;
  status?: string | null;
  landmark?: string | null;
  address?: string | null;
  map_embed_url?: string | null;
  project_images?: Array<{
    id: string;
    image_path: string;
    alt_text: string | null;
    is_cover: boolean | null;
  }>;
};

export function ProjectDetail({ project }: { project: ProjectDetailProps }) {
  const [layoutView, setLayoutView] = useState<"stack" | "list">("stack");
  const [current, setCurrent] = useState(0);
  const isDraggingRef = useRef(false);
  const coverImage = project.project_images?.find((img) => img.is_cover) ?? project.project_images?.[0];
  const images = (project.project_images ?? []).map((img) => ({
    id: img.id,
    url: buildStorageUrl(img.image_path),
    alt: img.alt_text ?? project.name,
  }));
  const coverImageUrl = coverImage ? buildStorageUrl(coverImage.image_path) : null;
  const handleNext = () => {
    if (current < images.length - 1) setCurrent(current + 1);
  };
  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  return (
    <div className="space-y-10">
      <div className="relative h-[50vh]  md:h-[60vh] overflow-hidden">
        <img src={coverImageUrl ?? "/vasudha1.svg"} alt={coverImage?.alt_text ?? project.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        <Link href="/projects" className="absolute top-4 left-4 md:top-8 w-10 h-10 rounded-full glass flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-neutral-900" />
        </Link>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-hero text-3xl md:text-5xl font-bold text-white">{project.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="w-4 h-4 text-white/80" />
              <span className="text-white/80">{project.address ?? "Amaravati"}</span>
            </div>
            <p className="font-heading text-xl font-bold text-amber-300 mt-2">
              {project.price ? `₹${project.price.toLocaleString("en-IN")}` : "Price on request"}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container max-w-3xl px-4 py-2 space-y-8">
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-neutral-700 leading-relaxed">{project.description}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-700 text-sm font-medium">
              {project.status ?? "Available"}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-700 text-sm font-medium">
              {project.landmark ?? "Prime location"}
            </span>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-heading font-bold text-xl text-neutral-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-green-700" />
            Layout
          </h2>
          <div className="flex justify-center gap-2 my-5">
            <button
              onClick={() => setLayoutView("stack")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                layoutView === "stack" ? "bg-green-700 text-white" : "bg-neutral-100 text-neutral-700"
              }`}
            >
              <Layers className="w-4 h-4" />
              Scroll
            </button>
            <button
              onClick={() => setLayoutView("list")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                layoutView === "list" ? "bg-green-700 text-white" : "bg-neutral-100 text-neutral-700"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              List
            </button>
          </div>
          {layoutView === "stack" ? (
            <div className="relative h-[320px] flex items-center justify-center">
              <AnimatePresence mode="popLayout">
                {images.map((img, index) => {
                  const offset = index - current;
                  if (offset < -1 || offset > 2) return null;
                  return (
                    <motion.div
                      key={img.id}
                      className="absolute w-[85%] md:w-[400px] h-[280px] cursor-pointer"
                      initial={{ scale: 0.9, x: 300, opacity: 0 }}
                      animate={{
                        scale: offset === 0 ? 1 : 0.9,
                        x: offset * 40,
                        zIndex: images.length - Math.abs(offset),
                        opacity: Math.abs(offset) > 1 ? 0 : 1,
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
                      onClick={() => {
                        if (!isDraggingRef.current) {
                          setCurrent(index);
                        }
                      }}
                    >
                      <img src={img.url} alt={img.alt} className="w-full h-full rounded-2xl object-cover shadow-card-hover" />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div className="absolute bottom-0 translate-y-10 flex justify-center gap-2">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)} className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-green-700" : "w-2 bg-neutral-300"}`} />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {images.map((img) => (
                <img key={img.id} src={img.url} alt={img.alt} className="rounded-xl w-full h-40 md:h-56 object-cover" />
              ))}
            </div>
          )}
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-heading font-bold text-xl text-neutral-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-700" />
            Amenities
          </h2>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {["Clubhouse", "Parks", "Water Lines", "24x7 Security"].map((amenity) => (
              <div key={amenity} className="flex items-center gap-2 p-3 rounded-xl bg-neutral-100">
                <div className="w-2 h-2 rounded-full bg-green-700 shrink-0" />
                <span className="text-sm text-neutral-800">{amenity}</span>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-heading font-bold text-xl text-neutral-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-green-700" />
            Nearby Landmarks
          </h2>
          <div className="space-y-2 mt-4">
            {[project.landmark ?? "Expressway", "Hospitals", "Schools"].map((nearby) => (
              <div key={nearby} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-100">
                <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="text-sm text-neutral-800">{nearby}</span>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-heading font-bold text-xl text-neutral-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-700" />
            Payment Plans
          </h2>
          <div className="space-y-2 mt-4">
            {["40% on booking", "30% on foundation", "30% on possession"].map((plan, i) => (
              <div key={plan} className="flex items-center gap-3 p-3 rounded-xl border border-neutral-300">
                <span className="w-7 h-7 rounded-full bg-green-700/10 text-green-700 text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-neutral-800">{plan}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {project.map_embed_url ? (
          <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading font-bold text-xl text-neutral-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-700" />
              Location
            </h2>
            <div className="mt-4 rounded-2xl overflow-hidden border border-neutral-300">
              <iframe
                src={project.map_embed_url}
                className="w-full h-64 md:h-80"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Project Location"
              />
            </div>
          </motion.section>
        ) : null}

        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-neutral-100 rounded-2xl p-6">
          <h2 className="font-heading font-bold text-xl text-neutral-900 text-center">Interested in this project?</h2>
          <div className="mt-6">
            <LeadForm projectId={project.id} />
          </div>
        </motion.section>

        <div className="flex gap-3">
          <a href="tel:+919999999999" className="flex-1 py-3 rounded-xl bg-green-700 text-white font-heading font-semibold text-center">
            Call Now
          </a>
          <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="flex-1 py-3 rounded-xl bg-green-600 text-white font-heading font-semibold text-center flex items-center justify-center gap-2">
            WhatsApp
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
