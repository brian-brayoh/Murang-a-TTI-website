import type { MetadataRoute } from "next";
import { posts, pageContent } from "@/lib/repo";
import { departments } from "@/lib/academics";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const PAGES = ["", "/about", "/academics", "/administration", "/admissions", "/blog", "/contact", "/courses", "/downloads", "/e-notice", "/gallery", "/staff", "/students-council", "/tenders-careers"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await posts.listPublished();
  const custom = (await pageContent.listPrefix("page:")).filter((p) => p.published);
  return [
    ...PAGES.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...departments.map((d) => ({ url: `${SITE_URL}/courses/${d.id}`, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...custom.map((p) => ({ url: `${SITE_URL}/${p.key.slice(5)}`, lastModified: new Date(p.updated_at), priority: 0.5 })),
    ...items.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: new Date(p.created_at), priority: 0.5 })),
  ];
}
