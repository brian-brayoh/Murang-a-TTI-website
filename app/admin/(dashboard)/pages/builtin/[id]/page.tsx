import Link from "next/link";
import { notFound } from "next/navigation";
import RichEditor from "@/components/RichEditor";
import UpdatedBy from "@/components/UpdatedBy";
import { pageContent } from "@/lib/repo";
import { toHtml } from "@/lib/html";
import { BUILTIN } from "@/lib/builtin-pages";
import { saveBuiltinAction, resetBuiltinAction } from "../../actions";

export const dynamic = "force-dynamic";
const input = "mt-1 w-full border border-paper-line px-3 py-2 bg-white focus:outline-none focus:border-brand-700";

export default async function EditBuiltin({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const b = BUILTIN[id];
  if (!b) notFound();
  const row = await pageContent.get(`builtin:${id}`);
  return (
    <div>
      <Link href="/admin/pages" className="text-sm text-steel hover:text-brand-700">&larr; Pages</Link>
      <h1 className="mt-2 font-display font-semibold text-2xl">{b.name}</h1>
      <p className="text-sm text-steel">
        The heading and writing on <Link className="text-brand-700 underline" target="_blank" href={b.path}>{b.path}</Link>.
        {id === "about" && " The three cards (location, governance, leadership) are under Site details."}
        {id === "students-council" && " Office bearers are added under Staff, in the Students' Council department."}
      </p>
      {row && <UpdatedBy at={row.updated_at} by={row.updated_by} className="mt-3" />}
      <form action={saveBuiltinAction} className="mt-6 space-y-5 max-w-3xl">
        <input type="hidden" name="id" value={id} />
        {saved && <p className="border border-brand-200 bg-brand-200/30 text-sm px-3 py-2">Saved.</p>}
        <div>
          <label className="text-sm text-steel">Heading</label>
          <input name="title" defaultValue={row?.title || b.heading} className={input} />
        </div>
        <div>
          <label className="text-sm text-steel mb-1 block">Writing</label>
          <RichEditor name="body" initialHtml={row?.body ? toHtml(row.body) : b.html} minHeight="20rem" />
        </div>
        <button className="bg-brand-700 text-white font-semibold px-6 py-2.5 hover:bg-brand-900">Save</button>
      </form>
      {row && (
        <form action={resetBuiltinAction} className="mt-6">
          <input type="hidden" name="id" value={id} />
          <button className="text-xs text-steel hover:text-accent underline">Discard my edits and use the original text</button>
        </form>
      )}
    </div>
  );
}
