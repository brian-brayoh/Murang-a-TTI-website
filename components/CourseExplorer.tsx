"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type CourseItem = {
  id: string;
  name: string;
  department: string;
  level: number;
  summary: string;
  duration?: string;
  entry?: string;
  exam_body?: string;
  image_url?: string;
  details?: string;
};

type DeptInfo = {
  id: string;
  tagline?: string;
  blurb: string;
  image: string;
  imageCaption: string;
  careers: string[];
  highlights?: string[];
  highlightsLabel?: string;
};

// Banner photo: resized/compressed by Next, lazy-loaded, with a branded
// fallback tile if the file is missing.
function Banner({ src, alt, name, priority }: { src?: string; alt: string; name: string; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  const mono = name.split(/[\s&]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("");
  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-brand-900">
      {src && !failed ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
          priority={priority}
          onError={() => setFailed(true)}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center blueprint-grid">
          <span className="font-display font-semibold text-6xl text-white/25">{mono}</span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand-900/70 to-transparent" aria-hidden />
    </div>
  );
}

// level -> label, badge colours, left-edge colour. Level 3 / Grade courses (3) sort last.
const LEVEL_META: Record<number, { label: string; short: string; badge: string; edge: string }> = {
  4: { label: "Level 4 · Artisan", short: "Artisan", badge: "bg-brand-200 text-brand-900", edge: "border-l-brand-200" },
  5: { label: "Level 5 · Craft", short: "Craft", badge: "bg-brand-500 text-white", edge: "border-l-brand-500" },
  6: { label: "Level 6 · Diploma", short: "Diploma", badge: "bg-brand-900 text-white", edge: "border-l-brand-900" },
  3: { label: "Level 3 / Grades", short: "Level 3", badge: "bg-accent text-brand-900", edge: "border-l-accent" },
};
const RANK: Record<number, number> = { 4: 0, 5: 1, 6: 2, 3: 3 };

export default function CourseExplorer({
  courses,
  departments,
  deptInfo = {},
}: {
  courses: CourseItem[];
  departments: string[];
  deptInfo?: Record<string, DeptInfo>;
}) {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("All");
  const [level, setLevel] = useState<number | "All">("All");
  const [open, setOpen] = useState<CourseItem | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    courses.forEach((c) => (m[c.department] = (m[c.department] || 0) + 1));
    return m;
  }, [courses]);

  const levelsPresent = useMemo(
    () => [4, 5, 6, 3].filter((l) => courses.some((c) => c.level === l)),
    [courses]
  );

  const grouped = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = courses
      .filter(
        (c) =>
          (dept === "All" || c.department === dept) &&
          (level === "All" || c.level === level) &&
          (term === "" || `${c.name} ${c.department} ${c.summary} ${c.exam_body || ""}`.toLowerCase().includes(term))
      )
      .sort((a, b) => (RANK[a.level] ?? 9) - (RANK[b.level] ?? 9) || a.name.localeCompare(b.name));
    return departments
      .map((d) => ({ name: d, items: list.filter((c) => c.department === d) }))
      .filter((g) => g.items.length > 0);
  }, [courses, departments, dept, level, q]);

  const total = grouped.reduce((n, g) => n + g.items.length, 0);
  const filtering = q !== "" || dept !== "All" || level !== "All";

  function reset() {
    setQ("");
    setDept("All");
    setLevel("All");
  }

  const chip = (active: boolean) =>
    `px-3.5 py-1.5 text-sm border whitespace-nowrap transition-colors ${
      active ? "bg-brand-700 border-brand-700 text-white" : "border-paper-line bg-white hover:border-brand-700"
    }`;

  const info = open ? deptInfo[open.department] : undefined;
  const img = open ? open.image_url || info?.image || "" : "";
  const paragraphs = open
    ? (open.details || open.summary || info?.blurb || "")
        .split(/\n{2,}/)
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <div>
      {/* department showcase */}
      <section aria-labelledby="depts-title" className="max-w-6xl mx-auto px-6 lg:px-10 pt-12 pb-4">
        <h2 id="depts-title" className="font-display font-semibold text-2xl text-brand-900">
          Our departments
        </h2>
        <p className="mt-1 text-sm text-steel max-w-xl">Open a department for its programmes, photos and the full story, or scroll on to browse every course.</p>
        <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {departments.map((d, idx) => {
            const di = deptInfo[d];
            const mine = courses.filter((c) => c.department === d);
            const names = Array.from(new Set([...mine].sort((a, b) => (b.level === 3 ? -1 : b.level) - (a.level === 3 ? -1 : a.level) || a.name.localeCompare(b.name)).map((c) => c.name))).slice(0, 3);
            const lv = mine.map((c) => c.level).filter((l) => l >= 4);
            const range = lv.length ? (Math.min(...lv) === Math.max(...lv) ? `Level ${lv[0]}` : `Levels ${Math.min(...lv)}–${Math.max(...lv)}`) : "";
            return (
              <li key={d} className="group relative flex flex-col bg-white border border-paper-line hover:border-brand-700 hover:shadow-lg hover:-translate-y-1 transition duration-200">
                <div className="relative">
                  <Banner src={di?.image} alt={di?.imageCaption || d} name={d} priority={idx < 2} />
                  <span className={`absolute top-3 left-3 px-2 py-0.5 text-[11px] font-semibold ${mine.length > 0 ? "bg-accent text-brand-900" : "bg-white/90 text-brand-700"}`}>
                    {mine.length > 0 ? `${mine.length} programmes` : "Course list coming soon"}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-display font-semibold leading-snug text-brand-900">{d}</h3>
                  {di?.tagline && <p className="text-xs text-accent-dark font-mono mt-0.5">{di.tagline}</p>}
                  {mine.length > 0 ? (
                    <>
                      <ul className="mt-3 space-y-1 text-sm text-steel">
                        {names.map((n) => (
                          <li key={n} className="flex gap-2"><span aria-hidden className="text-accent">&bull;</span>{n}</li>
                        ))}
                      </ul>
                      <p className="mt-2 font-mono text-[11px] text-steel">{range || `${mine.length} programmes`}</p>
                    </>
                  ) : (
                    di?.highlights && di.highlights.length > 0 ? (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-ink">{di.highlightsLabel || "Covers"}</p>
                        <ul className="mt-1.5 flex flex-wrap gap-1.5">
                          {di.highlights.slice(0, 5).map((h) => (
                            <li key={h} className="bg-brand-200/50 text-brand-900 text-[11px] px-2 py-0.5">{h}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-steel leading-relaxed line-clamp-3">{di?.blurb}</p>
                    )
                  )}
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <Link href={`/courses/${di?.id ?? ""}`} className="text-sm font-semibold text-brand-700 group-hover:text-accent-dark after:absolute after:inset-0">
                      Explore department &rarr;
                    </Link>
                    <Link href="/admissions" className="relative z-10 text-xs bg-accent text-brand-900 font-semibold px-3 py-1.5 hover:bg-accent-dark">
                      Apply
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div id="programmes" className="scroll-mt-4" />

      {/* filter bar */}
      <div className="sticky top-[4.5rem] md:top-[6.25rem] z-40 bg-paper/95 backdrop-blur border-b border-paper-line">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-4 space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search a course, e.g. plumbing, ICT, carpentry"
              aria-label="Search courses"
              className="w-full lg:max-w-md border border-paper-line bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-brand-700"
            />
            <div className="flex gap-2 overflow-x-auto -mx-6 px-6 lg:mx-0 lg:px-0" role="group" aria-label="Level">
              <button className={chip(level === "All")} onClick={() => setLevel("All")}>
                All levels
              </button>
              {levelsPresent.map((l) => (
                <button key={l} className={chip(level === l)} onClick={() => setLevel(l)}>
                  {LEVEL_META[l].label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto -mx-6 px-6 lg:mx-0 lg:px-0 pb-1" role="group" aria-label="Department">
            <button className={chip(dept === "All")} onClick={() => setDept("All")}>
              All departments
            </button>
            {departments.filter((d) => (counts[d] || 0) > 0).map((d) => (
              <button key={d} className={chip(dept === d)} onClick={() => setDept(d)}>
                {d}
                <span className="ml-1.5 font-mono text-xs opacity-70">{counts[d] || 0}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* results, grouped by department */}
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10">
        <div className="flex items-center justify-between gap-4 mb-8" aria-live="polite">
          <p className="font-mono text-xs text-steel">
            {total} of {courses.length} programmes
          </p>
          {filtering && (
            <button onClick={reset} className="text-sm font-medium text-brand-700 hover:text-accent-dark">
              Clear filters
            </button>
          )}
        </div>

        <div className="space-y-12">
          {grouped.map((g) => {
            const di = deptInfo[g.name];
            return (
              <section key={g.name} aria-labelledby={`dept-${g.name}`}>
                <div className="flex flex-wrap items-end justify-between gap-2 border-b-2 border-brand-700 pb-2 mb-5">
                  <div>
                    <h2 id={`dept-${g.name}`} className="font-display font-semibold text-xl text-brand-900">
                      {g.name}
                    </h2>
                    {di?.tagline && <p className="text-sm text-steel">{di.tagline}</p>}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-steel">{g.items.length} programmes</span>
                    {di && (
                      <Link href={`/academics#${di.id}`} className="text-sm font-medium text-brand-700 hover:text-accent-dark">
                        About the department
                      </Link>
                    )}
                  </div>
                </div>

                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {g.items.map((c) => {
                    const m = LEVEL_META[c.level] ?? LEVEL_META[6];
                    return (
                      <li key={c.id}>
                        <button
                          onClick={() => setOpen(c)}
                          className={`group w-full h-full text-left bg-white border border-paper-line border-l-4 ${m.edge} p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={`px-2 py-0.5 text-[11px] font-semibold ${m.badge}`}>{m.label}</span>
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
                    );
                  })}
                </ul>
              </section>
            );
          })}
          {total === 0 && (
            <div className="border border-dashed border-paper-line p-8 text-center text-steel">
              <p>No programmes match your search.</p>
              <button onClick={reset} className="mt-2 text-sm font-medium text-brand-700 hover:text-accent-dark">
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* details dialog: the photo is only fetched when a course is opened */}
      <dialog
        ref={dialogRef}
        onClose={() => setOpen(null)}
        onClick={(e) => {
          if (e.target === dialogRef.current) setOpen(null);
        }}
        className="m-auto w-[min(56rem,calc(100vw-1.5rem))] max-h-[90vh] p-0 border border-paper-line bg-white backdrop:bg-brand-900/70 overflow-hidden"
        aria-labelledby="course-title"
      >
        {open && (
          <div className={`grid max-h-[90vh] overflow-y-auto ${img ? "md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]" : ""}`}>
            {img && (
              <div className="relative bg-brand-200/40 h-44 md:h-auto md:min-h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={info?.imageCaption || open.name} className="absolute inset-0 h-full w-full object-cover" />
              </div>
            )}
            <div className="p-6 sm:p-8 relative">
              <button
                onClick={() => setOpen(null)}
                aria-label="Close"
                className="absolute top-3 right-4 text-2xl leading-none text-steel hover:text-brand-900"
              >
                &times;
              </button>
              <span className={`px-2 py-0.5 text-[11px] font-semibold ${(LEVEL_META[open.level] ?? LEVEL_META[6]).badge}`}>
                {(LEVEL_META[open.level] ?? LEVEL_META[6]).label}
              </span>
              <h2 id="course-title" className="mt-3 font-display font-semibold text-2xl leading-snug text-brand-900 pr-6">
                {open.name}
              </h2>
              <p className="mt-1 font-mono text-xs text-accent-dark">{open.department}</p>

              {(open.duration || open.entry || open.exam_body) && (
                <dl className="mt-5 grid grid-cols-2 gap-px bg-paper-line border border-paper-line text-sm">
                  {open.duration && (
                    <div className="bg-white p-3"><dt className="text-xs text-steel">Duration</dt><dd className="font-medium">{open.duration}</dd></div>
                  )}
                  {open.exam_body && (
                    <div className="bg-white p-3"><dt className="text-xs text-steel">Examined by</dt><dd className="font-medium">{open.exam_body}</dd></div>
                  )}
                  {open.entry && (
                    <div className="bg-white p-3 col-span-2"><dt className="text-xs text-steel">Entry requirement</dt><dd className="font-medium">{open.entry}</dd></div>
                  )}
                </dl>
              )}

              <div className="mt-5 space-y-3">
                {paragraphs.map((t, i) => (
                  <p key={i} className="text-sm text-steel leading-relaxed whitespace-pre-line">{t}</p>
                ))}
              </div>

              {info?.careers && info.careers.length > 0 && (
                <p className="mt-4 text-sm text-steel">
                  <span className="font-medium text-ink">Career paths:</span> {info.careers.join(", ")}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link href="/admissions" className="bg-accent text-brand-900 font-semibold px-5 py-2.5 hover:bg-accent-dark transition-colors">
                  Apply now
                </Link>
                {info && (
                  <Link href={`/academics#${info.id}`} className="text-sm font-medium text-brand-700 hover:text-accent-dark">
                    About the department
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
