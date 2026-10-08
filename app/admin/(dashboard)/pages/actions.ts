"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin, logActivity } from "@/lib/guard";
import { pageContent } from "@/lib/repo";
import { cleanHtml } from "@/lib/html";
import { departments } from "@/lib/academics";
import { BUILTIN } from "@/lib/builtin-pages";

function list(value: FormDataEntryValue | null): string[] {
  try {
    const v = JSON.parse(String(value || "[]"));
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export async function saveDeptAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!departments.some((d) => d.id === id)) redirect("/admin/pages");
  await pageContent.save({
    key: `dept:${id}`,
    tagline: String(formData.get("tagline") || "").trim(),
    body: cleanHtml(String(formData.get("body") || "")),
    images: list(formData.get("images")),
    updatedBy: actor.name,
  });
  await logActivity(actor, "updated", "Department page", departments.find((d) => d.id === id)?.name || id);
  revalidatePath(`/courses/${id}`);
  revalidatePath("/courses");
  redirect(`/admin/pages/dept/${id}?saved=1`);
}

export async function resetDeptAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = String(formData.get("id") || "");
  await pageContent.remove(`dept:${id}`);
  await logActivity(actor, "reset to original", "Department page", id);
  revalidatePath(`/courses/${id}`);
  redirect(`/admin/pages/dept/${id}?saved=1`);
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const RESERVED = new Set(["admin", "api", "uploads", "about", "academics", "administration", "admissions", "blog", "contact", "courses", "downloads", "e-notice", "gallery", "staff", "students-council", "tenders-careers", "login"]);

export async function saveCustomAction(formData: FormData) {
  const actor = await requireAdmin();
  const original = String(formData.get("original") || "");
  const title = String(formData.get("title") || "").trim();
  const slug = slugify(String(formData.get("slug") || "") || title);
  const back = original ? `/admin/pages/custom/${original}` : "/admin/pages/custom/new";
  if (!title) redirect(`${back}?error=Please+add+a+title`);
  if (!slug || RESERVED.has(slug)) redirect(`${back}?error=That+web+address+is+already+used+by+the+site.+Choose+another`);
  if (slug !== original && (await pageContent.get(`page:${slug}`))) redirect(`${back}?error=A+page+with+that+address+already+exists`);
  await pageContent.save({
    key: `page:${slug}`,
    title,
    tagline: String(formData.get("tagline") || "").trim(),
    body: cleanHtml(String(formData.get("body") || "")),
    images: list(formData.get("images")),
    published: formData.get("published") === "on",
    updatedBy: actor.name,
  });
  await logActivity(actor, original ? "updated" : "created", "Page", title);
  if (original && original !== slug) await pageContent.remove(`page:${original}`);
  revalidatePath(`/${slug}`);
  revalidatePath("/admin/pages");
  redirect(`/admin/pages/custom/${slug}?saved=1`);
}

export async function deleteCustomAction(formData: FormData) {
  const actor = await requireAdmin();
  const slug = String(formData.get("slug") || "");
  await logActivity(actor, "deleted", "Page", (await pageContent.get(`page:${slug}`))?.title || slug);
  await pageContent.remove(`page:${slug}`);
  revalidatePath(`/${slug}`);
  redirect("/admin/pages");
}

export async function saveBuiltinAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = String(formData.get("id") || "");
  const b = BUILTIN[id];
  if (!b) redirect("/admin/pages");
  await pageContent.save({
    key: `builtin:${id}`,
    title: String(formData.get("title") || "").trim().slice(0, 160),
    body: cleanHtml(String(formData.get("body") || "")),
    updatedBy: actor.name,
  });
  await logActivity(actor, "updated", "Page", b.name);
  revalidatePath(b.path);
  redirect(`/admin/pages/builtin/${id}?saved=1`);
}

export async function resetBuiltinAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = String(formData.get("id") || "");
  const b = BUILTIN[id];
  if (!b) redirect("/admin/pages");
  await pageContent.remove(`builtin:${id}`);
  await logActivity(actor, "reset", "Page", b.name);
  revalidatePath(b.path);
  redirect(`/admin/pages/builtin/${id}?saved=1`);
}
