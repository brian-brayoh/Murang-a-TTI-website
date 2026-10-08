import Link from "next/link";
import { departments } from "@/lib/academics";
import { pageContent } from "@/lib/repo";
import { BUILTIN } from "@/lib/builtin-pages";

export const dynamic = "force-dynamic";

export default async function AdminPages() {
  const edited = new Set((await pageContent.listPrefix("dept:")).map((p) => p.key));
  const custom = await pageContent.listPrefix("page:");
  const builtinEdited = new Set((await pageContent.listPrefix("builtin:")).map((p) => p.key));
  return (
    <div>
      <h1 className="font-display font-semibold text-2xl">Pages</h1>
      <p className="mt-1 text-sm text-steel max-w-2xl">Edit the writing and photos on department pages, or add brand new pages such as a policy, a notice board or a partner page.</p>

      <h2 className="mt-8 font-display font-semibold text-lg">Main pages</h2>
      <ul className="mt-3 divide-y divide-paper-line border-t border-b border-paper-line">
        {Object.entries(BUILTIN).map(([id, b]) => (
          <li key={id} className="py-3 flex items-center justify-between gap-4">
            <div>
              <Link href={`/admin/pages/builtin/${id}`} className="font-medium hover:text-brand-700">{b.name}</Link>
              <p className="text-xs text-steel">{b.path} &middot; {builtinEdited.has(`builtin:${id}`) ? "Edited in the admin" : "Using the original text"}</p>
            </div>
            <Link href={`/admin/pages/builtin/${id}`} className="text-xs border border-paper-line px-2.5 py-1.5 hover:border-brand-700">Edit</Link>
          </li>
        ))}
        <li className="py-3 text-xs text-steel">
          Home page, contact details and admissions text: <Link className="text-brand-700 underline" href="/admin/home">Home page</Link> and <Link className="text-brand-700 underline" href="/admin/site">Site details</Link>.
        </li>
      </ul>

      <h2 className="mt-8 font-display font-semibold text-lg">Department pages</h2>
      <ul className="mt-3 divide-y divide-paper-line border-t border-b border-paper-line">
        {departments.map((d) => (
          <li key={d.id} className="py-3 flex items-center justify-between gap-4">
            <div>
              <Link href={`/admin/pages/dept/${d.id}`} className="font-medium hover:text-brand-700">{d.name}</Link>
              <p className="text-xs text-steel">/courses/{d.id} &middot; {edited.has(`dept:${d.id}`) ? "Edited in the admin" : "Using the original text"}</p>
            </div>
            <Link href={`/admin/pages/dept/${d.id}`} className="text-xs border border-paper-line px-2.5 py-1.5 hover:border-brand-700">Edit</Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display font-semibold text-lg">Your own pages</h2>
        <Link href="/admin/pages/custom/new" className="bg-brand-700 text-white font-semibold px-4 py-2 text-sm hover:bg-brand-900">+ New page</Link>
      </div>
      <ul className="mt-3 divide-y divide-paper-line border-t border-b border-paper-line">
        {custom.map((p) => {
          const slug = p.key.slice(5);
          return (
            <li key={p.key} className="py-3 flex items-center justify-between gap-4">
              <div>
                <Link href={`/admin/pages/custom/${slug}`} className="font-medium hover:text-brand-700">{p.title}</Link>
                <p className="text-xs text-steel">/{slug} &middot; {p.published ? "Published" : "Draft"}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/${slug}`} target="_blank" className="text-xs border border-paper-line px-2.5 py-1.5 hover:border-brand-700">View</Link>
                <Link href={`/admin/pages/custom/${slug}`} className="text-xs border border-paper-line px-2.5 py-1.5 hover:border-brand-700">Edit</Link>
              </div>
            </li>
          );
        })}
        {custom.length === 0 && <li className="py-5 text-sm text-steel">No pages yet.</li>}
      </ul>
    </div>
  );
}
