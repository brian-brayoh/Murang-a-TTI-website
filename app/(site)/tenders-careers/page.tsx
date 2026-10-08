import type { Metadata } from "next";
import HeroBackdrop from "@/components/HeroBackdrop";
import Link from "next/link";
import { tenders, jobs } from "@/lib/repo";
import { getSite } from "@/lib/site-details";
import { telHref } from "@/lib/contact-links";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tenders & Careers | Murang'a TTI",
};

type Row = { id: string; title: string; status: string; attachment_url?: string | null; created_at: string | Date };

function isClosed(status: string) {
  return /clos|expir|award|filled|cancel/i.test(status);
}

function List({ rows, noun, phone }: { rows: Row[]; noun: string; phone: string }) {
  if (rows.length === 0) {
    return (
      <p className="border border-paper-line bg-white p-6 text-steel">
        There are no {noun} at the moment. Please check back soon, or{" "}
        <Link href="/contact" className="font-medium text-brand-700 underline">contact the institute</Link>.
      </p>
    );
  }
  return (
    <ul className="space-y-3">
      {rows.map((r) => {
        const closed = isClosed(r.status);
        return (
          <li key={r.id} className="bg-white border border-paper-line border-l-4 border-l-brand-700 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${closed ? "bg-paper-line text-steel" : "bg-accent text-brand-900"}`}>
                  {r.status || "Open"}
                </span>
                <span className="font-mono text-xs text-steel">
                  Posted {new Date(r.created_at).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" })}
                </span>
              </div>
              <h3 className="mt-2 font-display font-semibold text-lg leading-snug text-brand-900">{r.title}</h3>
            </div>
            {r.attachment_url ? (
              <a
                href={r.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-center bg-brand-700 text-white font-semibold px-5 py-2.5 hover:bg-brand-900 transition-colors"
              >
                Open details (PDF) &darr;
              </a>
            ) : (
              <a href={`tel:${telHref(phone)}`} className="shrink-0 text-center border border-brand-700 text-brand-700 font-medium px-5 py-2.5 hover:bg-brand-700 hover:text-white transition-colors">
                Ask the office
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default async function TendersCareers() {
  const [allTenders, allJobs, site] = await Promise.all([tenders.listAll(), jobs.listAll(), getSite()]);
  const tendersOpen = allTenders.filter((t) => !isClosed(t.status)).length;
  const jobsOpen = allJobs.filter((j) => !isClosed(j.status)).length;
  return (
    <>
      <section className="relative bg-brand-900 text-white overflow-hidden">
        <HeroBackdrop id="tenders" />
        <div className="relative max-w-6xl mx-auto px-6 lg:px-10 py-16">
          <p className="tick text-accent font-mono text-sm">Tenders &amp; careers</p>
          <h1 className="mt-3 font-display font-semibold text-4xl max-w-2xl">
            Work with &amp; supply the institute
          </h1>
          <p className="mt-4 text-brand-200 max-w-xl leading-relaxed">
            Tender notices and job vacancies are listed below. Press <strong className="text-white">Open details</strong> on any item to read the full notice, requirements and how to apply.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 font-mono text-xs">
            <a href="#tenders" className="bg-white/10 px-3 py-1.5 hover:bg-white/20">{tendersOpen} open tender{tendersOpen === 1 ? "" : "s"} &darr;</a>
            <a href="#careers" className="bg-white/10 px-3 py-1.5 hover:bg-white/20">{jobsOpen} open vacanc{jobsOpen === 1 ? "y" : "ies"} &darr;</a>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-16 space-y-14">
        <div id="tenders" className="scroll-mt-32">
          <h2 className="font-display font-semibold text-2xl text-brand-700 mb-6">Tenders</h2>
          <List rows={allTenders as Row[]} noun="tenders" phone={site.phone} />
        </div>

        <div id="careers" className="scroll-mt-32">
          <h2 className="font-display font-semibold text-2xl text-brand-700 mb-6">Careers and vacancies</h2>
          <List rows={allJobs as Row[]} noun="vacancies" phone={site.phone} />
        </div>

        <p className="text-sm text-steel">
          Questions about a notice? Call <a className="font-medium text-brand-700" href={`tel:${telHref(site.phone)}`}>{site.phone}</a> or email{" "}
          <a className="font-medium text-brand-700" href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </section>
    </>
  );
}
