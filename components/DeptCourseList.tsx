"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Item = {
  id: string;
  name: string;
  level: number;
  summary: string;
  duration?: string;
  entry?: string;
  exam_body?: string;
  image_url?: string;
  details?: string;
};

const META: Record<number, { label: string; badge: string; edge: string }> = {
  4: { label: "Level 4 · Artisan", badge: "bg-brand-200 text-brand-900", edge: "border-l-brand-200" },
  5: { label: "Level 5 · Craft", badge: "bg-brand-500 text-white", edge: "border-l-brand-500" },
  6: { label: "Level 6 · Diploma", badge: "bg-brand-900 text-white", edge: "border-l-brand-900" },
  3: { label: "Level 3 / Grades", badge: "bg-accent text-brand-900", edge: "border-l-accent" },
};

export default function DeptCourseList({ items, fallbackImage, dept }: { items: Item[]; fallbackImage?: string; dept: string }) {
  const [open, setOpen] = useState<Item | null>(null);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const img = open ? open.image_url || fallbackImage || "" : "";
  const paras = open
    ? (open.details || open.summary || "")
        .split(/\n{2,}/)
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
  const m = (l: number) => META[l] ?? META[6];

  return (
    <>
      <ul className="grid sm:grid-cols-2 gap-4">
        {items.map((c) => (
          <li key={c.id}>
            <button
              onClick={() => setOpen(c)}
              className={`group w-full h-full text-left bg-white border border-paper-line border-l-4 ${m(c.level).edge} p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`px-2 py-0.5 text-[11px] font-semibold ${m(c.level).badge}`}>{m(c.level).label}</span>
                {c.exam_body && <span className="font-mono text-[11px] text-steel">{c.exam_body}</span>}
              </div>
              <h3 className="mt-3 font-display font-semibold leading-snug text-brand-900">{c.name}</h3>
              <p className="mt-1.5 text-xs text-steel leading-relaxed">
                {[c.duration, c.entry].filter(Boolean).join(" · ") || "Contact admissions for entry details"}
              </p>
              <span className="mt-3 inline-block text-xs font-semibold text-brand-700 sm:opacity-0 sm:translate-y-1 transition duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0">
                View details &rarr;
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={ref}
        onClose={() => setOpen(null)}
        onClick={(e) => {
          if (e.target === ref.current) setOpen(null);
        }}
        className="m-auto w-[min(56rem,calc(100vw-1.5rem))] max-h-[90vh] p-0 border border-paper-line bg-white backdrop:bg-brand-900/70 overflow-hidden"
        aria-labelledby="dc-title"
      >
        {open && (
          <div className={`grid max-h-[90vh] overflow-y-auto ${img ? "md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]" : ""}`}>
            {img && (
              <div className="relative bg-brand-200/40 h-44 md:h-auto md:min-h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={open.name} className="absolute inset-0 h-full w-full object-cover" />
              </div>
            )}
            <div className="p-6 sm:p-8 relative">
              <button onClick={() => setOpen(null)} aria-label="Close" className="absolute top-3 right-4 text-2xl leading-none text-steel hover:text-brand-900">
                &times;
              </button>
              <span className={`px-2 py-0.5 text-[11px] font-semibold ${m(open.level).badge}`}>{m(open.level).label}</span>
              <h2 id="dc-title" className="mt-3 font-display font-semibold text-2xl leading-snug text-brand-900 pr-6">
                {open.name}
              </h2>
              <p className="mt-1 font-mono text-xs text-accent-dark">{dept}</p>
              {(open.duration || open.entry || open.exam_body) && (
                <dl className="mt-5 grid grid-cols-2 gap-px bg-paper-line border border-paper-line text-sm">
                  {open.duration && <div className="bg-white p-3"><dt className="text-xs text-steel">Duration</dt><dd className="font-medium">{open.duration}</dd></div>}
                  {open.exam_body && <div className="bg-white p-3"><dt className="text-xs text-steel">Examined by</dt><dd className="font-medium">{open.exam_body}</dd></div>}
                  {open.entry && <div className="bg-white p-3 col-span-2"><dt className="text-xs text-steel">Entry requirement</dt><dd className="font-medium">{open.entry}</dd></div>}
                </dl>
              )}
              <div className="mt-5 space-y-3">
                {paras.map((t, i) => (
                  <p key={i} className="text-sm text-steel leading-relaxed whitespace-pre-line">{t}</p>
                ))}
              </div>
              <div className="mt-6">
                <Link href="/admissions" className="inline-block bg-accent text-brand-900 font-semibold px-5 py-2.5 hover:bg-accent-dark transition-colors">
                  Apply now
                </Link>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
