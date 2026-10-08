import Link from "next/link";
import RichEditor from "@/components/RichEditor";
import { ImageField, FilesField } from "@/components/MediaPicker";
import { parseJsonList, type Attachment, type Post } from "@/lib/repo";
import { toHtml } from "@/lib/html";

const input = "mt-1 w-full border border-paper-line px-3 py-2 bg-white focus:outline-none focus:border-brand-700";

export default function PostForm({ post, action, error, saved }: { post?: Post; action: (f: FormData) => Promise<void>; error?: string; saved?: boolean }) {
  const date = post ? new Date(post.created_at).toISOString().slice(0, 10) : "";
  return (
    <form action={action} className="mt-6 grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-8 items-start">
      {post && <input type="hidden" name="id" value={post.id} />}
      <div className="space-y-5 min-w-0">
        {error && <p className="border border-accent bg-accent/10 text-sm px-3 py-2">{error}</p>}
        {saved && <p className="border border-brand-200 bg-brand-200/30 text-sm px-3 py-2">Saved.</p>}
        <div>
          <label className="text-sm text-steel">Title</label>
          <input name="title" required defaultValue={post?.title} className={`${input} text-lg font-display`} />
        </div>
        <div>
          <label className="text-sm text-steel mb-1 block">Content</label>
          <RichEditor name="body" initialHtml={post ? toHtml(post.body) : ""} />
        </div>
        <div>
          <label className="text-sm text-steel">Short summary (shown on the news list; leave empty to use the first lines)</label>
          <textarea name="excerpt" rows={2} defaultValue={post?.excerpt} className={input} />
        </div>
      </div>

      <aside className="space-y-5 border border-paper-line bg-paper p-5 lg:sticky lg:top-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="published" defaultChecked={post ? post.published : true} className="h-4 w-4 accent-[#8f3540]" />
          Published (visible on the website)
        </label>
        <button className="w-full bg-brand-700 text-white font-semibold px-5 py-2.5 hover:bg-brand-900">{post ? "Save changes" : "Publish post"}</button>
        {post && (
          <Link href={`/blog/${post.slug}`} target="_blank" className="block text-center text-sm text-brand-700 hover:text-accent-dark">
            View on website ↗
          </Link>
        )}
        <ImageField name="imageUrl" label="Cover image" defaultValue={post?.image_url} />
        <FilesField name="attachments" label="Downloads (PDF, Word, Excel...)" defaultValue={post ? parseJsonList<Attachment>(post.attachments) : []} />
        <div>
          <label className="text-sm text-steel">Author</label>
          <input name="author" defaultValue={post?.author || "The Registrar"} className={input} />
        </div>
        <div>
          <label className="text-sm text-steel">Date</label>
          <input type="date" name="date" defaultValue={date} className={input} />
        </div>
        <div>
          <label className="text-sm text-steel">Web address ending</label>
          <input name="slug" defaultValue={post?.slug} placeholder="auto from title" className={input} />
        </div>
      </aside>
    </form>
  );
}
