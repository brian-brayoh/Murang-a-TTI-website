import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireAdmin, logActivity } from "@/lib/guard";
import { jobs } from "@/lib/repo";
import { FileField } from "@/components/MediaPicker";

export const dynamic = "force-dynamic";
const input = "mt-1 w-full border border-paper-line px-3 py-2 bg-paper focus:outline-none focus:border-brand-700";

async function create(formData: FormData) {
  "use server";
  const actor = await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await logActivity(actor, "added", "Career", title);
  await jobs.create({
    title,
    status: String(formData.get("status") || "Open"),
    attachmentUrl: String(formData.get("attachmentUrl") || ""),
  });
  revalidatePath("/admin/jobs");
  revalidatePath("/tenders-careers");
}

async function remove(formData: FormData) {
  "use server";
  const actor = await requireAdmin();
  await logActivity(actor, "deleted", "Career", String(formData.get("title") || ""));
  await jobs.remove(String(formData.get("id")));
  revalidatePath("/admin/jobs");
  revalidatePath("/tenders-careers");
}

export default async function AdminJobs() {
  const all = await jobs.listAll();

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl">Career openings</h1>
      <p className="text-sm text-steel max-w-2xl">Shown on <Link className="text-brand-700 underline" target="_blank" href="/tenders-careers">/tenders-careers</Link>. Attach the full notice as a PDF or Word file so visitors get an <em>Open details</em> button.</p>

      <form action={create} className="mt-6 border border-paper-line bg-white p-6 space-y-4 max-w-2xl">
        <h2 className="font-display font-semibold text-lg">Add a career opening</h2>
        <div className="grid sm:grid-cols-[1fr_10rem] gap-4">
          <div>
            <label className="text-sm text-steel">Title</label>
            <input name="title" required className={input} placeholder="e.g. Lecturer, Electrical Engineering" />
          </div>
          <div>
            <label className="text-sm text-steel">Status</label>
            <select name="status" defaultValue="Open" className={input}>
              <option>Open</option>
              <option>Closed</option>
              <option>Filled</option>
            </select>
          </div>
        </div>
        <FileField name="attachmentUrl" label="Document (PDF or Word): upload or pick from the library" />
        <button className="bg-brand-700 text-white font-semibold px-5 py-2.5 hover:bg-brand-900">Add</button>
      </form>

      <div className="mt-10 divide-y divide-paper-line border-t border-b border-paper-line">
        {all.map((i) => (
          <div key={i.id} className="py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium">{i.title}</p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <span className={`px-2 py-0.5 font-semibold ${/clos|expir|award|filled|cancel/i.test(i.status) ? "bg-paper-line text-steel" : "bg-accent text-brand-900"}`}>{i.status}</span>
                {i.attachment_url ? (
                  <a href={i.attachment_url} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline">Document attached &nearr;</a>
                ) : (
                  <Link href={`/admin/edit/job/${i.id}`} className="text-accent-dark underline">No document yet: add one</Link>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/admin/edit/job/${i.id}`} className="text-xs border border-paper-line px-2.5 py-1.5 hover:border-brand-700">Edit</Link>
              <form action={remove}>
                <input type="hidden" name="id" value={i.id} />
                <input type="hidden" name="title" value={i.title} />
                <button className="text-xs border border-paper-line px-2.5 py-1.5 hover:border-accent hover:text-accent">Delete</button>
              </form>
            </div>
          </div>
        ))}
        {all.length === 0 && <p className="py-6 text-sm text-steel">Nothing here yet.</p>}
      </div>
    </div>
  );
}
