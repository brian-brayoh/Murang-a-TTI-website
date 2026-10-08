import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, logActivity } from "@/lib/guard";
import { staff } from "@/lib/repo";
import { STAFF_DEPARTMENTS } from "@/lib/departments";
import { saveUpload } from "@/lib/upload";

async function createStaff(formData: FormData) {
  "use server";
  const actor = await requireAdmin();
  await logActivity(actor, "added", "Staff member", String(formData.get("title") || formData.get("name") || ""));

  let photoUrl: string;
  try {
    const uploaded = await saveUpload(formData.get("photo") as File | null, "staff");
    photoUrl = uploaded || String(formData.get("photoUrl") || "").trim();
  } catch (e) {
    redirect(`/admin/staff?error=${encodeURIComponent((e as Error).message)}`);
  }

  await staff.create({
    name: String(formData.get("name") || "").trim(),
    title: String(formData.get("title") || "").trim(),
    department: String(formData.get("department") || "Support Staff"),
    photoUrl,
  });
  revalidatePath("/admin/staff");
  revalidatePath("/staff");
  revalidatePath("/administration");
  revalidatePath("/students-council");
}

async function deleteStaff(formData: FormData) {
  "use server";
  const actor = await requireAdmin();
  await logActivity(actor, "deleted", "Staff member", String(formData.get("title") || formData.get("name") || ""));
  await staff.remove(String(formData.get("id")));
  revalidatePath("/admin/staff");
  revalidatePath("/staff");
  revalidatePath("/administration");
  revalidatePath("/students-council");
}

const input =
  "mt-1 w-full border border-paper-line px-3 py-2 bg-paper focus:outline-none focus:border-brand-700";

export default async function AdminStaff({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const all = await staff.listAll();

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl">Staff</h1>

      <form action={createStaff} className="mt-8 border border-paper-line p-6 grid sm:grid-cols-2 gap-4 max-w-2xl">
        {error && (
          <p className="sm:col-span-2 text-sm bg-accent/10 border border-accent text-accent-dark px-4 py-2.5">
            {error}
          </p>
        )}
        <div>
          <label className="text-sm text-steel">Full name</label>
          <input name="name" required className={input} />
        </div>
        <div>
          <label className="text-sm text-steel">Job title</label>
          <input name="title" required placeholder="e.g. Instructor, Welding" className={input} />
        </div>
        <div>
          <label className="text-sm text-steel">Department</label>
          <select name="department" className={input}>
            {STAFF_DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-steel">Photo (optional)</label>
          <input type="file" name="photo" accept="image/*" className={input} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm text-steel">
            Or paste a photo URL <span className="text-steel/70">(used only if no file is uploaded)</span>
          </label>
          <input name="photoUrl" placeholder="https://..." className={input} />
        </div>
        <button className="sm:col-span-2 bg-brand-700 text-white font-semibold px-5 py-2.5 hover:bg-brand-900">
          Add staff member
        </button>
      </form>

      <div className="mt-10 divide-y divide-paper-line border-t border-b border-paper-line">
        {all.map((p) => (
          <div key={p.id} className="py-4 flex items-center gap-4">
            {p.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.photo_url} alt={p.name} className="h-12 w-12 rounded-full object-cover bg-paper-line shrink-0" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-brand-200 shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-steel mt-0.5">
                {p.title} &middot; {p.department}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/admin/edit/staff/${p.id}`} className="text-xs border border-paper-line px-2.5 py-1.5 hover:border-brand-700">Edit</Link>
            <form action={deleteStaff}>
              <input type="hidden" name="id" value={p.id} />
              <button className="text-xs border border-paper-line px-2.5 py-1.5 hover:border-accent hover:text-accent">
                Delete
              </button>
            </form>
            </div>
          </div>
        ))}
        {all.length === 0 && <p className="py-6 text-sm text-steel">No staff yet.</p>}
      </div>
    </div>
  );
}
