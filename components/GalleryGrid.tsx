"use client";

import { useEffect, useState, useCallback } from "react";

type Photo = { id: string; url: string; caption: string; category: string };

export default function GalleryGrid({ photos }: { photos: Photo[] }) {
  const cats = ["All", ...Array.from(new Set(photos.map((p) => p.category)))];
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const shown = cat === "All" ? photos : photos.filter((p) => p.category === cat);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + shown.length) % shown.length)),
    [shown.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  const current = open !== null ? shown[open] : null;

  return (
    <div>
      {cats.length > 2 && (
        <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label="Gallery categories">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={`px-4 py-1.5 text-sm border transition-colors ${
                cat === c ? "bg-brand-700 border-brand-700 text-white" : "border-paper-line text-steel hover:border-brand-700 hover:text-brand-700"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {shown.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setOpen(i)}
            className="group relative aspect-[4/3] overflow-hidden border border-paper-line bg-brand-200/30 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={`Open photo${p.caption ? `: ${p.caption}` : ""}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt={p.caption || p.category}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {p.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-brand-900/80 text-white text-xs px-3 py-2">{p.caption}</span>
            )}
          </button>
        ))}
      </div>

      {current && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          onClick={close}
        >
          <button onClick={close} className="absolute top-4 right-4 text-white text-3xl leading-none px-3" aria-label="Close">
            &times;
          </button>
          {shown.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); step(-1); }}
                className="absolute left-2 sm:left-6 text-white text-4xl px-3 py-6"
                aria-label="Previous photo"
              >
                &#8249;
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); step(1); }}
                className="absolute right-2 sm:right-6 text-white text-4xl px-3 py-6"
                aria-label="Next photo"
              >
                &#8250;
              </button>
            </>
          )}
          <figure className="max-w-5xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.url} alt={current.caption || current.category} className="max-h-[80vh] max-w-full mx-auto object-contain" />
            <figcaption className="mt-3 text-center text-sm text-white/80">
              {current.caption || current.category} &middot; {(open ?? 0) + 1} / {shown.length}
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}
