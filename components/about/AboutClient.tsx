/* eslint-disable @next/next/no-img-element */
"use client";

import { motion } from "framer-motion";
import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { LeadForm } from "../contact/LeadForm";
import { useI18n } from "../i18n/I18nProvider";

type AboutClientProps = {
  headline: string;
  body: string;
  stats: Array<{ label: string; value: string }>;
};

function LandPlot() {
  const meshRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.2;
  });

  return (
    <group ref={meshRef}>
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[3, 0.2, 3]} />
        <meshStandardMaterial color="hsl(152, 55%, 35%)" />
      </mesh>
      {[
        [-0.8, 0.05, -0.8],
        [0.8, 0.05, -0.8],
        [-0.8, 0.05, 0.8],
        [0.8, 0.05, 0.8],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <boxGeometry args={[1, 0.1, 1]} />
          <meshStandardMaterial color={i % 2 === 0 ? "hsl(43, 70%, 55%)" : "hsl(152, 40%, 45%)"} />
        </mesh>
      ))}
    </group>
  );
}

export function AboutClient({ headline, body, stats }: AboutClientProps) {
  const { t } = useI18n();
  return (
    <main className="space-y-12">
      <section className="relative min-h-[55vh] flex items-center overflow-hidden rounded-2xl">
        <img src="https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500" alt="About hero" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="relative px-8 py-16 max-w-2xl">
          <h1 className="font-hero text-4xl md:text-5xl font-bold text-white">{headline || t("about.title")}</h1>
          <p className="text-white/85 mt-4">{body}</p>
        </div>
      </section>

      <section className="py-4">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={`${stat.label}-${i}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center bg-white rounded-2xl p-4 shadow-card">
              <p className="font-hero text-3xl md:text-4xl font-bold text-green-700">{stat.value}</p>
              <p className="text-xs md:text-sm text-neutral-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="h-[300px] md:h-[400px] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
        <Suspense fallback={<div className="flex items-center justify-center h-full text-neutral-500">Loading 3D...</div>}>
          <Canvas camera={{ position: [4, 3, 4], fov: 45 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <LandPlot />
            <OrbitControls enableZoom={false} autoRotate={false} enablePan={false} maxPolarAngle={Math.PI / 2.5} />
          </Canvas>
        </Suspense>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-white rounded-2xl p-6 shadow-card">
          <h2 className="font-heading font-bold text-xl text-neutral-900">{t("about.vision")}</h2>
          <p className="text-neutral-600 mt-3 leading-relaxed">
            We envision transparent, technology-enabled land ownership where every family can confidently invest in growth corridors and future-ready communities.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-white rounded-2xl p-6 shadow-card">
          <h2 className="font-heading font-bold text-xl text-neutral-900">{t("about.mission")}</h2>
          <p className="text-neutral-600 mt-3 leading-relaxed">
            Our mission is to deliver legally verified projects, transparent payments, and dependable support from first enquiry to plot registration.
          </p>
        </motion.div>
      </div>

      <section className="grid gap-8 md:grid-cols-2 bg-green-700 rounded-2xl p-6 md:p-8">
        <div>
          <h3 className="font-hero text-3xl text-white">Contact Us</h3>
          <p className="text-white/85 mt-3">Speak with our experts for availability, pricing, and guided visits.</p>
          <div className="mt-6 space-y-2 text-white">
            <a href="tel:+919999999999" className="block hover:text-amber-300">+91 99999 99999</a>
            <a href="mailto:hello@vasudha.com" className="block hover:text-amber-300">hello@vasudha.com</a>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 md:p-6">
          <LeadForm />
        </div>
      </section>
    </main>
  );
}
