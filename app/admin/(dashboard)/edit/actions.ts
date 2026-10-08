"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin, logActivity } from "@/lib/guard";
import { EDIT_TYPES } from "@/lib/edit-config";
import { tenders, jobs, timetables, documents, galleryPhotos, staff, courses } from "@/lib/repo";

const s = (f: FormData, k: string) => String(f.get(k) || "").trim();
const when = (f: FormData) => (s(f, "date") ? new Date(s(f, "date")).toISOString() : undefined);

export async function saveEditAction(formData: FormData) {
  const actor = await requireAdmin();
  const type = s(formData, "type");
  const id = s(formData, "id");
  const cfg = EDIT_TYPES[type];
  if (!cfg) redirect("/admin");
  const back = `/admin/edit/${type}/${id}`;
  for (const f of cfg.fields) if (f.required && !s(formData, f.name)) redirect(`${back}?error=${encodeURIComponent(f.label + " is required")}`);

  switch (type) {
    case "tender":
      await tenders.update(id, { title: s(formData, "title"), status: s(formData, "status") || "Open", attachmentUrl: s(formData, "attachmentUrl"), createdAt: when(formData) });
      break;
    case "job":
      await jobs.update(id, { title: s(formData, "title"), status: s(formData, "status") || "Open", attachmentUrl: s(formData, "attachmentUrl"), createdAt: when(formData) });
      break;
    case "timetable":
      await timetables.update(id, { department: s(formData, "department"), level: s(formData, "level"), dateRange: s(formData, "dateRange") });
      break;
    case "document":
      await documents.update(id, { title: s(formData, "title"), url: s(formData, "url"), category: s(formData, "category") || "General" });
      break;
    case "gallery":
      await galleryPhotos.update(id, { url: s(formData, "url"), caption: s(formData, "caption"), category: s(formData, "category") || "Campus life" });
      break;
    case "staff":
      await staff.update(id, { name: s(formData, "name"), title: s(formData, "title"), department: s(formData, "department"), photoUrl: s(formData, "photoUrl") });
      break;
    case "course":
      await courses.updateAll(id, {
        name: s(formData, "name"), department: s(formData, "department"), level: Number(s(formData, "level")) || 6,
        summary: s(formData, "summary"), duration: s(formData, "duration"), entry: s(formData, "entry"), examBody: s(formData, "examBody"),
      });
      break;
  }
  await logActivity(actor, "updated", cfg.label, s(formData, "title") || s(formData, "name") || s(formData, "caption") || s(formData, "department"));
  for (const p of [cfg.list, ...cfg.revalidate]) revalidatePath(p);
  redirect(`${back}?saved=1`);
}
