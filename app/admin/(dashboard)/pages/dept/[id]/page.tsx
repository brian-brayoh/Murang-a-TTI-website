import Link from "next/link";
import { notFound } from "next/navigation";
import RichEditor from "@/components/RichEditor";
import { ImagesField } from "@/components/MediaPicker";
import { departments } from "@/lib/academics";
import { deptDefaultHtml } from "@/lib/dept-content";
import { parseJsonList, pageContent } from "@/lib/repo";
import { toHtml } from "@/lib/html";
import { saveDeptAction, resetDeptAction } from "../../actions";

export const dynamic = "force-dynamic";
const input = "mt-1 w-full border border-paper-line px-3 py-2 bg-white focus:outline-none focus:border-brand-700";

export default async function EditDept({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const d = departments.find((x) => x.id === id);
  if (!d) notFound();
  const row = await pageContent.get(`dept:${id}`);
  const html = row?.body ? toHtml(row.body) : deptDefaultHtml(id, d.blurb);
  return (
    <div>
      <Link href="/admin/pages" className="text-sm text-steel hover:text-brand-700">&larr; Pages</Link>
      <h1 className="mt-2 font-display font-semibold text-2xl">{d.name}</h1>
      <p className="text-sm text-steel">This is the writing and photo strip on <Link className="text-brand-700 underline" target="_blank" href={`/courses/${id}`}>/courses/{id}</Link>. Programmes are managed under Courses.</p>
      <form action={saveDeptAction} className="mt-6 space-y-5 max-w-3xl">
        <input type="hidden" name="id" value={id} />
        {saved && <p className="border border-brand-200 bg-brand-200/30 text-sm px-3 py-2">Saved.</p>}
        <div>
          <label className="text-sm text-steel">Tagline (under the department name)</label>
          <input name="tagline" defaultValue={row?.tagline || d.tagline} className={input} />
        </div>
        <div>
          <label className="text-sm text-steel mb-1 block">Writing</label>
          <RichEditor name="body" initialHtml={html} minHeight="22rem" />
        </div>
        <ImagesField name="images" label="Photos (the first is the banner)" defaultValue={row ? parseJsonList<string>(row.images) : []} />
        <p className="text-xs text-steel">If you add no photos here, the department keeps its original photos.</p>
        <button className="bg-brand-700 text-white font-semibold px-6 py-2.5 hover:bg-brand-900">Save</button>
      </form>
      {row && (
        <form action={resetDeptAction} className="mt-6">
          <input type="hidden" name="id" value={id} />
          <button className="text-xs text-steel hover:text-accent underline">Discard my edits and use the original text</button>
        </form>
      )}
    </div>
  );
}
