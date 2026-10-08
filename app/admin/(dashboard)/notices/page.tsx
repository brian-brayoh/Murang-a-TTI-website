import Link from "next/link";
import { notices, noticeFiles } from "@/lib/repo";
import { htmlToText } from "@/lib/wp-migrate";

export const dynamic = "force-dynamic";

type SP = { show?: string };

export default async function AdminNotices({ searchParams }: { searchParams: Promise<SP> }) {
  const { show } = await searchParams;
  const all = await notices.listAll();
  const rows = all.map((n) => {
    const files = noticeFiles(n);
    return { n, files, hasImage: !!n.image_url, none: files.length === 0 && !n.image_url };
  });
  const missing = rows.filter((r) => r.none).length;
  const shown = show === "missing" ? rows.filter((r) => r.none) : rows;
  const tab = (active: boolean) => `px-3.5 py-1.5 text-sm border ${active ? "bg-brand-700 border-brand-700 text-white" : "border-paper-line bg-white hover:border-brand-700"}`;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display font-semibold text-2xl">Notices</h1>
        <Link href="/admin/notices/new" className="bg-brand-700 text-white font-semibold px-5 py-2.5 hover:bg-brand-900">+ New notice</Link>
      </div>
      <p className="mt-1 text-sm text-steel max-w-2xl">
        Each notice can carry an image (such as an intake poster) and one or more files. The labels show what each one has. Open a notice to attach what&apos;s missing.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link href="/admin/notices" className={tab(show !== "missing")}>All ({rows.length})</Link>
        <Link href="/admin/notices?show=missing" className={tab(show === "missing")}>Nothing attached ({missing})</Link>
      </div>

      <div className="mt-6 divide-y divide-paper-line border-t border-b border-paper-line bg-white">
        {shown.map(({ n, files, hasImage, none }) => (
          <div key={n.id} className="py-3 px-4 flex items-center gap-4">
            <div className="h-14 w-20 shrink-0 bg-brand-900/5 overflow-hidden grid place-items-center">
              {hasImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={n.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <span className="text-[10px] text-steel">no image</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/admin/notices/${n.id}`} className="font-medium hover:text-brand-700 line-clamp-1">{n.title}</Link>
              <p className="text-xs text-steel mt-0.5 line-clamp-1">{htmlToText(n.body).replace(/\s+/g, " ").slice(0, 120)}</p>
              <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="font-mono text-steel">{new Date(n.created_at).toLocaleDateString()}</span>
                {hasImage && <span className="bg-brand-200 text-brand-900 px-1.5 py-0.5">Image</span>}
                {files.length > 0 && <span className="bg-brand-900 text-white px-1.5 py-0.5">{files.length} file{files.length === 1 ? "" : "s"}</span>}
                {none && <span className="bg-accent/20 text-accent-dark px-1.5 py-0.5">Nothing attached</span>}
                {!n.published && <span className="border border-paper-line px-1.5 py-0.5">Draft</span>}
              </p>
            </div>
            <Link href={`/admin/notices/${n.id}`} className="shrink-0 text-xs border border-paper-line px-2.5 py-1.5 hover:border-brand-700">Edit</Link>
          </div>
        ))}
        {shown.length === 0 && <p className="py-6 px-4 text-sm text-steel">{show === "missing" ? "Every notice has something attached." : "No notices yet."}</p>}
      </div>
    </div>
  );
}
