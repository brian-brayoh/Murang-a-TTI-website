"use client";

import { useRef, useState } from "react";
import { ImageField } from "@/components/MediaPicker";
import type { Banner, HeroSlide, Popup, Sections } from "@/lib/home";
import { saveHomeAction } from "./actions";

type Row = { key: number; kicker: string; title: string; tagline: string; ctaLabel: string; ctaHref: string; src: string };
const TABS = [
  { id: "popup", label: "1. Pop-up & banner", help: "What visitors see first: the welcome box and the orange strip at the very top." },
  { id: "slides", label: "2. Slideshow", help: "The big rotating photos at the top of the home page." },
  { id: "sections", label: "3. Page sections", help: "Mission, vision, values, department heading, service charter and the bottom call to action." },
] as const;
const input = "mt-1 w-full border border-paper-line px-3 py-2 bg-white focus:outline-none focus:border-brand-700";

export default function HomeForm({ slides, banner, popup, sections }: { slides: HeroSlide[]; banner: Banner; popup: Popup; sections: Sections }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("popup");
  const next = useRef(slides.length);
  const [charter, setCharter] = useState(sections.charter);
  const [rows, setRows] = useState<Row[]>(() =>
    slides.map((s, i) => ({ key: i, kicker: s.kicker, title: s.title, tagline: s.tagline, ctaLabel: s.cta.label, ctaHref: s.cta.href, src: s.src }))
  );
  const set = (key: number, patch: Partial<Row>) => setRows((r) => r.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  const move = (i: number, d: number) =>
    setRows((r) => {
      const j = i + d;
      if (j < 0 || j >= r.length) return r;
      const c = [...r];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });
  const payload = JSON.stringify(rows.map(({ key: _k, ...x }) => x));

  return (
    <form action={saveHomeAction} className="mt-6 space-y-8 max-w-3xl">
      <input type="hidden" name="slides" value={payload} />
      <input type="hidden" name="charter" value={JSON.stringify(charter)} />

      <div role="tablist" aria-label="Home page sections" className="flex flex-wrap gap-1 border-b border-paper-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${tab === t.id ? "border-brand-700 text-brand-700" : "border-transparent text-steel hover:text-brand-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-steel">{TABS.find((t) => t.id === tab)?.help}</p>

      <div role="tabpanel" className={`mt-5 space-y-6 ${tab === "popup" ? "" : "hidden"}`}>
      <section className="border border-paper-line bg-white p-5 space-y-3">
        <h2 className="font-display font-semibold text-lg">Banner above the slideshow</h2>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="bannerShow" defaultChecked={banner.show} /> Show the banner
        </label>
        <div>
          <label className="text-sm text-steel">Message</label>
          <input name="bannerText" defaultValue={banner.text} className={input} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-steel">Link text</label>
            <input name="bannerLinkText" defaultValue={banner.linkText} className={input} />
          </div>
          <div>
            <label className="text-sm text-steel">Link to</label>
            <input name="bannerHref" defaultValue={banner.href} className={input} placeholder="/admissions" />
          </div>
        </div>
      </section>

      <section className="border border-paper-line bg-white p-5 space-y-3">
        <h2 className="font-display font-semibold text-lg">Welcome pop-up</h2>
        <p className="text-xs text-steel">The box that opens when someone arrives on the site. Saving a change shows it again to everyone, even those who closed it before.</p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="popupShow" defaultChecked={popup.show} /> Show the pop-up
        </label>
        <div>
          <label className="text-sm text-steel">How often does one visitor see it?</label>
          <select name="popupFrequency" defaultValue={popup.frequency} className={input}>
            <option value="session">Once per visit (recommended)</option>
            <option value="daily">Once a day</option>
            <option value="weekly">Once a week</option>
            <option value="always">On every page load (can annoy visitors)</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-steel">Headline (e.g. Intake Ongoing)</label>
          <input name="popupHeadline" defaultValue={popup.headline} className={input} />
        </div>
        <div>
          <label className="text-sm text-steel">Notice</label>
          <textarea name="popupNotice" defaultValue={popup.notice} rows={3} className={input} />
        </div>
        <div>
          <label className="text-sm text-steel">Welcome message (continues after &ldquo;Welcome to Murang&apos;a TTI&rdquo;)</label>
          <textarea name="popupWelcome" defaultValue={popup.welcome} rows={3} className={input} />
        </div>
      </section>
      </div>

      <div role="tabpanel" className={`mt-5 space-y-6 ${tab === "slides" ? "" : "hidden"}`}>
      <section className="space-y-4">
        <h2 className="font-display font-semibold text-lg">Slides ({rows.length})</h2>
        {rows.map((r, i) => (
          <div key={r.key} className="border border-paper-line bg-white p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs text-accent-dark">Slide {i + 1}</p>
              <div className="flex gap-3 text-xs">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-steel hover:text-brand-700 disabled:opacity-30">&uarr; Up</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="text-steel hover:text-brand-700 disabled:opacity-30">&darr; Down</button>
                <button type="button" onClick={() => setRows((x) => x.filter((y) => y.key !== r.key))} disabled={rows.length === 1} className="text-steel hover:text-accent disabled:opacity-30">Remove</button>
              </div>
            </div>
            <ImageField name={`img-${r.key}`} defaultValue={r.src} label="Background photo (wide photos work best)" onChange={(v) => set(r.key, { src: v })} />
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-steel">Small heading</label>
                <input value={r.kicker} onChange={(e) => set(r.key, { kicker: e.target.value })} className={input} />
              </div>
              <div>
                <label className="text-sm text-steel">Main heading</label>
                <input value={r.title} onChange={(e) => set(r.key, { title: e.target.value })} className={input} />
              </div>
            </div>
            <div>
              <label className="text-sm text-steel">Line under the heading</label>
              <input value={r.tagline} onChange={(e) => set(r.key, { tagline: e.target.value })} className={input} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-steel">Button text</label>
                <input value={r.ctaLabel} onChange={(e) => set(r.key, { ctaLabel: e.target.value })} className={input} />
              </div>
              <div>
                <label className="text-sm text-steel">Button links to</label>
                <input value={r.ctaHref} onChange={(e) => set(r.key, { ctaHref: e.target.value })} className={input} placeholder="/admissions" />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setRows((r) => [...r, { key: next.current++, kicker: "", title: "", tagline: "", ctaLabel: "Find out more", ctaHref: "/admissions", src: "" }])}
          className="border border-dashed border-brand-700 text-brand-700 px-4 py-2 text-sm hover:bg-brand-700 hover:text-white"
        >
          + Add a slide
        </button>
      </section>
      </div>

      <div role="tabpanel" className={`mt-5 space-y-6 ${tab === "sections" ? "" : "hidden"}`}>
      <section className="border border-paper-line bg-white p-5 space-y-3">
        <h2 className="font-display font-semibold text-lg">Who we are</h2>
        <div>
          <label className="text-sm text-steel">Headline</label>
          <input name="whoHeadline" defaultValue={sections.whoHeadline} className={input} />
        </div>
        <div>
          <label className="text-sm text-steel">Mission</label>
          <textarea name="mission" defaultValue={sections.mission} rows={3} className={input} />
        </div>
        <div>
          <label className="text-sm text-steel">Vision</label>
          <textarea name="vision" defaultValue={sections.vision} rows={3} className={input} />
        </div>
        <div>
          <label className="text-sm text-steel">Values</label>
          <textarea name="values" defaultValue={sections.values} rows={3} className={input} />
        </div>
      </section>

      <section className="border border-paper-line bg-white p-5 space-y-3">
        <h2 className="font-display font-semibold text-lg">Departments heading</h2>
        <input name="deptHeading" defaultValue={sections.deptHeading} className={input} />
        <p className="text-xs text-steel">The department cards themselves come from the Courses and Pages sections.</p>
      </section>

      <section className="border border-paper-line bg-white p-5 space-y-3">
        <h2 className="font-display font-semibold text-lg">Service charter</h2>
        <div>
          <label className="text-sm text-steel">Headline</label>
          <input name="charterHeadline" defaultValue={sections.charterHeadline} className={input} />
        </div>
        <div>
          <label className="text-sm text-steel">Paragraph</label>
          <textarea name="charterText" defaultValue={sections.charterText} rows={3} className={input} />
        </div>
        <p className="text-sm text-steel">Service standards</p>
        {charter.map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_10rem_auto] gap-2 items-center">
            <input value={r.label} onChange={(e) => setCharter((c) => c.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} className={input + " mt-0"} placeholder="e.g. Admission response" />
            <input value={r.value} onChange={(e) => setCharter((c) => c.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} className={input + " mt-0"} placeholder="3 working days" />
            <button type="button" onClick={() => setCharter((c) => c.filter((_, j) => j !== i))} className="text-xs text-steel hover:text-accent">Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => setCharter((c) => [...c, { label: "", value: "" }])} className="text-sm text-brand-700 underline">+ Add a row</button>
      </section>

      <section className="border border-paper-line bg-white p-5 space-y-3">
        <h2 className="font-display font-semibold text-lg">Bottom call to action</h2>
        <div className="grid sm:grid-cols-[1fr_12rem] gap-3">
          <div>
            <label className="text-sm text-steel">Headline</label>
            <input name="ctaHeadline" defaultValue={sections.ctaHeadline} className={input} />
          </div>
          <div>
            <label className="text-sm text-steel">Button text</label>
            <input name="ctaButton" defaultValue={sections.ctaButton} className={input} />
          </div>
        </div>
      </section>
      </div>

      <div className="sticky bottom-0 mt-8 -mx-1 px-1 py-3 bg-paper/95 backdrop-blur border-t border-paper-line flex items-center gap-4">
        <button className="bg-brand-700 text-white font-semibold px-6 py-2.5 hover:bg-brand-900">Save home page</button>
        <span className="text-xs text-steel">Saves every tab at once.</span>
      </div>
    </form>
  );
}
