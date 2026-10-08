import type { Metadata } from "next";
import HeroBackdrop from "@/components/HeroBackdrop";
import Link from "next/link";
import { departments, pathway } from "@/lib/academics";
import DepartmentNav from "@/components/DepartmentNav";
import { getSite } from "@/lib/site-details";
import { waHref } from "@/lib/contact-links";
import PhotoFrame from "@/components/PhotoFrame";

export const metadata: Metadata = {
  title: "Academics | Murang'a TTI",
  description:
    "Seven departments and CBET training from Level 4 to Level 6 at Murang'a Technical Training Institute, Maragua.",
};

const stairHeights = ["min-h-40", "min-h-52", "min-h-64"];
const stairTones = [
  "bg-brand-200 text-brand-900",
  "bg-brand-500 text-white",
  "bg-brand-900 text-white",
];

export default async function Academics() {
  const site = await getSite();
  return (
    <>
      {/* hero */}
      <section className="relative bg-brand-900 text-white overflow-hidden">
        <HeroBackdrop id="academics" />
        <div className="absolute inset-0 blueprint-grid" aria-hidden />
        <div className="relative max-w-6xl mx-auto px-6 lg:px-10 py-16 lg:py-20 grid lg:grid-cols-[1.3fr_1fr] gap-10 items-end">
          <div>
            <p className="tick text-accent font-mono text-sm">Academics</p>
            <h1 className="mt-3 font-display font-semibold text-4xl sm:text-5xl leading-[1.08] max-w-2xl">
              Seven departments, one workshop-first approach.
            </h1>
            <p className="mt-5 text-brand-200 text-lg max-w-xl leading-relaxed">
              Competency-based training that puts a tool, a circuit or a
              keyboard in your hands from the first week.
            </p>
          </div>
          <dl className="grid grid-cols-3 border border-white/15 divide-x divide-white/15 font-mono">
            <div className="p-4">
              <dt className="text-xs text-brand-200">Departments</dt>
              <dd className="mt-1 text-3xl text-accent">7</dd>
            </div>
            <div className="p-4">
              <dt className="text-xs text-brand-200">CBET levels</dt>
              <dd className="mt-1 text-3xl text-accent">4&ndash;6</dd>
            </div>
            <div className="p-4">
              <dt className="text-xs text-brand-200">Assessed by</dt>
              <dd className="mt-2 text-xs leading-relaxed">KNEC &amp; TVET CDACC</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* pathway staircase */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 items-end">
          <div>
            <p className="tick text-accent-dark font-mono text-sm">Your route up</p>
            <h2 className="mt-3 font-display font-semibold text-3xl leading-tight">
              Start at Level 4. Climb to a diploma.
            </h2>
            <p className="mt-4 text-steel leading-relaxed max-w-md">
              Every department trains across three levels, so a trainee can
              build from first skills to advanced technician practice without
              changing institutions.
            </p>
            <Link
              href="/courses"
              className="mt-5 inline-block text-sm font-semibold text-brand-700 hover:text-accent-dark"
            >
              Browse every course &rarr;
            </Link>
          </div>
          <ol className="grid grid-cols-3 items-end gap-2">
            {pathway.map((p, i) => (
              <li
                key={p.level}
                className={`${stairHeights[i]} ${stairTones[i]} p-4 sm:p-5 flex flex-col justify-between`}
              >
                <div>
                  <p className="font-mono text-xs opacity-80">{p.level}</p>
                  <p className="mt-1 font-display font-semibold leading-snug">{p.award}</p>
                </div>
                <p className="mt-3 text-xs leading-relaxed opacity-90 hidden sm:block">{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* departments */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 pb-20">
        <div className="grid lg:grid-cols-[13rem_1fr] gap-x-12 gap-y-6 border-t border-paper-line pt-10">
          <DepartmentNav items={departments.map((d) => ({ id: d.id, name: d.name }))} />

          <div className="space-y-20">
            {departments.map((d) => (
              <article key={d.id} id={d.id} className="scroll-mt-32">
                <p className="font-mono text-xs text-accent-dark">{d.tagline}</p>
                <h2 className="mt-1 font-display font-semibold text-3xl text-brand-700">
                  {d.name}
                </h2>

                <div className="mt-6 grid xl:grid-cols-[1.15fr_1fr] gap-8">
                  <div>
                    <p className="leading-relaxed">{d.blurb}</p>

                    {d.focus && (
                      <ul className="mt-5 space-y-2 text-sm">
                        {d.focus.map((f) => (
                          <li key={f} className="tick">
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}

                    {d.levels ? (
                      <div className="mt-7 border-t border-paper-line">
                        {d.levels.map((l) => (
                          <div
                            key={l.level}
                            className="grid sm:grid-cols-[5rem_1fr] gap-x-4 gap-y-1 py-4 border-b border-paper-line"
                          >
                            <p className="font-mono text-sm text-accent-dark">{l.level}</p>
                            <div>
                              <p className="font-medium leading-snug">{l.award}</p>
                              <p className="mt-1 text-sm text-steel leading-relaxed">{l.summary}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-6 border-l-2 border-accent pl-4 text-sm text-steel leading-relaxed">
                        Training runs at Levels 4 to 6. Ask the admissions
                        office for the programmes open to your KCSE grade
                        this intake.
                      </p>
                    )}

                    {d.careers && (
                      <p className="mt-6 text-sm text-steel">
                        <span className="font-medium text-ink">Where graduates work: </span>
                        {d.careers.join(", ")}.
                      </p>
                    )}

                    <Link
                      href="/admissions"
                      className="mt-6 inline-block text-sm font-semibold text-brand-700 hover:text-accent-dark"
                    >
                      Apply to {d.name} &rarr;
                    </Link>
                  </div>

                  <PhotoFrame
                    src={d.image}
                    alt={d.imageCaption || d.name}
                    caption={d.imageCaption}
                    label={d.name}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-brand-900">
          <div>
            <h2 className="font-display font-semibold text-2xl sm:text-3xl">
              Not sure which department fits?
            </h2>
            <p className="mt-1 text-sm">
              Talk to admissions. Recognition of Prior Learning is open all year.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <a
              href={waHref(site.whatsapp, "Hello MTTI, I need help choosing a course")}
              className="border border-brand-900 px-5 py-2.5 font-medium hover:bg-brand-900 hover:text-white transition-colors"
            >
              WhatsApp us
            </a>
            <Link
              href="/admissions"
              className="bg-brand-900 text-white font-semibold px-5 py-2.5 hover:bg-brand-800 transition-colors"
            >
              Apply now
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
