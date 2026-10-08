import Link from "next/link";
import { posts } from "@/lib/repo";
import { togglePostAction, deletePostAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPosts() {
  const all = await posts.listAll();
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display font-semibold text-2xl">News posts</h1>
        <Link href="/admin/posts/new" className="bg-brand-700 text-white font-semibold px-5 py-2.5 hover:bg-brand-900">
          + New post
        </Link>
      </div>
      <p className="mt-1 text-sm text-steel">{all.length} posts. Click a title to edit its text, photos and downloads.</p>

      <div className="mt-6 divide-y divide-paper-line border-t border-b border-paper-line">
        {all.map((p) => (
          <div key={p.id} className="py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-12 w-16 shrink-0 bg-brand-900/5 overflow-hidden">
                {p.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0">
                <Link href={`/admin/posts/${p.id}`} className="font-medium hover:text-brand-700 line-clamp-1">{p.title}</Link>
                <p className="text-xs text-steel mt-0.5">
                  {p.author} &middot; {new Date(p.created_at).toLocaleDateString()} &middot; {p.published ? "Published" : "Draft"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/admin/posts/${p.id}`} className="text-xs border border-paper-line px-2.5 py-1.5 hover:border-brand-700">Edit</Link>
              <form action={togglePostAction}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="published" value={p.published ? "0" : "1"} />
                <button className="text-xs border border-paper-line px-2.5 py-1.5 hover:border-brand-700">{p.published ? "Unpublish" : "Publish"}</button>
              </form>
              <form action={deletePostAction}>
                <input type="hidden" name="id" value={p.id} />
                <button className="text-xs border border-paper-line px-2.5 py-1.5 hover:border-accent hover:text-accent">Delete</button>
              </form>
            </div>
          </div>
        ))}
        {all.length === 0 && <p className="py-6 text-sm text-steel">No posts yet.</p>}
      </div>
    </div>
  );
}
