import { revalidatePath } from "next/cache";
import { requireAdminRole, logActivity } from "@/lib/guard";
import { settings } from "@/lib/repo";

async function save(formData: FormData) {
  "use server";
  const actor = await requireAdminRole();
  await logActivity(actor, "updated", "Site settings", "");
  await settings.set({
    courses_on_offer: String(formData.get("courses_on_offer") || ""),
    trainees: String(formData.get("trainees") || ""),
    trainers: String(formData.get("trainers") || ""),
    departments: String(formData.get("departments") || ""),
  });
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

const input = "mt-1 w-full border border-paper-line px-3 py-2 bg-paper focus:outline-none focus:border-brand-700";

export default async function AdminSettings() {
  await requireAdminRole();
  const s = await settings.getAll();

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl">Site settings</h1>
      <p className="mt-1 text-sm text-steel">
        These numbers show in the stats bar on the homepage.
      </p>

      <form action={save} className="mt-8 border border-paper-line p-6 grid sm:grid-cols-2 gap-4 max-w-xl">
        <div>
          <label className="text-sm text-steel">Courses on offer</label>
          <input name="courses_on_offer" defaultValue={s.courses_on_offer} className={input} />
        </div>
        <div>
          <label className="text-sm text-steel">Trainees</label>
          <input name="trainees" defaultValue={s.trainees} className={input} />
        </div>
        <div>
          <label className="text-sm text-steel">Trainers</label>
          <input name="trainers" defaultValue={s.trainers} className={input} />
        </div>
        <div>
          <label className="text-sm text-steel">Departments</label>
          <input name="departments" defaultValue={s.departments} className={input} />
        </div>
        <button className="sm:col-span-2 bg-brand-700 text-white font-semibold px-5 py-2.5 hover:bg-brand-900">
          Save
        </button>
      </form>
    </div>
  );
}
