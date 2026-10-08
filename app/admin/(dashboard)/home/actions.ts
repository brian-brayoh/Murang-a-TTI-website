"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin, logActivity } from "@/lib/guard";
import { pageContent } from "@/lib/repo";

const t = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);
const href = (v: unknown) => {
  const x = t(v, 300);
  return x === "" ? "/admissions" : /^(\/|https?:\/\/|mailto:|tel:)/.test(x) ? x : "/" + x;
};

export async function saveHomeAction(formData: FormData) {
  const actor = await requireAdmin();
  let raw: unknown[] = [];
  try {
    raw = JSON.parse(String(formData.get("slides") || "[]"));
  } catch {}
  const slides = (Array.isArray(raw) ? raw : [])
    .map((s) => {
      const o = (s || {}) as Record<string, unknown>;
      return {
        kicker: t(o.kicker, 80),
        title: t(o.title, 120),
        tagline: t(o.tagline, 200),
        cta: { label: t(o.ctaLabel, 40) || "Find out more", href: href(o.ctaHref) },
        src: t(o.src, 400),
      };
    })
    .filter((s) => s.src);
  if (slides.length === 0) redirect("/admin/home?error=1");
  await pageContent.save({ key: "home:slides", body: JSON.stringify(slides), updatedBy: actor.name });
  await pageContent.save({
    key: "home:banner",
    body: JSON.stringify({
      show: formData.get("bannerShow") === "on",
      text: t(formData.get("bannerText")),
      linkText: t(formData.get("bannerLinkText"), 60),
      href: href(formData.get("bannerHref")),
    }),
    updatedBy: actor.name,
  });
  const freq = String(formData.get("popupFrequency") || "session");
  await pageContent.save({
    key: "home:popup",
    body: JSON.stringify({
      show: formData.get("popupShow") === "on",
      headline: t(formData.get("popupHeadline"), 80),
      notice: t(formData.get("popupNotice"), 400),
      welcome: t(formData.get("popupWelcome"), 400),
      frequency: ["always", "session", "daily", "weekly"].includes(freq) ? freq : "session",
    }),
    updatedBy: actor.name,
  });
  let ch: unknown[] = [];
  try {
    ch = JSON.parse(String(formData.get("charter") || "[]"));
  } catch {}
  await pageContent.save({
    key: "home:sections",
    body: JSON.stringify({
      whoHeadline: t(formData.get("whoHeadline")),
      mission: t(formData.get("mission"), 500),
      vision: t(formData.get("vision"), 500),
      values: t(formData.get("values"), 500),
      deptHeading: t(formData.get("deptHeading")),
      charterHeadline: t(formData.get("charterHeadline")),
      charterText: t(formData.get("charterText"), 600),
      charter: (Array.isArray(ch) ? ch : [])
        .map((r) => ({ label: t((r as Record<string, unknown>)?.label, 80), value: t((r as Record<string, unknown>)?.value, 60) }))
        .filter((r) => r.label)
        .slice(0, 8),
      ctaHeadline: t(formData.get("ctaHeadline")),
      ctaButton: t(formData.get("ctaButton"), 40) || "Apply now",
    }),
    updatedBy: actor.name,
  });
  await logActivity(actor, "updated", "Home page", "Slideshow, banner, pop-up and sections");
  revalidatePath("/", "layout");
  redirect("/admin/home?saved=1");
}

export async function resetHomeAction() {
  const actor = await requireAdmin();
  await pageContent.remove("home:slides");
  await pageContent.remove("home:banner");
  await pageContent.remove("home:popup");
  await pageContent.remove("home:sections");
  await logActivity(actor, "reset", "Home page", "Slideshow and banner to original");
  revalidatePath("/", "layout");
  redirect("/admin/home?saved=1");
}
