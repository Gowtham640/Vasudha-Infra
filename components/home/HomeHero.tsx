"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export type HomeHeroContent = {
  title: string;
  subtitle: string;
  description?: string;
  ctaLabel: string;
  ctaHref?: string;
};

export function HomeHero({ content }: { content: HomeHeroContent }) {
  const router = useRouter();

  return (
    <section className="relative w-full h-[80vh] min-h-[500px] overflow-hidden">
      
      {/* Background Image */}
      <Image
        src="/testimg.svg"
        alt="Home Hero Background"
        fill
        className="object-cover"
        priority
      />

      {/* Overlay (for readability) */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative w-1/2 z-10 flex h-full items-center px-6 md:px-12">
        
        <div className="max-w-xl space-y-6">

          <p className="text-4xl font-sans font-bold leading-tight text-white md:text-5xl">
            {content.title}
          </p>

          <p className="text-lg text-neutral-200">
            {content.subtitle}
          </p>

          {content.description && (
            <p className="text-base text-neutral-300">
              {content.description}
            </p>
          )}

          {/* ✅ Regular Button with navigation */}
          <button
            onClick={() => {
              if (content.ctaHref) router.push(content.ctaHref);
            }}
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold bg-green-600 text-white hover:bg-green-700 transition-all duration-200"
          >
            {content.ctaLabel}
          </button>
        </div>

      </div>
    </section>
  );
}