import Link from "next/link";
import { posts, settings } from "@/lib/repo";
import HeroSlider from "@/components/HeroSlider";
import { getHome } from "@/lib/home";

export const dynamic = "force-dynamic";

const departments = [
  {
    name: "Agriculture",
    level: "L4\u2013L6",
    blurb: "Agripreneurship, crop and livestock production for a working farm economy.",
  },
  {
    name: "Business & Entrepreneurship",
    level: "L4\u2013L6",
    blurb: "Accounting, supply chain and business management for self-reliant enterprise.",
  },
  {
    name: "Building & Civil",
    level: "L4\u2013L6",
    blurb: "Masonry, carpentry and construction trades trained on live workshop projects.",
  },
  {
    name: "Electrical & Electronics",
    level: "L4\u2013L6",
    blurb: "Installation, wiring and electronics practice on industry-standard rigs.",
  },
  {
    name: "Hospitality Management",
    level: "L4\u2013L5",
    blurb: "Food production, service and institutional management skills.",
  },
  {
    name: "ICT & Informatics",
    level: "L4\u2013L6",
    blurb: "Computing, networking and digital skills for a connected economy.",
  },
  {
    name: "Mechanical Engineering",
    level: "L4\u2013L6",
    blurb: "Automotive and machining practice in fully equipped workshops.",
  },
];

export default async function Home() {
  const home = await getHome();
  const news = (await posts.listPublished()).slice(0, 3);
  const s = await settings.getAll();
  const sec = home.sections;
  const stats = [
    { value: s.courses_on_offer, label: "Courses on offer" },
    { value: s.trainees, label: "Trainees" },
    { value: s.trainers, label: "Trainers" },
    { value: s.departments, label: "Departments" },
  ];
  return (
    <>
      {/* intake banner (editable under Admin > Home page) */}
      {home.banner.show && home.banner.text && (
        <div className="bg-accent text-brand-900 text-sm font-medium text-center py-2 px-4">
          {home.banner.text}
          {home.banner.linkText && (
            <>
              {" "}
              <Link href={home.banner.href || "/admissions"} className="underline underline-offset-2">
                {home.banner.linkText}
              </Link>
            </>
          )}
        </div>
      )}

      <HeroSlider slides={home.slides} />

      {/* mission / vision / values — asymmetric, not card-soup */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-20">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-12">
          <div>
            <p className="tick text-accent font-mono text-sm">Who we are</p>
            <h2 className="mt-3 font-display font-semibold text-3xl leading-tight">
              {sec.whoHeadline}
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 border-t border-paper-line pt-8">
            <div>
              <h3 className="font-display font-semibold text-brand-700">Mission</h3>
              <p className="mt-2 text-sm text-steel leading-relaxed">
                {sec.mission}
              </p>
            </div>
            <div>
              <h3 className="font-display font-semibold text-brand-700">Vision</h3>
              <p className="mt-2 text-sm text-steel leading-relaxed">
                {sec.vision}
              </p>
            </div>
            <div>
              <h3 className="font-display font-semibold text-brand-700">Values</h3>
              <p className="mt-2 text-sm text-steel leading-relaxed">
                {sec.values}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* stats */}
      <section className="bg-brand-800 text-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-mono text-3xl sm:text-4xl text-accent">{s.value}</p>
              <p className="mt-1 text-sm text-brand-200">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* departments grid */}
      <section id="departments" className="max-w-6xl mx-auto px-6 lg:px-10 py-20">
        <p className="tick text-accent font-mono text-sm">Academic departments</p>
        <h2 className="mt-3 font-display font-semibold text-3xl max-w-xl">
          {sec.deptHeading}
        </h2>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-paper-line border border-paper-line">
          {departments.map((d) => (
            <div
              key={d.name}
              className="group bg-paper p-6 hover:bg-white transition-colors relative"
            >
              <span className="absolute top-0 left-0 h-0.5 w-0 bg-accent group-hover:w-full transition-all duration-300" />
              <div className="flex items-baseline justify-between">
                <h3 className="font-display font-semibold text-brand-700">
                  {d.name}
                </h3>
                <span className="font-mono text-xs text-steel">{d.level}</span>
              </div>
              <p className="mt-2.5 text-sm text-steel leading-relaxed">{d.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      {/* service charter style commitment section */}
      <section className="bg-brand-900 text-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="tick text-accent font-mono text-sm">Our commitment</p>
            <h2 className="mt-3 font-display font-semibold text-3xl leading-tight">
              {sec.charterHeadline}
            </h2>
            <p className="mt-5 text-brand-200 leading-relaxed max-w-lg">{sec.charterText}</p>
          </div>
          <div className="border border-white/15 divide-y divide-white/15 font-mono text-sm">
            {sec.charter.map((r) => (
              <div key={r.label} className="p-5 flex justify-between gap-4">
                <span>{r.label}</span>
                <span className="text-accent text-right">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* news */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-20">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="tick text-accent font-mono text-sm">Latest</p>
            <h2 className="mt-3 font-display font-semibold text-3xl">From the institute</h2>
          </div>
          <Link href="/blog" className="text-sm font-medium text-brand-700 hover:text-accent">
            All news &rarr;
          </Link>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-8">
          {news.map((n) => (
            <article key={n.id} className="border-t-2 border-brand-700 pt-4">
              <p className="font-mono text-xs text-steel">{new Date(n.created_at).toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}</p>
              <h3 className="mt-2 font-display font-semibold text-lg leading-snug">
                <Link href={`/blog/${n.slug}`} className="hover:text-brand-700">{n.title}</Link>
              </h3>
              <p className="mt-2 text-sm text-steel leading-relaxed">{n.excerpt}</p>
            </article>
          ))}
        </div>
      </section>

      {/* cta */}
      <section className="bg-accent">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-14 flex flex-col sm:flex-row items-center justify-between gap-6 text-brand-900">
          <h2 className="font-display font-semibold text-2xl sm:text-3xl text-center sm:text-left">
            {sec.ctaHeadline}
          </h2>
          <Link
            href="/admissions"
            className="bg-brand-900 text-white font-semibold px-7 py-3.5 hover:bg-brand-800 transition-colors shrink-0"
          >
            {sec.ctaButton}
          </Link>
        </div>
      </section>
    </>
  );
}
