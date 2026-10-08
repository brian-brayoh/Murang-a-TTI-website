// Custom pages created in /admin/pages are served here. Anything else is checked
// against old WordPress URLs (301) before returning 404. Real routes (/about,
// /blog ...) always win over this dynamic segment.
import type { Metadata } from "next";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import { findLegacyTarget, pageContent, parseJsonList } from "@/lib/repo";
import RichText from "@/components/RichText";
import UpdatedBy from "@/components/UpdatedBy";
import EditLink from "@/components/EditLink";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await pageContent.get(`page:${slug}`);
  if (!page || !page.published) return {};
  return { title: `${page.title} | Murang'a TTI`, description: page.tagline || undefined };
}

export default async function CustomOrLegacy({ params }: Props) {
  const { slug } = await params;
  const page = await pageContent.get(`page:${slug}`);
  if (page && page.published) {
    const images = parseJsonList<string>(page.images);
    const [hero, ...rest] = images;
    return (
      <>
        <section className="relative bg-brand-900 text-white overflow-hidden">
          {hero && <Image src={hero} alt="" fill priority sizes="100vw" className="object-cover opacity-30" />}
          <div className="absolute inset-0 blueprint-grid" aria-hidden />
          <div className="relative max-w-3xl mx-auto px-6 lg:px-10 py-14 lg:py-16">
            <h1 className="font-display font-semibold text-3xl md:text-4xl leading-tight">{page.title}</h1>
            {page.tagline && <p className="mt-3 text-brand-200 text-lg">{page.tagline}</p>}
            <EditLink href={`/admin/pages/custom/${slug}`} label="Edit this page" className="mt-4" />
          </div>
        </section>
        <article className="max-w-3xl mx-auto px-6 lg:px-10 py-12">
          <RichText body={page.body} />
          <UpdatedBy at={page.updated_at} by={page.updated_by} className="mt-8 pt-4 border-t border-paper-line" />
          {rest.length > 0 && (
            <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-3">
              {rest.map((u) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={u} src={u} alt="" loading="lazy" className="w-full aspect-[4/3] object-cover" />
              ))}
            </div>
          )}
        </article>
      </>
    );
  }
  const target = await findLegacyTarget(slug);
  if (target) permanentRedirect(target);
  notFound();
}
