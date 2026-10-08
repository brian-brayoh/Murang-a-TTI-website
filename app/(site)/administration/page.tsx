import type { Metadata } from "next";
import HeroBackdrop from "@/components/HeroBackdrop";
import { staff } from "@/lib/repo";

export const metadata: Metadata = {
  title: "Administration | Murang'a TTI",
};

export const dynamic = "force-dynamic";

type Person = { id: string; name: string; title: string; department: string; photo_url: string };

function initials(name: string) {
  return name
    .replace(/^(mr|mrs|ms|dr|prof)\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function Card({ p, showDept }: { p: Person; big?: boolean; showDept?: boolean }) {
  return (
    <article className="bg-paper p-6">
      {p.photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.photo_url} alt={p.name} loading="lazy" className="aspect-[4/5] w-full object-cover object-top bg-brand-200" />
      ) : (
        <div className="aspect-[4/5] w-full bg-brand-700 text-white grid place-items-center font-display font-semibold text-4xl">
          {initials(p.name)}
        </div>
      )}
      <h3 className="mt-4 font-display font-semibold leading-snug">{p.name}</h3>
      <p className="mt-0.5 text-sm text-steel">{p.title}</p>
      {showDept && <p className="mt-2 font-mono text-xs text-accent-dark">{p.department}</p>}
    </article>
  );
}

export default async function Administration() {
  const all = (await staff.listAll()) as Person[];
  const leadership = all.filter((p) => p.department === "Administration");
  const heads = all.filter((p) => !["Administration", "Institute Services", "Support Staff", "Students' Council"].includes(p.department));
  const services = all.filter((p) => p.department === "Institute Services");

  return (
    <>
      <section className="relative bg-brand-900 text-white overflow-hidden">
        <HeroBackdrop id="administration" />
        <div className="relative max-w-6xl mx-auto px-6 lg:px-10 py-16">
          <p className="tick text-accent font-mono text-sm">Administration</p>
          <h1 className="mt-3 font-display font-semibold text-4xl max-w-2xl">Institute leadership</h1>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-16 space-y-16">
        <div>
          <h2 className="font-display font-semibold text-2xl text-brand-700 mb-6">Senior leadership</h2>
          {leadership.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-paper-line border border-paper-line">
              {leadership.map((p) => (
                <Card key={p.id} p={p} big />
              ))}
            </div>
          ) : (
            <p className="text-sm text-steel">Not yet listed.</p>
          )}
        </div>

        {heads.length > 0 && (
          <div>
            <h2 className="font-display font-semibold text-2xl text-brand-700 mb-6">Heads of department</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-paper-line border border-paper-line">
              {heads.map((p) => (
                <Card key={p.id} p={p} showDept />
              ))}
            </div>
          </div>
        )}

        {services.length > 0 && (
          <div>
            <h2 className="font-display font-semibold text-2xl text-brand-700 mb-6">Student and institute services</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-paper-line border border-paper-line">
              {services.map((p) => (
                <Card key={p.id} p={p} />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
