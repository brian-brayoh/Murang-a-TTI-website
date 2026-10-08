"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin, logActivity } from "@/lib/guard";
import { notices, parseJsonList, type Attachment } from "@/lib/repo";
import { cleanHtml } from "@/lib/html";

function read(formData: FormData) {
  return {
    title: String(formData.get("title") || "").trim(),
    body: cleanHtml(String(formData.get("body") || "")),
    imageUrl: String(formData.get("imageUrl") || ""),
    attachments: parseJsonList<Attachment>(String(formData.get("attachments") || "[]")).filter((a) => a && a.url),
    createdAt: String(formData.get("date") || "") ? new Date(String(formData.get("date"))).toISOString() : undefined,
    published: formData.get("published") === "on",
  };
}
const refresh = () => {
  revalidatePath("/admin/notices");
  revalidatePath("/e-notice");
};

export async function createNoticeAction(formData: FormData) {
  const actor = await requireAdmin();
  const v = read(formData);
  if (!v.title) redirect("/admin/notices/new?error=Please+add+a+title");
  const id = await notices.create(v);
  await logActivity(actor, "added", "Notice", v.title);
  refresh();
  redirect(`/admin/notices/${id}?saved=1`);
}

export async function saveNoticeAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = String(formData.get("id") || "");
  const v = read(formData);
  if (!v.title) redirect(`/admin/notices/${id}?error=Please+add+a+title`);
  await notices.update(id, v);
  await logActivity(actor, "updated", "Notice", v.title);
  refresh();
  redirect(`/admin/notices/${id}?saved=1`);
}

export async function deleteNoticeAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = String(formData.get("id") || "");
  const old = await notices.getById(id);
  await notices.remove(id);
  await logActivity(actor, "deleted", "Notice", old?.title || "");
  refresh();
  redirect("/admin/notices");
}
