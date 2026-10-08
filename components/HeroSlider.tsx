"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { HeroSlide } from "@/lib/home";


const ticker = [
  "Agriculture",
  "Business & Entrepreneurship",
  "Building & Civil",
  "Electrical & Electronics",
  "Hospitality Management",
  "ICT & Informatics",
  "Mechanical Engineering",
];

const INTERVAL = 6000;

export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [failed, setFailed] = useState<Record<number, boolean>>({});

  const go = useCallback(
    (n: number) => setI((n + slides.length) % slides.length),
    [slides.length]
  );

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (paused || reduced) return;
    const t = setInterval(() => setI((c) => (c + 1) % slides.length), INTERVAL);
    return () => clearInterval(t);
  }, [paused, reduced, slides.length]);

  const s = slides[i];

  return (
    <section
      className="relative bg-brand-900 text-white overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative min-h-[560px] lg:min-h-[660px]">
        {/* background images, cross-fading, running behind everything */}
        {slides.map((sl, idx) => (
          <div
            key={`${idx}-${sl.src}`}
            aria-hidden={idx !== i}
            className={`hero-slide absolute inset-0 transition-opacity duration-1000 ${
              idx === i ? "opacity-100 is-active" : "opacity-0"
            }`}
          >
            {!failed[idx] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={sl.src}
                alt=""
                loading={idx === 0 ? "eager" : "lazy"}
                onError={() => setFailed((f) => ({ ...f, [idx]: true }))}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        ))}

        {/* legibility overlay: maroon from the left, clearer on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/90 via-brand-900/65 to-brand-900/15" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-brand-900/80 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-6 lg:px-10 pt-24 pb-36 lg:pt-32 lg:pb-40">
          <div key={i} className="hero-copy max-w-2xl">
            <p className="tick text-accent font-mono text-sm">{s.kicker}</p>
            <h1 className="mt-4 font-display font-semibold text-4xl sm:text-5xl leading-[1.08]">
              {s.title}
            </h1>
            <p className="mt-5 text-brand-200 text-lg leading-relaxed">{s.tagline}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={s.cta.href}
                className="bg-accent text-brand-900 font-semibold px-6 py-3 hover:bg-white transition-colors"
              >
                {s.cta.label}
              </Link>
              <Link
                href="/admissions"
                className="border border-white/40 px-6 py-3 hover:border-accent hover:text-accent transition-colors"
              >
                Apply now
              </Link>
            </div>
          </div>
        </div>

        {/* controls */}
        <div className="absolute left-0 right-0 bottom-14 max-w-6xl mx-auto px-6 lg:px-10 flex items-center justify-between">
          <div className="flex gap-2" role="tablist" aria-label="Slides">
            {slides.map((_, idx) => (
              <button
                key={idx}
                role="tab"
                aria-selected={idx === i}
                aria-label={`Slide ${idx + 1}`}
                onClick={() => go(idx)}
                className={`h-1.5 transition-all ${
                  idx === i ? "w-10 bg-accent" : "w-5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => go(i - 1)}
              aria-label="Previous slide"
              className="h-10 w-10 border border-white/40 hover:border-accent hover:text-accent"
            >
              &larr;
            </button>
            <button
              onClick={() => go(i + 1)}
              aria-label="Next slide"
              className="h-10 w-10 border border-white/40 hover:border-accent hover:text-accent"
            >
              &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* department ticker, as on GTVC */}
      <div className="relative bg-brand-800 border-t border-white/10 overflow-hidden">
        <div className="marquee-track py-3 font-mono text-xs text-brand-200">
          {[...ticker, ...ticker].map((t, idx) => (
            <span key={idx} className="px-6 whitespace-nowrap">
              {t}
              <span className="ml-12 text-accent">/</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
