import type { Metadata } from "next";
import HeroBackdrop from "@/components/HeroBackdrop";
import Link from "next/link";
import { courses } from "@/lib/repo";
import { COURSE_DEPARTMENTS } from "@/lib/departments";
import CourseExplorer from "@/components/CourseExplorer";
import { departments as academicDepts } from "@/lib/academics";

export const metadata: Metadata = {
  title: "Courses | Murang'a TTI",
  description:
    "Browse Murang'a Technical Training Institute programmes by department and level: Artisan (Level 4), Craft (Level 5) and Diploma (Level 6).",
};

export const dynamic = "force-dynamic";

export default async function Courses() {
  const list = await courses.listPublished();
  const deptInfo = Object.fromEntries(
    academicDepts.map((d) => [
      d.name,
      { id: d.id, tagline: d.tagline, blurb: d.blurb, image: d.image || "", imageCaption: d.imageCaption || "", careers: d.careers || [], highlights: d.highlights || [], highlightsLabel: d.highlightsLabel || "" },
    ])
  );

  return (
    <>
      <section className="relative bg-brand-900 text-white overflow-hidden">
        <HeroBackdrop id="courses" />
        <div className="absolute inset-0 blueprint-grid" aria-hidden />
        <div className="relative max-w-6xl mx-auto px-6 lg:px-10 py-14 lg:py-16">
          <p className="tick text-accent font-mono text-sm">Courses</p>
          <h1 className="mt-3 font-display font-semibold text-4xl sm:text-5xl leading-[1.08] max-w-2xl">
            Find the programme that fits your future.
          </h1>
          <p className="mt-4 text-brand-200 text-lg max-w-xl leading-relaxed">
            Filter by department or level, then tap a programme to see how long it
            takes, what you need to join and how to apply.
          </p>
        </div>
      </section>

      {list.length > 0 ? (
        <CourseExplorer courses={list} departments={[...COURSE_DEPARTMENTS]} deptInfo={deptInfo} />
      ) : (
        <section className="max-w-6xl mx-auto px-6 lg:px-10 py-16 text-steel">
          Programme listings are being updated. Please contact admissions.
        </section>
      )}

      <section className="max-w-6xl mx-auto px-6 lg:px-10 pb-16">
        <div className="border border-paper-line bg-white p-6 sm:p-8 grid sm:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <h2 className="font-display font-semibold text-xl">
              Check entry requirements and fees before you apply
            </h2>
            <p className="mt-1 text-sm text-steel max-w-xl">
              Requirements differ by programme and intake. The admissions
              office confirms what is open to your KCSE grade, and the fee
              structure is in Downloads.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/downloads"
              className="border border-brand-700 text-brand-700 font-medium px-5 py-2.5 hover:bg-brand-700 hover:text-white transition-colors"
            >
              Fee structure
            </Link>
            <Link
              href="/admissions"
              className="bg-accent text-brand-900 font-semibold px-5 py-2.5 hover:bg-accent-dark transition-colors"
            >
              Apply now
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
