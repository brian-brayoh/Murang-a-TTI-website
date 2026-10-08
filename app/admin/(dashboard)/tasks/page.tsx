import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/guard";
import { tasks } from "@/lib/repo";

const CATEGORIES = ["Content", "Photos", "Courses", "Launch", "General"];

async function create(formData: FormData) {
  "use server";
  await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  if (title) {
    await tasks.create({ title, category: String(formData.get("category") || "General") });
  }
  revalidatePath("/admin/tasks");
}

async function toggle(formData: FormData) {
  "use server";
  await requireAdmin();
  await tasks.setDone(String(formData.get("id")), formData.get("done") === "1");
  revalidatePath("/admin/tasks");
}

async function remove(formData: FormData) {
  "use server";
  await requireAdmin();
  await tasks.remove(String(formData.get("id")));
  revalidatePath("/admin/tasks");
}

const input = "mt-1 w-full border border-paper-line px-3 py-2 bg-paper focus:outline-none focus:border-brand-700";

export default async function AdminTasks() {
  const all = await tasks.listAll();
  const open = all.filter((t) => !t.done);
  const done = all.filter((t) => t.done);

  const groups = new Map<string, typeof open>();
  for (const t of open) {
    if (!groups.has(t.category)) groups.set(t.category, []);
    groups.get(t.category)!.push(t);
  }

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl">Launch checklist</h1>
      <p className="mt-1 text-sm text-steel">
        Everything still outstanding before this site is ready to go live —
        and anything else you want to track.
      </p>

      <form action={create} className="mt-8 border border-paper-line p-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[16rem]">
          <label className="text-sm text-steel">New task</label>
          <input name="title" required placeholder="e.g. Confirm fee structure for 2027 intake" className={input} />
        </div>
        <div>
          <label className="text-sm text-steel">Category</label>
          <select name="category" className={input} defaultValue="General">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <button className="bg-brand-700 text-white font-semibold px-5 py-2.5 hover:bg-brand-900 h-[42px]">
          Add
        </button>
      </form>

      <div className="mt-10 space-y-10">
        {[...groups.entries()].map(([category, items]) => (
          <div key={category}>
            <h2 className="font-display font-semibold text-lg text-brand-700">{category}</h2>
            <div className="mt-3 divide-y divide-paper-line border-t border-b border-paper-line">
              {items.map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between gap-4">
                  <form action={toggle} className="flex items-center gap-3 flex-1">
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="done" value="1" />
                    <button
                      type="submit"
                      aria-label="Mark done"
                      className="h-5 w-5 shrink-0 border border-steel hover:border-brand-700"
                    />
                    <span className="text-sm">{t.title}</span>
                  </form>
                  <form action={remove}>
                    <input type="hidden" name="id" value={t.id} />
                    <button className="text-xs border border-paper-line px-2 py-1 hover:border-accent hover:text-accent shrink-0">
                      Delete
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        ))}
        {open.length === 0 && (
          <p className="text-sm text-steel border border-dashed border-paper-line p-6">
            Nothing outstanding. Add a task above to start tracking something.
          </p>
        )}
      </div>

      {done.length > 0 && (
        <details className="mt-10">
          <summary className="cursor-pointer font-display font-semibold text-steel">
            Completed ({done.length})
          </summary>
          <div className="mt-3 divide-y divide-paper-line border-t border-b border-paper-line">
            {done.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between gap-4">
                <form action={toggle} className="flex items-center gap-3 flex-1">
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="done" value="0" />
                  <button
                    type="submit"
                    aria-label="Mark not done"
                    className="h-5 w-5 shrink-0 border border-brand-700 bg-brand-700 text-white text-xs grid place-items-center"
                  >
                    &#10003;
                  </button>
                  <span className="text-sm text-steel line-through">{t.title}</span>
                </form>
                <form action={remove}>
                  <input type="hidden" name="id" value={t.id} />
                  <button className="text-xs border border-paper-line px-2 py-1 hover:border-accent hover:text-accent shrink-0">
                    Delete
                  </button>
                </form>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
