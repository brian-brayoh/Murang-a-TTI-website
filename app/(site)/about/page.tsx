import type { Metadata } from "next";
import HeroBackdrop from "@/components/HeroBackdrop";
import { pageContent } from "@/lib/repo";
import { getSite } from "@/lib/site-details";
import { BUILTIN } from "@/lib/builtin-pages";
import RichText from "@/components/RichText";
import EditLink from "@/components/EditLink";
import UpdatedBy from "@/components/UpdatedBy";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About | Murang'a TTI",
};

export default async function About() {
  const [row, site] = await Promise.all([pageContent.get("builtin:about"), getSite()]);
  const b = BUILTIN.about;
  return (
    <>
      <section className="relative bg-brand-900 text-white overflow-hidden">
        <HeroBackdrop id="about" />
        <div className="relative max-w-6xl mx-auto px-6 lg:px-10 py-16">
          <p className="tick text-accent font-mono text-sm">About us</p>
          <h1 className="mt-3 font-display font-semibold text-4xl max-w-2xl">
            {row?.title || b.heading}
          </h1>
          <EditLink href="/admin/pages/builtin/about" label="Edit this page" className="mt-4" />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-16 grid lg:grid-cols-[1fr_1.2fr] gap-14">
        <div className="space-y-6 font-mono text-sm text-steel">
          <div className="border border-paper-line p-5">
            <p className="text-brand-700 font-semibold">Location</p>
            <p className="mt-1">{site.address}</p>
          </div>
          <div className="border border-paper-line p-5">
            <p className="text-brand-700 font-semibold">Governance</p>
            <p className="mt-1">{site.governance}</p>
          </div>
          <div className="border border-paper-line p-5">
            <p className="text-brand-700 font-semibold">Leadership</p>
            <p className="mt-1">{site.leadership}</p>
          </div>
        </div>

        <div>
          <RichText body={row?.body || b.html} className="space-y-5 text-ink leading-relaxed" />
          {row && <UpdatedBy at={row.updated_at} by={row.updated_by} className="mt-6" />}
        </div>
      </section>
    </>
  );
}
