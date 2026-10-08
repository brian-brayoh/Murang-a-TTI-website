import type { Metadata } from "next";
import HeroBackdrop from "@/components/HeroBackdrop";
import { pageContent } from "@/lib/repo";
import { getCouncil } from "@/lib/council";
import { BUILTIN } from "@/lib/builtin-pages";
import RichText from "@/components/RichText";
import EditLink from "@/components/EditLink";

export const metadata: Metadata = {
  title: "Students' Council | Murang'a TTI",
};

export const dynamic = "force-dynamic";

export default async function StudentsCouncil() {
  const row = await pageContent.get("builtin:students-council");
  const b = BUILTIN["students-council"];
  const { officials } = await getCouncil();

  return (
    <>
      <section className="relative bg-brand-900 text-white overflow-hidden">
        <HeroBackdrop id="council" />
        <div className="relative max-w-6xl mx-auto px-6 lg:px-10 py-16">
          <p className="tick text-accent font-mono text-sm">Students&apos; Council</p>
          <h1 className="mt-3 font-display font-semibold text-4xl max-w-2xl">
            {row?.title || b.heading}
          </h1>
          <EditLink href="/admin/pages/builtin/students-council" label="Edit this page" className="mt-4" />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-16">
        <RichText body={row?.body || b.html} className="text-steel leading-relaxed max-w-2xl space-y-4" />

        <ul className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-paper-line border border-paper-line">
          {officials.map((o) => (
            <li key={o.position} className="bg-paper p-6">
              {o.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={o.photo} alt={o.name || o.position} loading="lazy" className="aspect-[4/5] w-full object-cover object-top bg-brand-200" />
              ) : (
                <div className="aspect-[4/5] w-full bg-brand-200/60 grid place-items-center text-brand-700 font-display font-semibold text-4xl">
                  {o.name ? o.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() : "?"}
                </div>
              )}
              <p className="mt-4 font-display font-semibold leading-snug">{o.position}</p>
              {o.name ? (
                <p className="mt-0.5 text-sm text-steel">{o.name}</p>
              ) : (
                <p className="mt-1 inline-block bg-accent/20 text-accent-dark font-mono text-xs px-2 py-0.5">Coming soon</p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
