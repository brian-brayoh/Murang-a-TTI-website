"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin, logActivity } from "@/lib/guard";
import { pageContent } from "@/lib/repo";
import { DEFAULT_SITE } from "@/lib/site-details";
import { BANNER_PAGES, DEFAULT_BANNERS } from "@/lib/banners";

const t = (v: unknown, max = 300) => String(v ?? "").trim().slice(0, max);
const url = (v: unknown) => {
  const x = t(v, 300);
  return x && !/^https?:\/\//i.test(x) ? "https://" + x : x;
};

export async function saveSiteAction(formData: FormData) {
  const actor = await requireAdmin();
  const partners = String(formData.get("partners") || "")
    .split(/[\n,]/)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 24);
  const value = {
    address: t(formData.get("address")) || DEFAULT_SITE.address,
    phone: t(formData.get("phone"), 40) || DEFAULT_SITE.phone,
    whatsapp: t(formData.get("whatsapp"), 20).replace(/\D/g, "") || DEFAULT_SITE.whatsapp,
    email: t(formData.get("email"), 120) || DEFAULT_SITE.email,
    hours: t(formData.get("hours"), 120),
    footerBlurb: t(formData.get("footerBlurb"), 300),
    partners,
    facebook: url(formData.get("facebook")),
    instagram: url(formData.get("instagram")),
    x: url(formData.get("x")),
    youtube: url(formData.get("youtube")),
    tiktok: url(formData.get("tiktok")),
    governance: t(formData.get("governance")),
    leadership: t(formData.get("leadership")),
    admissionsHeadline: t(formData.get("admissionsHeadline"), 120),
    admissionsIntro: t(formData.get("admissionsIntro"), 400),
    banners: Object.fromEntries(BANNER_PAGES.map((b) => [b.key, t(formData.get(`banner_${b.key}`), 400) || DEFAULT_BANNERS[b.key]])),
  };
  await pageContent.save({ key: "site:details", body: JSON.stringify(value), updatedBy: actor.name });
  await logActivity(actor, "updated", "Site details", "Contact, footer and admissions text");
  revalidatePath("/", "layout");
  redirect("/admin/site?saved=1");
}
