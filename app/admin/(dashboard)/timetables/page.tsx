import Link from "next/link";
import { requireAdmin, logActivity } from "@/lib/guard";
import { revalidatePath } from "next/cache";
import { timetables } from "@/lib/repo";

async function createTimetable(formData: FormData) {
  "use server";
  const actor = await requireAdmin();
  await logActivity(actor, "added", "Exam timetable", String(formData.get("title") || formData.get("name") || ""));
  await timetables.create({
    department: String(formData.get("department") || ""),
    level: String(formData.get("level") || ""),
    dateRange: String(formData.get("dateRange") || ""),
  });
  revalidatePath("/admin/timetables");
  revalidatePath("/e-notice");
}

async function deleteTimetable(formData: FormData) {
  "use server";
  const actor = await requireAdmin();
  await logActivity(actor, "deleted", "Exam timetable", String(formData.get("title") || formData.get("name") || ""));
  await timetables.remove(String(formData.get("id")));
  revalidatePath("/admin/timetables");
  revalidatePath("/e-notice");
}

export default async function AdminTimetables() {
  const all = await timetables.listAll();

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl">Exam timetables</h1>

      <form
        action={createTimetable}
        className="mt-8 border border-paper-line p-6 grid sm:grid-cols-3 gap-4 max-w-2xl items-end"
      >
        <div>
          <label className="text-sm text-steel">Department</label>
          <input
            name="department"
            required
            className="mt-1 w-full border border-paper-line px-3 py-2 bg-paper focus:outline-none focus:border-brand-700"
          />
        </div>
        <div>
          <label className="text-sm text-steel">Level</label>
          <input
            name="level"
            required
            className="mt-1 w-full border border-paper-line px-3 py-2 bg-paper focus:outline-none focus:border-brand-700"
          />
        </div>
        <div>
          <label className="text-sm text-steel">Date range</label>
          <input
            name="dateRange"
            required
            placeholder="Oct 6\u201310, 2026"
            className="mt-1 w-full border border-paper-line px-3 py-2 bg-paper focus:outline-none focus:border-brand-700"
          />
        </div>
        <button className="sm:col-span-3 bg-brand-700 text-white font-semibold px-5 py-2.5 hover:bg-brand-900">
          Add
        </button>
      </form>

      <div className="mt-10 divide-y divide-paper-line border-t border-b border-paper-line">
        {all.map((t) => (
          <div key={t.id} className="py-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">{t.department}</p>
              <p className="text-xs text-steel mt-0.5">
                {t.level} &middot; {t.date_range}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/admin/edit/timetable/${t.id}`} className="text-xs border border-paper-line px-2.5 py-1.5 hover:border-brand-700">Edit</Link>
            <form action={deleteTimetable}>
              <input type="hidden" name="id" value={t.id} />
              <button className="text-xs border border-paper-line px-2.5 py-1.5 hover:border-accent hover:text-accent">
                Delete
              </button>
            </form>
            </div>
          </div>
        ))}
        {all.length === 0 && <p className="py-6 text-sm text-steel">No timetables yet.</p>}
      </div>
    </div>
  );
}
