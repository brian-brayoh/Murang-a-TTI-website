import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { courses, pageContent, parseJsonList } from "@/lib/repo";
import RichText from "@/components/RichText";
import UpdatedBy from "@/components/UpdatedBy";
import EditLink from "@/components/EditLink";
import { departments as academicDepts } from "@/lib/academics";
import { deptContent } from "@/lib/dept-content";
import photoManifest from "@/lib/dept-photos.json";
import { getSite } from "@/lib/site-details";
import { telHref, waHref } from "@/lib/contact-links";
import DeptCourseList from "@/components/DeptCourseList";

export const dynamic = "force-dynamic";

type Photo = { src: string; alt: string };
const manifest = photoManifest as Record<string, Photo[]>;

type Params = { dept: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { dept } = await params;
  const d = academicDepts.find((x) => x.id === dept);
  if (!d) return { title: "Department | Murang'a TTI" };
  return { title: `${d.name} | Murang'a TTI`, description: d.blurb };
}

export default async function DepartmentPage({ params }: { params: Promise<Params> }) {
  const { dept: id } = await params;
  const d = academicDepts.find((x) => x.id === id);
  if (!d) notFound();

  const site = await getSite();
  const content = deptContent[d.id];
  const edit = await pageContent.get(`dept:${d.id}`);
  const tagline = edit?.tagline || d.tagline;
  const editedImages = edit ? parseJsonList<string>(edit.images).map((src) => ({ src, alt: `${d.name} at MTTI` })) : [];
  const all = await courses.listPublished();
  const mine = all
    .filter((c) => c.department === d.name)
    .sort((a, b) => (a.level === 3 ? -1 : a.level) - (b.level === 3 ? -1 : b.level) || a.name.localeCompare(b.name));

  // photos: scraped from the old department pages, plus the main banner photo
  const photos: Photo[] = [];
  const seen = new Set<string>();
  for (const p of [...editedImages, ...(d.image ? [{ src: d.image, alt: d.imageCaption || d.name }] : []), ...(manifest[d.id] || [])]) {
    const key = p.src.split("/").pop()!.replace(/-\d+x\d+(?=\.)/, "").toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    photos.push(p);
  }
  const areas = mine.length === 0 && !edit?.body ? content?.blocks.filter((b) => (b.items || b.text) && !/values|aim|why|choose|skill dev|career prep|how we train/i.test(b.heading)) || [] : [];
  const hero = photos[0];
  const gallery = photos.slice(1, 9);

  const levels = Array.from(new Set(mine.map((c) => c.level).filter((l) => l >= 4))).sort();
  const levelText = levels.length ? (levels.length === 1 ? `Level ${levels[0]}` : `Levels ${levels[0]}–${levels[levels.length - 1]}`) : "";

  return (
    <>
      {/* hero */}
      <section className="relative bg-brand-900 text-white overflow-hidden">
        {hero && (
          <Image src={hero.src} alt="" fill priority sizes="100vw" className="object-cover opacity-30" />
        )}
        <div className="absolute inset-0 blueprint-grid" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900 via-brand-900/80 to-transparent" aria-hidden />
        <div className="relative max-w-6xl mx-auto px-6 lg:px-10 py-14 lg:py-20">
          <Link href="/courses" className="text-sm text-brand-200 hover:text-white">&larr; All departments</Link>
          <p className="tick text-accent font-mono text-sm mt-5">Department</p>
          <h1 className="mt-3 font-display font-semibold text-4xl sm:text-5xl leading-[1.08] max-w-2xl">{d.name}</h1>
          <p className="mt-4 text-brand-200 text-lg max-w-xl leading-relaxed">{tagline}</p>
          <EditLink href={`/admin/pages/dept/${d.id}`} label="Edit this department" className="mt-5" />
          <div className="mt-6 flex flex-wrap gap-3 font-mono text-xs">
            {mine.length > 0 && <span className="bg-white/10 px-3 py-1.5">{mine.length} programmes</span>}
            {levelText && <span className="bg-white/10 px-3 py-1.5">{levelText}</span>}
            <span className="bg-white/10 px-3 py-1.5">Intakes: Jan · May · Sep</span>
          </div>
        </div>
      </section>

      {/* department switcher */}
      <nav aria-label="Departments" className="sticky top-[4.5rem] md:top-[6.25rem] z-40 bg-paper/95 backdrop-blur border-b border-paper-line">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-3 flex gap-2 overflow-x-auto">
          {academicDepts.map((x) => (
            <Link
              key={x.id}
              href={`/courses/${x.id}`}
              aria-current={x.id === d.id ? "page" : undefined}
              className={`px-3.5 py-1.5 text-sm border whitespace-nowrap transition-colors ${
                x.id === d.id ? "bg-brand-700 border-brand-700 text-white" : "border-paper-line bg-white hover:border-brand-700"
              }`}
            >
              {x.name}
            </Link>
          ))}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12 grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-12">
        <div className="space-y-12 min-w-0">
          {/* writing */}
          <section>
            <h2 className="font-display font-semibold text-2xl text-brand-900">About the department</h2>
            {edit?.body ? (
              <>
                <RichText body={edit.body} className="mt-4 text-steel" />
                <UpdatedBy at={edit.updated_at} by={edit.updated_by} className="mt-4" />
              </>
            ) : (
              <div className="mt-4 space-y-4 text-steel leading-relaxed">
                {(content?.intro || [d.blurb]).map((t, i) => (
                  <p key={i}>{t}</p>
                ))}
              </div>
            )}
          </section>

          {/* photos */}
          {gallery.length > 0 && (
            <section aria-label="Photos">
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {gallery.map((p, i) => (
                  <li key={p.src} className={`group relative overflow-hidden bg-brand-900 aspect-[4/3] ${i === 0 ? "col-span-2 md:col-span-2 md:row-span-2 md:aspect-auto" : ""}`}>
                    <Image
                      src={p.src}
                      alt={p.alt || `${d.name} at MTTI`}
                      fill
                      sizes="(min-width:1024px) 40vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* programmes */}
          <section id="programmes" className="scroll-mt-32">
            <h2 className="font-display font-semibold text-2xl text-brand-900">{mine.length > 0 ? "Programmes" : "What you can study"}</h2>
            {mine.length > 0 ? (
              <>
                <p className="mt-1 text-sm text-steel">Tap a programme for duration, entry requirements and how to apply.</p>
                <div className="mt-5">
                  <DeptCourseList items={mine} fallbackImage={hero?.src} dept={d.name} />
                </div>
              </>
            ) : (
              <>
                {areas.length > 0 && (
                  <ol className="mt-5 grid sm:grid-cols-2 gap-4">
                    {areas.map((b, i) => (
                      <li key={b.heading} className="bg-white border border-paper-line border-t-4 border-t-brand-700 p-5">
                        <span className="font-mono text-xs text-accent-dark">{String(i + 1).padStart(2, "0")}</span>
                        <h3 className="mt-1 font-display font-semibold text-lg leading-snug text-brand-900">{b.heading}</h3>
                        {b.text && <p className="mt-2 text-sm text-steel leading-relaxed">{b.text}</p>}
                        {b.items && (
                          <ul className="mt-3 flex flex-wrap gap-1.5">
                            {b.items.map((it) => (
                              <li key={it} className="bg-brand-200/50 text-brand-900 text-xs px-2.5 py-1">{it}</li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
                <div className="mt-6 border border-dashed border-brand-700 bg-brand-200/20 p-6">
                  <p className="inline-block bg-accent text-brand-900 font-mono text-xs font-semibold px-2.5 py-1">Course list coming soon</p>
                  <p className="mt-3 text-steel leading-relaxed max-w-xl">
                    The full list of {d.name} programmes, levels and entry requirements is being confirmed. Talk to admissions to find out what is open this intake.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <a href={waHref(site.whatsapp, `Hello MTTI, I want to know about ${d.name} programmes`)} className="border border-brand-700 text-brand-700 font-medium px-5 py-2.5 hover:bg-brand-700 hover:text-white transition-colors">WhatsApp admissions</a>
                    <a href={`tel:${telHref(site.phone)}`} className="border border-brand-700 text-brand-700 font-medium px-5 py-2.5 hover:bg-brand-700 hover:text-white transition-colors">Call {site.phone}</a>
                    <Link href="/admissions" className="bg-accent text-brand-900 font-semibold px-5 py-2.5 hover:bg-accent-dark transition-colors">Register interest</Link>
                  </div>
                  <EditLink href="/admin/courses" label="Add programmes to this department" className="mt-4" />
                </div>
              </>
            )}
          </section>

          {/* more writing */}
          {!edit?.body && (content?.blocks || []).filter((b) => mine.length > 0 || !areas.includes(b)).map((b) => (
            <section key={b.heading}>
              <h2 className="font-display font-semibold text-xl text-brand-900 border-b-2 border-brand-700 pb-2">{b.heading}</h2>
              {b.text && <p className="mt-4 text-steel leading-relaxed">{b.text}</p>}
              {b.items && (
                <ul className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-steel">
                  {b.items.map((it) => (
                    <li key={it} className="flex gap-2"><span aria-hidden className="text-accent">&bull;</span>{it}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {d.careers && d.careers.length > 0 && (
            <section>
              <h2 className="font-display font-semibold text-xl text-brand-900 border-b-2 border-brand-700 pb-2">Career paths</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {d.careers.map((c) => (
                  <li key={c} className="bg-white border border-paper-line px-3 py-1.5 text-sm">{c}</li>
                ))}
              </ul>
            </section>
          )}

          {!edit?.body && content?.closing && (
            <p className="font-display text-lg text-brand-700 border-l-4 border-accent pl-4">{content.closing}</p>
          )}
        </div>

        {/* apply card */}
        <aside className="lg:sticky lg:top-44 self-start">
          <div className="bg-white border border-paper-line p-6">
            <h2 className="font-display font-semibold text-lg text-brand-900">Join {d.name}</h2>
            <p className="mt-2 text-sm text-steel leading-relaxed">
              Intakes run in January, May and September. Admissions confirms which programmes are open for your KCSE grade.
            </p>
            <Link href="/admissions" className="mt-5 block text-center bg-accent text-brand-900 font-semibold px-5 py-2.5 hover:bg-accent-dark transition-colors">
              Apply now
            </Link>
            <Link href="/downloads" className="mt-3 block text-center border border-brand-700 text-brand-700 font-medium px-5 py-2.5 hover:bg-brand-700 hover:text-white transition-colors">
              Fee structure
            </Link>
            <a href={`tel:${telHref(site.phone)}`} className="mt-4 block text-center text-sm text-steel hover:text-brand-700">Call {site.phone}</a>
          </div>
        </aside>
      </div>
    </>
  );
}
