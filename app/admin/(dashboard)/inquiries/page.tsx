import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/guard";
import { inquiries } from "@/lib/repo";

async function markRead(formData: FormData) {
  "use server";
  await requireAdmin();
  await inquiries.markRead(String(formData.get("id")));
  revalidatePath("/admin/inquiries");
}

async function remove(formData: FormData) {
  "use server";
  await requireAdmin();
  await inquiries.remove(String(formData.get("id")));
  revalidatePath("/admin/inquiries");
}

export default async function AdminInquiries() {
  const all = await inquiries.listAll();

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl">Contact messages</h1>
      <p className="mt-1 text-sm text-steel">Submitted through the public Contact form.</p>

      <div className="mt-8 divide-y divide-paper-line border-t border-b border-paper-line">
        {all.map((i) => (
          <div key={i.id} className={`py-5 ${!i.is_read ? "bg-accent/5 -mx-2 px-2" : ""}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">
                  {i.name}{" "}
                  {!i.is_read && (
                    <span className="ml-2 text-xs font-mono text-accent-dark border border-accent px-1.5 py-0.5">
                      NEW
                    </span>
                  )}
                </p>
                <a href={`mailto:${i.email}`} className="text-sm text-brand-700 hover:text-accent-dark">
                  {i.email}
                </a>
                <p className="mt-2 text-sm text-steel leading-relaxed max-w-xl">{i.message}</p>
                <p className="mt-1 text-xs text-steel">{new Date(i.created_at).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!i.is_read && (
                  <form action={markRead}>
                    <input type="hidden" name="id" value={i.id} />
                    <button className="text-xs border border-paper-line px-2.5 py-1.5 hover:border-brand-700">
                      Mark read
                    </button>
                  </form>
                )}
                <form action={remove}>
                  <input type="hidden" name="id" value={i.id} />
                  <button className="text-xs border border-paper-line px-2.5 py-1.5 hover:border-accent hover:text-accent">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
        {all.length === 0 && <p className="py-6 text-sm text-steel">No messages yet.</p>}
      </div>
    </div>
  );
}
