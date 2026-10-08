import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, logActivity } from "@/lib/guard";
import { documents } from "@/lib/repo";
import { saveUpload } from "@/lib/upload";

async function create(formData: FormData) {
  "use server";
  const actor = await requireAdmin();
  await logActivity(actor, "added", "Download", String(formData.get("title") || formData.get("name") || ""));

  let url: string;
  try {
    const uploaded = await saveUpload(formData.get("file") as File | null, "documents");
    url = uploaded || String(formData.get("url") || "").trim();
  } catch (e) {
    redirect(`/admin/downloads?error=${encodeURIComponent((e as Error).message)}`);
  }
  const title = String(formData.get("title") || "").trim();
  if (!title || !url) {
    redirect("/admin/downloads?error=" + encodeURIComponent("Title and a file or URL are required."));
  }

  await documents.create({ title, url, category: String(formData.get("category") || "General").trim() });
  revalidatePath("/admin/downloads");
  revalidatePath("/downloads");
}

async function remove(formData: FormData) {
  "use server";
  const actor = await requireAdmin();
  await logActivity(actor, "deleted", "Download", String(formData.get("title") || formData.get("name") || ""));
  await documents.remove(String(formData.get("id")));
  revalidatePath("/admin/downloads");
  revalidatePath("/downloads");
}

const input = "mt-1 w-full border border-paper-line px-3 py-2 bg-paper focus:outline-none focus:border-brand-700";

export default async function AdminDownloads({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const all = await documents.listAll();

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl">Downloads</h1>

      <form action={create} className="mt-8 border border-paper-line p-6 grid sm:grid-cols-2 gap-4 max-w-2xl">
        {error && (
          <p className="sm:col-span-2 text-sm bg-accent/10 border border-accent text-accent-dark px-4 py-2.5">
            {error}
          </p>
        )}
        <div className="sm:col-span-2">
          <label className="text-sm text-steel">Document title</label>
          <input name="title" required placeholder="Fee structure 2026" className={input} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm text-steel">Upload a file (PDF, or an image)</label>
          <input type="file" name="file" accept="application/pdf,image/*" className={input} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm text-steel">
            Or paste a URL <span className="text-steel/70">(used only if no file is uploaded)</span>
          </label>
          <input name="url" placeholder="https://..." className={input} />
        </div>
        <div>
          <label className="text-sm text-steel">Category</label>
          <input name="category" defaultValue="General" className={input} />
        </div>
        <button className="sm:col-span-2 bg-brand-700 text-white font-semibold px-5 py-2.5 hover:bg-brand-900">
          Add document
        </button>
      </form>

      <div className="mt-10 divide-y divide-paper-line border-t border-b border-paper-line">
        {all.map((d) => (
          <div key={d.id} className="py-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">{d.title}</p>
              <p className="text-xs text-steel mt-0.5">{d.category} &middot; {d.url}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/admin/edit/document/${d.id}`} className="text-xs border border-paper-line px-2.5 py-1.5 hover:border-brand-700">Edit</Link>
            <form action={remove}>
              <input type="hidden" name="id" value={d.id} />
              <button className="text-xs border border-paper-line px-2.5 py-1.5 hover:border-accent hover:text-accent">Delete</button>
            </form>
            </div>
          </div>
        ))}
        {all.length === 0 && <p className="py-6 text-sm text-steel">No documents yet.</p>}
      </div>
    </div>
  );
}
