import type { Metadata } from "next";
import HeroBackdrop from "@/components/HeroBackdrop";
import Link from "next/link";
import { timetables, notices, noticeFiles } from "@/lib/repo";
import NoticeBoard, { type BoardNotice } from "@/components/NoticeBoard";
import { renderBody } from "@/lib/html";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Students E-NOTICE | Murang'a TTI",
};

export default async function ENotice() {
  const tt = await timetables.listAll();
  const rows = await notices.listPublished();
  const signedIn = !!(await auth().catch(() => null))?.user;
  const items: BoardNotice[] = rows.map((n) => {
    const html = renderBody(n.body);
    const text = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    return {
      id: n.id,
      title: n.title,
      date: new Date(n.created_at).toISOString(),
      image: n.image_url || "",
      files: noticeFiles(n),
      html,
      excerpt: text.length > 170 ? text.slice(0, 170).replace(/\s+\S*$/, "") + "\u2026" : text,
      editHref: signedIn ? `/admin/notices/${n.id}` : undefined,
    };
  });
  // group timetables by department
  const byDept = new Map<string, typeof tt>();
  for (const t of tt) byDept.set(t.department, [...(byDept.get(t.department) || []), t]);
  return (
    <>
      <section className="relative bg-brand-900 text-white overflow-hidden">
        <HeroBackdrop id="enotice" />
        <div className="relative max-w-6xl mx-auto px-6 lg:px-10 py-16">
          <p className="tick text-accent font-mono text-sm">Students E-NOTICE</p>
          <h1 className="mt-3 font-display font-semibold text-4xl max-w-2xl">
            Exam timetables &amp; notices
          </h1>
          <p className="mt-4 text-brand-200 max-w-xl leading-relaxed">Everything trainees need to know, in one place. Newest first. Open any notice to read it in full and download its documents.</p>
          <div className="mt-6 flex flex-wrap gap-3 font-mono text-xs">
            <a href="#notices" className="bg-white/10 px-3 py-1.5 hover:bg-white/20">{items.length} notices &darr;</a>
            <a href="#timetables" className="bg-white/10 px-3 py-1.5 hover:bg-white/20">{tt.length} exam timetables &darr;</a>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-16 space-y-16">
        <div id="notices" className="scroll-mt-32">
          <h2 className="font-display font-semibold text-2xl text-brand-700 mb-6">Notices</h2>
          <NoticeBoard items={items} />
        </div>

        <div id="timetables" className="scroll-mt-32">
          <h2 className="font-display font-semibold text-2xl text-brand-700 mb-6">Exam timetables</h2>
          {tt.length === 0 ? (
            <p className="border border-paper-line bg-white p-6 text-steel">No timetables are posted right now. Check back soon.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...byDept.entries()].map(([dept, rowsT]) => (
                <div key={dept} className="bg-white border border-paper-line border-t-4 border-t-brand-700">
                  <h3 className="px-5 pt-4 font-display font-semibold text-brand-900">{dept}</h3>
                  <ul className="mt-2 divide-y divide-paper-line">
                    {rowsT.map((t) => (
                      <li key={t.level + t.date_range} className="px-5 py-3 flex items-center justify-between gap-3">
                        <span className="font-mono text-xs text-steel">{t.level}</span>
                        <span className="font-mono text-xs bg-accent/20 text-accent-dark px-2 py-0.5 text-right">{t.date_range}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border border-paper-line p-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-steel">
            Looking for the students&apos; leadership body?
          </p>
          <Link
            href="/students-council"
            className="text-sm font-semibold text-brand-700 hover:text-accent"
          >
            Students&apos; Council &rarr;
          </Link>
        </div>
      </section>
    </>
  );
}
