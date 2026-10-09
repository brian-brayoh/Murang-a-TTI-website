"use client";

import { useRef, useState } from "react";
import { ImageField } from "@/components/MediaPicker";
import type { Partner } from "@/lib/partners";
import { savePartnersAction } from "./actions";

type Row = Partner & { key: number };
const input = "mt-1 w-full border border-paper-line px-3 py-2 bg-white focus:outline-none focus:border-brand-700";

export default function PartnersForm({ partners }: { partners: Partner[] }) {
  const next = useRef(partners.length);
  const [rows, setRows] = useState<Row[]>(() => partners.map((o, i) => ({ ...o, key: i })));
  const set = (key: number, patch: Partial<Partner>) => setRows((r) => r.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  const move = (i: number, d: number) =>
    setRows((r) => {
      const j = i + d;
      if (j < 0 || j >= r.length) return r;
      const c = [...r];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });

  return (
    <form action={savePartnersAction} className="mt-6 max-w-3xl">
      <input type="hidden" name="partners" value={JSON.stringify(rows.map((r) => ({ name: r.name, logo: r.logo, url: r.url })))} />
      <p className="text-sm text-steel"><strong className="text-brand-900">{rows.length}</strong> partners. They scroll in this order.</p>
      <div className="mt-4 space-y-4">
        {rows.map((r, i) => (
          <div key={r.key} className="border border-paper-line bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs text-accent-dark">{i + 1}. {r.name || "New partner"}</p>
              <div className="flex gap-3 text-xs">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-steel hover:text-brand-700 disabled:opacity-30">&uarr; Up</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="text-steel hover:text-brand-700 disabled:opacity-30">&darr; Down</button>
                <button type="button" onClick={() => setRows((x) => x.filter((y) => y.key !== r.key))} className="text-steel hover:text-accent">Remove</button>
              </div>
            </div>
            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-steel">Name</label>
                <input value={r.name} onChange={(e) => set(r.key, { name: e.target.value })} className={input} placeholder="e.g. KNEC" />
              </div>
              <div>
                <label className="text-sm text-steel">Website (optional)</label>
                <input value={r.url} onChange={(e) => set(r.key, { url: e.target.value })} className={input} placeholder="https://www.knec.ac.ke" />
              </div>
            </div>
            <div className="mt-3">
              <ImageField name={`logo-${r.key}`} defaultValue={r.logo} label="Logo" onChange={(v) => set(r.key, { logo: v })} />
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setRows((r) => [...r, { key: next.current++, name: "", logo: "", url: "" }])}
        className="mt-4 border border-dashed border-brand-700 text-brand-700 px-4 py-2 text-sm hover:bg-brand-700 hover:text-white"
      >
        + Add a partner
      </button>
      <div className="sticky bottom-0 mt-8 py-3 bg-paper/95 backdrop-blur border-t border-paper-line">
        <button className="bg-brand-700 text-white font-semibold px-6 py-2.5 hover:bg-brand-900">Save partners</button>
      </div>
    </form>
  );
}
