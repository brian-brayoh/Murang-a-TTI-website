import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { posts, parseJsonList, type Attachment } from "@/lib/repo";
import RichText from "@/components/RichText";
import UpdatedBy from "@/components/UpdatedBy";
import EditLink from "@/components/EditLink";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await posts.getBySlug(slug);
  if (!post) return { title: "News | Murang'a TTI" };
  return { title: `${post.title} | Murang'a TTI`, description: post.excerpt };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = await posts.getBySlug(slug);
  if (!post) notFound();

  const images = parseJsonList<string>(post.images);
  const files = parseJsonList<Attachment>(post.attachments);
  // The cover image is shown at the top; the rest form a gallery below.
  const gallery = images.filter((u) => u !== post.image_url);

  return (
    <>
      <section className="bg-brand-900 text-white">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 py-14">
          <Link href="/blog" className="text-sm text-brand-200 hover:text-accent">
            &larr; All news
          </Link>
          <h1 className="mt-4 font-display font-semibold text-3xl md:text-4xl leading-tight">{post.title}</h1>
          <EditLink href={`/admin/posts/${post.id}`} label="Edit this post" className="mt-4" />
          <p className="mt-3 font-mono text-xs text-brand-200">
            {new Date(post.created_at).toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })} &middot; {post.author}
          </p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-6 lg:px-10 py-12">
        {post.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image_url} alt={post.title} className="w-full mb-8" />
        )}
        <RichText body={post.body} />
        <UpdatedBy at={post.updated_at} by={post.updated_by} className="mt-8 pt-4 border-t border-paper-line" />

        {files.length > 0 && (
          <div className="mt-10 border border-paper-line p-6">
            <h2 className="font-display font-semibold text-lg text-brand-700">Downloads</h2>
            <ul className="mt-3 space-y-2">
              {files.map((f) => (
                <li key={f.url}>
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand-700 hover:text-accent">
                    {f.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {gallery.length > 0 && (
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-3">
            {gallery.map((u) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={u} src={u} alt="" loading="lazy" className="w-full aspect-[4/3] object-cover" />
            ))}
          </div>
        )}
      </article>
    </>
  );
}
