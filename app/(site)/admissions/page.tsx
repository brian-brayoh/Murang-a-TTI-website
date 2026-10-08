import type { Metadata } from "next";
import HeroBackdrop from "@/components/HeroBackdrop";
import Link from "next/link";
import { redirect } from "next/navigation";
import { applications } from "@/lib/repo";
import { getSite } from "@/lib/site-details";
import { waHref } from "@/lib/contact-links";
import { COURSE_DEPARTMENTS, LEVELS } from "@/lib/departments";

export const metadata: Metadata = {
  title: "Admissions | Murang'a TTI",
};

const steps = [
  {
    title: "Choose your department",
    desc: "Review the seven departments and pick the programme and level that fits your goals.",
  },
  {
    title: "Submit your application",
    desc: "Apply below, or in person with your academic certificates and a copy of your ID.",
  },
  {
    title: "Get your admission letter",
    desc: "Admission decisions and fee structure are sent within 3 working days of a complete application.",
  },
  {
    title: "Report and register",
    desc: "Report on your intake date with the admission letter, fees, and required documents.",
  },
];

async function submitApplication(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const department = String(formData.get("department") || "");
  const level = Number(formData.get("level"));
  const message = String(formData.get("message") || "").trim();

  if (!name || !email || !department || !level) {
    redirect("/admissions?error=1");
  }
  await applications.create({ name, email, phone, department, level, message });
  redirect("/admissions?applied=1");
}

export default async function Admissions({
  searchParams,
}: {
  searchParams: Promise<{ applied?: string; error?: string }>;
}) {
  const { applied, error } = await searchParams;
  const site = await getSite();

  return (
    <>
      <section className="relative bg-brand-900 text-white overflow-hidden">
        <HeroBackdrop id="admissions" />
        <div className="relative max-w-6xl mx-auto px-6 lg:px-10 py-16">
          <p className="tick text-accent font-mono text-sm">Admissions</p>
          <h1 className="mt-3 font-display font-semibold text-4xl max-w-2xl">
            {site.admissionsHeadline}
          </h1>
          <p className="mt-4 text-brand-200 max-w-xl">{site.admissionsIntro}</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid md:grid-cols-2 gap-x-10 gap-y-10">
          {steps.map((s, i) => (
            <div key={s.title} className="flex gap-5">
              <span className="font-mono text-accent-dark text-sm pt-1">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display font-semibold text-lg">{s.title}</h3>
                <p className="mt-1.5 text-sm text-steel leading-relaxed max-w-sm">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* application form */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 pb-16">
        <div className="border border-paper-line p-6 sm:p-8">
          <h2 className="font-display font-semibold text-2xl">Apply online</h2>
          <p className="mt-1 text-sm text-steel max-w-xl">
            Send your details and we&apos;ll follow up with the next steps
            and fee information for your chosen programme.
          </p>

          {applied && (
            <p className="mt-6 text-sm bg-brand-700/10 border border-brand-700 text-brand-700 px-4 py-2.5">
              Application received. Admissions will contact you within 3 working days.
            </p>
          )}
          {error && (
            <p className="mt-6 text-sm bg-accent/10 border border-accent text-accent-dark px-4 py-2.5">
              Please fill in your name, email, department and level.
            </p>
          )}

          <form action={submitApplication} className="mt-6 grid sm:grid-cols-2 gap-5 max-w-2xl">
            <div>
              <label className="text-sm font-medium text-steel" htmlFor="name">Full name</label>
              <input id="name" name="name" required
                className="mt-1.5 w-full border border-paper-line px-4 py-2.5 bg-paper focus:outline-none focus:border-brand-700" />
            </div>
            <div>
              <label className="text-sm font-medium text-steel" htmlFor="phone">Phone</label>
              <input id="phone" name="phone"
                className="mt-1.5 w-full border border-paper-line px-4 py-2.5 bg-paper focus:outline-none focus:border-brand-700" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-steel" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required
                className="mt-1.5 w-full border border-paper-line px-4 py-2.5 bg-paper focus:outline-none focus:border-brand-700" />
            </div>
            <div>
              <label className="text-sm font-medium text-steel" htmlFor="department">Department</label>
              <select id="department" name="department" required
                className="mt-1.5 w-full border border-paper-line px-4 py-2.5 bg-paper focus:outline-none focus:border-brand-700">
                <option value="">Select a department</option>
                {COURSE_DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-steel" htmlFor="level">Level</label>
              <select id="level" name="level" required defaultValue=""
                className="mt-1.5 w-full border border-paper-line px-4 py-2.5 bg-paper focus:outline-none focus:border-brand-700">
                <option value="" disabled>Select a level</option>
                {LEVELS.map((l) => (
                  <option key={l.level} value={l.level}>Level {l.level} ({l.award})</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-steel" htmlFor="message">Anything else? (optional)</label>
              <textarea id="message" name="message" rows={3}
                className="mt-1.5 w-full border border-paper-line px-4 py-2.5 bg-paper focus:outline-none focus:border-brand-700" />
            </div>
            <button type="submit"
              className="sm:col-span-2 bg-accent text-brand-900 font-semibold px-6 py-3 hover:bg-accent-dark hover:text-white transition-colors">
              Submit application
            </button>
          </form>
        </div>

        <div className="mt-8 border border-paper-line p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display font-semibold text-xl">
              Prefer to talk first?
            </h3>
            <p className="mt-1 text-sm text-steel">
              Reach the admissions office directly, or message us on WhatsApp.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <a
              href={waHref(site.whatsapp, "Hello MTTI, I want to apply")}
              className="border border-brand-700 text-brand-700 font-medium px-5 py-2.5 hover:bg-brand-700 hover:text-white transition-colors"
            >
              WhatsApp us
            </a>
            <Link
              href="/contact"
              className="bg-accent text-brand-900 font-semibold px-5 py-2.5 hover:bg-accent-dark hover:text-white transition-colors"
            >
              Contact admissions
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
