"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin, logActivity } from "@/lib/guard";
import { posts, updatePost, getPostById, parseJsonList, type Attachment } from "@/lib/repo";
import { cleanHtml } from "@/lib/html";
import { htmlToText } from "@/lib/wp-migrate";

function read(formData: FormData) {
  const body = cleanHtml(String(formData.get("body") || ""));
  const excerptRaw = String(formData.get("excerpt") || "").trim();
  const text = htmlToText(body).replace(/\s+/g, " ");
  const excerpt = excerptRaw || (text.length > 180 ? text.slice(0, 177).trimEnd() + "…" : text);
  return {
    title: String(formData.get("title") || "").trim(),
    slug: String(formData.get("slug") || "").trim(),
    excerpt,
    body,
    author: String(formData.get("author") || "").trim() || "The Registrar",
    imageUrl: String(formData.get("imageUrl") || ""),
    attachments: parseJsonList<Attachment>(String(formData.get("attachments") || "[]")).filter((a) => a && a.url),
    createdAt: String(formData.get("date") || "") ? new Date(String(formData.get("date"))).toISOString() : undefined,
    published: formData.get("published") === "on",
  };
}

function refresh() {
  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  revalidatePath("/");
}

export async function createPostAction(formData: FormData) {
  const actor = await requireAdmin();
  const v = read(formData);
  if (!v.title) redirect("/admin/posts/new?error=Please+add+a+title");
  const id = await posts.create({
    title: v.title,
    slug: v.slug || undefined,
    excerpt: v.excerpt,
    body: v.body,
    author: v.author,
    imageUrl: v.imageUrl,
    images: v.imageUrl ? [v.imageUrl] : [],
    attachments: v.attachments,
    createdAt: v.createdAt,
  });
  if (!v.published) await posts.togglePublished(id, false);
  await logActivity(actor, "created", "News post", v.title);
  refresh();
  redirect(`/admin/posts/${id}?saved=1`);
}

export async function savePostAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = String(formData.get("id") || "");
  const v = read(formData);
  if (!v.title) redirect(`/admin/posts/${id}?error=Please+add+a+title`);
  await updatePost(id, { ...v, updatedBy: actor.name });
  await logActivity(actor, "updated", "News post", v.title);
  refresh();
  redirect(`/admin/posts/${id}?saved=1`);
}

export async function deletePostAction(formData: FormData) {
  const actor = await requireAdmin();
  const old = await getPostById(String(formData.get("id")));
  await posts.remove(String(formData.get("id")));
  await logActivity(actor, "deleted", "News post", old?.title || "");
  refresh();
  redirect("/admin/posts");
}

export async function togglePostAction(formData: FormData) {
  const actor = await requireAdmin();
  const old = await getPostById(String(formData.get("id")));
  const pub = formData.get("published") === "1";
  await posts.togglePublished(String(formData.get("id")), pub);
  await logActivity(actor, pub ? "published" : "unpublished", "News post", old?.title || "");
  refresh();
}
