import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/guard";
import { applications } from "@/lib/repo";

const STATUSES = ["New", "Contacted", "Admitted", "Declined"];

async function setStatus(formData: FormData) {
  "use server";
  await requireAdmin();
  await applications.setStatus(String(formData.get("id")), String(formData.get("status")));
  revalidatePath("/admin/applications");
}

async function remove(formData: FormData) {
  "use server";
  await requireAdmin();
  await applications.remove(String(formData.get("id")));
  revalidatePath("/admin/applications");
}

const statusTone: Record<string, string> = {
  New: "border-accent text-accent-dark",
  Contacted: "border-brand-500 text-brand-500",
  Admitted: "border-brand-700 text-brand-700",
  Declined: "border-steel text-steel",
};

export default async function AdminApplications() {
  const all = await applications.listAll();

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl">Admissions applications</h1>
      <p className="mt-1 text-sm text-steel">Submitted through the public Admissions form.</p>

      <div className="mt-8 divide-y divide-paper-line border-t border-b border-paper-line">
        {all.map((a) => (
          <div key={a.id} className="py-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-medium">
                {a.name}{" "}
                <span className={`ml-2 text-xs font-mono border px-1.5 py-0.5 ${statusTone[a.status] || ""}`}>
                  {a.status}
                </span>
              </p>
              <p className="text-sm text-steel mt-0.5">
                {a.department} &middot; Level {a.level}
              </p>
              <a href={`mailto:${a.email}`} className="text-sm text-brand-700 hover:text-accent-dark">
                {a.email}
              </a>
              {a.phone && <span className="text-sm text-steel"> &middot; {a.phone}</span>}
              {a.message && <p className="mt-2 text-sm text-steel leading-relaxed max-w-xl">{a.message}</p>}
              <p className="mt-1 text-xs text-steel">{new Date(a.created_at).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <form action={setStatus} className="flex items-center gap-1.5">
                <input type="hidden" name="id" value={a.id} />
                <select
                  name="status"
                  defaultValue={a.status}
                  className="text-xs border border-paper-line px-2 py-1.5 bg-white"
                >
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <button className="text-xs border border-paper-line px-2.5 py-1.5 hover:border-brand-700">
                  Update
                </button>
              </form>
              <form action={remove}>
                <input type="hidden" name="id" value={a.id} />
                <button className="text-xs border border-paper-line px-2.5 py-1.5 hover:border-accent hover:text-accent">
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
        {all.length === 0 && <p className="py-6 text-sm text-steel">No applications yet.</p>}
      </div>
    </div>
  );
}
