import Link from "next/link";
import RichEditor from "@/components/RichEditor";
import { ImagesField } from "@/components/MediaPicker";
import { parseJsonList, type PageContent } from "@/lib/repo";
import { toHtml } from "@/lib/html";
import { saveCustomAction } from "./actions";

const input = "mt-1 w-full border border-paper-line px-3 py-2 bg-white focus:outline-none focus:border-brand-700";

export default function CustomForm({ row, error, saved }: { row?: PageContent; error?: string; saved?: boolean }) {
  const slug = row?.key.slice(5) || "";
  return (
    <form action={saveCustomAction} className="mt-6 grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-8 items-start">
      <input type="hidden" name="original" value={slug} />
      <div className="space-y-5 min-w-0">
        {error && <p className="border border-accent bg-accent/10 text-sm px-3 py-2">{error}</p>}
        {saved && <p className="border border-brand-200 bg-brand-200/30 text-sm px-3 py-2">Saved.</p>}
        <div>
          <label className="text-sm text-steel">Title</label>
          <input name="title" required defaultValue={row?.title} className={`${input} text-lg font-display`} />
        </div>
        <div>
          <label className="text-sm text-steel mb-1 block">Content</label>
          <RichEditor name="body" initialHtml={row ? toHtml(row.body) : ""} minHeight="24rem" />
        </div>
      </div>
      <aside className="space-y-5 border border-paper-line bg-paper p-5 lg:sticky lg:top-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="published" defaultChecked={row ? row.published : true} className="h-4 w-4 accent-[#8f3540]" />
          Published
        </label>
        <button className="w-full bg-brand-700 text-white font-semibold px-5 py-2.5 hover:bg-brand-900">{row ? "Save changes" : "Create page"}</button>
        {row && <Link href={`/${slug}`} target="_blank" className="block text-center text-sm text-brand-700">View page ↗</Link>}
        <div>
          <label className="text-sm text-steel">Web address</label>
          <div className="mt-1 flex items-center border border-paper-line bg-white">
            <span className="pl-3 text-steel text-sm">/</span>
            <input name="slug" defaultValue={slug} placeholder="auto from title" className="flex-1 min-w-0 px-1 py-2 focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="text-sm text-steel">Intro line (optional)</label>
          <input name="tagline" defaultValue={row?.tagline} className={input} />
        </div>
        <ImagesField name="images" label="Photos (the first is the banner)" defaultValue={row ? parseJsonList<string>(row.images) : []} />
      </aside>
    </form>
  );
}
