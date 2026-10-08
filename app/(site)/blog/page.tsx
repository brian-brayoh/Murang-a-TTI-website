import type { Metadata } from "next";
import HeroBackdrop from "@/components/HeroBackdrop";
import Link from "next/link";
import { posts, parseJsonList, type Attachment } from "@/lib/repo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News | Murang'a TTI",
};


export default async function Blog() {
  const items = await posts.listPublished();
  return (
    <>
      <section className="relative bg-brand-900 text-white overflow-hidden">
        <HeroBackdrop id="news" />
        <div className="relative max-w-6xl mx-auto px-6 lg:px-10 py-16">
          <p className="tick text-accent font-mono text-sm">News</p>
          <h1 className="mt-3 font-display font-semibold text-4xl max-w-2xl">
            From the institute
          </h1>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid md:grid-cols-2 gap-x-10 gap-y-12">
          {items.map((p) => (
            <article key={p.id} className="border-t-2 border-brand-700 pt-4">
              {p.image_url && (
                <Link href={`/blog/${p.slug}`} className="block mb-4 overflow-hidden bg-paper-line aspect-[16/10]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image_url} alt="" loading="lazy" className="w-full h-full object-cover" />
                </Link>
              )}
              <p className="font-mono text-xs text-steel">
                {new Date(p.created_at).toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })} &middot; {p.author}
              </p>
              <h2 className="mt-2 font-display font-semibold text-xl leading-snug">
                <Link href={`/blog/${p.slug}`} className="hover:text-accent">{p.title}</Link>
              </h2>
              <p className="mt-2 text-sm text-steel leading-relaxed">{p.excerpt}</p>
              <div className="mt-3 flex items-center gap-4 text-sm">
                <Link href={`/blog/${p.slug}`} className="font-semibold text-brand-700 hover:text-accent">Read more</Link>
                {parseJsonList<Attachment>(p.attachments).length > 0 && (
                  <span className="font-mono text-xs text-accent">Includes download</span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
