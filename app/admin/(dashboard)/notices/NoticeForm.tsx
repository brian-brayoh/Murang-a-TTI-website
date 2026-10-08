import Link from "next/link";
import RichEditor from "@/components/RichEditor";
import { ImageField, FilesField } from "@/components/MediaPicker";
import { noticeFiles, type Notice } from "@/lib/repo";
import { toHtml } from "@/lib/html";

const input = "mt-1 w-full border border-paper-line px-3 py-2 bg-white focus:outline-none focus:border-brand-700";

export default function NoticeForm({ notice, action, error, saved }: { notice?: Notice; action: (f: FormData) => Promise<void>; error?: string; saved?: boolean }) {
  const date = notice ? new Date(notice.created_at).toISOString().slice(0, 10) : "";
  const files = notice
    ? noticeFiles(notice).map((f) => ({
        ...f,
        label: f.label || decodeURIComponent(f.url.split("/").pop() || "Download").replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " "),
      }))
    : [];
  return (
    <form action={action} className="mt-6 grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-8 items-start">
      {notice && <input type="hidden" name="id" value={notice.id} />}
      <div className="space-y-5 min-w-0">
        {error && <p className="border border-accent bg-accent/10 text-sm px-3 py-2">{error}</p>}
        {saved && <p className="border border-brand-200 bg-brand-200/30 text-sm px-3 py-2">Saved.</p>}
        <div>
          <label className="text-sm text-steel">Title</label>
          <input name="title" required defaultValue={notice?.title} className={`${input} text-lg font-display`} />
        </div>
        <div>
          <label className="text-sm text-steel mb-1 block">Notice text</label>
          <RichEditor name="body" initialHtml={notice ? toHtml(notice.body) : ""} minHeight="14rem" />
        </div>
      </div>
      <aside className="space-y-5 border border-paper-line bg-paper p-5 lg:sticky lg:top-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="published" defaultChecked={notice ? notice.published : true} className="h-4 w-4 accent-[#8f3540]" />
          Published (visible on E-NOTICE)
        </label>
        <button className="w-full bg-brand-700 text-white font-semibold px-5 py-2.5 hover:bg-brand-900">{notice ? "Save changes" : "Post notice"}</button>
        {notice && <Link href="/e-notice" target="_blank" className="block text-center text-sm text-brand-700 hover:text-accent-dark">View E-NOTICE ↗</Link>}
        <ImageField name="imageUrl" label="Notice image / poster" defaultValue={notice?.image_url} />
        <FilesField name="attachments" label="Files (PDF, Word, Excel...)" defaultValue={files} />
        <div>
          <label className="text-sm text-steel">Date</label>
          <input type="date" name="date" defaultValue={date} className={input} />
        </div>
      </aside>
    </form>
  );
}
