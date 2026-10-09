"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin, logActivity } from "@/lib/guard";
import { pageContent } from "@/lib/repo";

const t = (v: unknown, max = 120) => String(v ?? "").trim().slice(0, max);
const url = (v: unknown) => {
  const x = t(v, 300);
  return x && !/^https?:\/\//i.test(x) ? "https://" + x : x;
};

export async function savePartnersAction(formData: FormData) {
  const actor = await requireAdmin();
  let raw: unknown[] = [];
  try {
    raw = JSON.parse(String(formData.get("partners") || "[]"));
  } catch {}
  const partners = (Array.isArray(raw) ? raw : [])
    .map((p) => {
      const r = (p || {}) as Record<string, unknown>;
      return { name: t(r.name), logo: t(r.logo, 400), url: url(r.url) };
    })
    .filter((p) => p.name || p.logo)
    .slice(0, 40);
  await pageContent.save({ key: "site:partners", body: JSON.stringify(partners), updatedBy: actor.name });
  await logActivity(actor, "updated", "Partners", `${partners.length} partners`);
  revalidatePath("/", "layout");
  redirect("/admin/partners?saved=1");
}

export async function resetPartnersAction() {
  const actor = await requireAdmin();
  await pageContent.remove("site:partners");
  await logActivity(actor, "reset", "Partners", "Back to the starting list");
  revalidatePath("/", "layout");
  redirect("/admin/partners?saved=1");
}
