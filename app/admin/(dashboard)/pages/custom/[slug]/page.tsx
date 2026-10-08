import Link from "next/link";
import { notFound } from "next/navigation";
import { pageContent } from "@/lib/repo";
import CustomForm from "../../CustomForm";
import { deleteCustomAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditCustom({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const row = await pageContent.get(`page:${slug}`);
  if (!row) notFound();
  return (
    <div>
      <Link href="/admin/pages" className="text-sm text-steel hover:text-brand-700">&larr; Pages</Link>
      <div className="mt-2 flex items-center justify-between gap-4">
        <h1 className="font-display font-semibold text-2xl">Edit page</h1>
        <form action={deleteCustomAction}>
          <input type="hidden" name="slug" value={slug} />
          <button className="text-xs border border-paper-line px-3 py-1.5 hover:border-accent hover:text-accent">Delete page</button>
        </form>
      </div>
      <CustomForm row={row} error={sp.error} saved={sp.saved === "1"} />
    </div>
  );
}
