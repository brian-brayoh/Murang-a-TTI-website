"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin, logActivity } from "@/lib/guard";
import { pageContent } from "@/lib/repo";

const t = (v: unknown, max = 120) => String(v ?? "").trim().slice(0, max);

export async function saveCouncilAction(formData: FormData) {
  const actor = await requireAdmin();
  let raw: unknown[] = [];
  try {
    raw = JSON.parse(String(formData.get("officials") || "[]"));
  } catch {}
  const officials = (Array.isArray(raw) ? raw : [])
    .map((o) => {
      const r = (o || {}) as Record<string, unknown>;
      return { position: t(r.position), name: t(r.name), photo: t(r.photo, 400) };
    })
    .filter((o) => o.position)
    .slice(0, 40);
  await pageContent.save({ key: "council:officials", body: JSON.stringify(officials), updatedBy: actor.name });
  await logActivity(actor, "updated", "Students' Council", `${officials.filter((o) => o.name).length} of ${officials.length} positions filled`);
  revalidatePath("/students-council");
  redirect("/admin/council?saved=1");
}

export async function resetCouncilAction() {
  const actor = await requireAdmin();
  await pageContent.remove("council:officials");
  await logActivity(actor, "reset", "Students' Council", "Back to placeholders");
  revalidatePath("/students-council");
  redirect("/admin/council?saved=1");
}
