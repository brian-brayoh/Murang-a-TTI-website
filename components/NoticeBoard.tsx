"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type BoardNotice = {
  id: string;
  title: string;
  date: string; // ISO
  image: string;
  files: { label: string; url: string }[];
  html: string; // already sanitised on the server
  excerpt: string;
  editHref?: string;
};

const PAGE = 8;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function DateBlock({ iso }: { iso: string }) {
  const d = new Date(iso);
  return (
    <div className="shrink-0 w-14 text-center border border-paper-line bg-white self-start">
      <div className="bg-brand-700 text-white font-mono text-[11px] py-0.5 uppercase">{MONTHS[d.getMonth()]}</div>
      <div className="font-display font-semibold text-xl leading-none py-1.5 text-brand-900">{d.getDate()}</div>
      <div className="font-mono text-[10px] text-steel pb-1">{d.getFullYear()}</div>
    </div>
  );
}

export default function NoticeBoard({ items }: { items: BoardNotice[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "files" | "images">("all");
  const [shown, setShown] = useState(PAGE);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return items.filter((n) => {
      if (filter === "files" && n.files.length === 0) return false;
      if (filter === "images" && !n.image) return false;
      return !t || n.title.toLowerCase().includes(t) || n.excerpt.toLowerCase().includes(t);
    });
  }, [items, q, filter]);

  const chip = (id: typeof filter, label: string, count: number) => (
    <button
      key={id}
      onClick={() => { setFilter(id); setShown(PAGE); }}
      aria-pressed={filter === id}
      className={`px-3.5 py-1.5 text-sm border transition-colors ${filter === id ? "bg-brand-700 border-brand-700 text-white" : "bg-white border-paper-line hover:border-brand-700"}`}
    >
      {label} <span className="font-mono text-xs opacity-70">{count}</span>
    </button>
  );

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {chip("all", "All notices", items.length)}
          {chip("files", "With documents", items.filter((n) => n.files.length).length)}
          {chip("images", "With images", items.filter((n) => n.image).length)}
        </div>
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setShown(PAGE); }}
          placeholder="Search notices"
          aria-label="Search notices"
          className="w-full lg:w-72 border border-paper-line bg-white px-3.5 py-2 text-sm focus:outline-none focus:border-brand-700"
        />
      </div>

      <ul className="mt-6 grid lg:grid-cols-2 gap-5">
        {list.slice(0, shown).map((n) => {
          const isOpen = !!open[n.id];
          const hasMore = n.html.replace(/<[^>]+>/g, "").trim().length > n.excerpt.length || !!n.image;
          return (
            <li key={n.id} className="bg-white border border-paper-line hover:border-brand-700 transition-colors flex flex-col">
              <div className="p-5 flex gap-4">
                <DateBlock iso={n.date} />
                <div className="min-w-0 flex-1">
                  <h3 className="font-display font-semibold text-lg leading-snug text-brand-900">{n.title}</h3>
                  {!isOpen && n.excerpt && <p className="mt-2 text-sm text-steel leading-relaxed">{n.excerpt}</p>}
                  {n.editHref && (
                    <Link href={n.editHref} className="mt-2 inline-block bg-accent text-brand-900 text-xs font-semibold px-3 py-1.5 hover:bg-accent-dark">Edit this notice</Link>
                  )}
                </div>
                {n.image && !isOpen && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={n.image} alt="" loading="lazy" className="hidden sm:block shrink-0 h-24 w-24 object-cover border border-paper-line" />
                )}
              </div>

              {isOpen && (
                <div className="px-5 pb-2">
                  {n.image && (
                    <a href={n.image} target="_blank" rel="noopener noreferrer" className="block mb-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={n.image} alt={n.title} loading="lazy" className="w-full max-h-[28rem] object-contain bg-brand-900/5 border border-paper-line" />
                    </a>
                  )}
                  <div className="rich text-sm text-steel" dangerouslySetInnerHTML={{ __html: n.html }} />
                </div>
              )}

              <div className="mt-auto px-5 pb-5 pt-2 flex flex-wrap items-center gap-2">
                {n.files.map((f) => {
                  const ext = (f.url.split("?")[0].split(".").pop() || "file").toUpperCase().slice(0, 4);
                  return (
                    <a key={f.url} href={f.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-brand-700 text-white px-3 py-1.5 text-sm font-semibold hover:bg-brand-900">
                      <span className="font-mono text-[10px] bg-white/20 px-1">{ext}</span>
                      {f.label || "Open document"}
                    </a>
                  );
                })}
                {hasMore && (
                  <button
                    onClick={() => setOpen((o) => ({ ...o, [n.id]: !isOpen }))}
                    aria-expanded={isOpen}
                    className="ml-auto text-sm font-semibold text-brand-700 hover:text-accent-dark"
                  >
                    {isOpen ? "Show less ↑" : "Read full notice ↓"}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {list.length === 0 && <p className="mt-8 text-steel">No notices match. Try a different word or filter.</p>}

      {list.length > shown && (
        <div className="mt-8 text-center">
          <button onClick={() => setShown((s) => s + PAGE)} className="border border-brand-700 text-brand-700 font-semibold px-6 py-2.5 hover:bg-brand-700 hover:text-white transition-colors">
            Show more notices ({list.length - shown} left)
          </button>
        </div>
      )}
    </div>
  );
}
