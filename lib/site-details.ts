import { cache } from "react";
import { pageContent } from "@/lib/repo";
import { DEFAULT_BANNERS, type BannerKey } from "@/lib/banners";

export type SiteDetails = {
  address: string;
  phone: string;
  whatsapp: string; // digits with country code, e.g. 254748108000
  email: string;
  hours: string;
  footerBlurb: string;
  partners: string[];
  facebook: string;
  instagram: string;
  x: string;
  youtube: string;
  tiktok: string;
  governance: string;
  leadership: string;
  admissionsHeadline: string;
  admissionsIntro: string;
  banners: Record<BannerKey, string>;
};

export const DEFAULT_SITE: SiteDetails = {
  banners: DEFAULT_BANNERS,
  address: "Maragua, Murang'a County",
  phone: "0748 108 000",
  whatsapp: "254748108000",
  email: "info@murangatech.ac.ke",
  hours: "Mon–Fri, 8:00am–5:00pm",
  footerBlurb: "Nurturing technological innovation through hands-on, CBET-accredited training in Maragua, Murang'a County.",
  partners: ["KNEC", "TVETA", "KUCCPS", "HELB", "TVET CDACC", "KATTI"],
  facebook: "",
  instagram: "",
  x: "",
  youtube: "",
  tiktok: "",
  governance: "Board of Governors, chaired by Prof. Peter Kagwanja",
  leadership: "Principal \u2014 Mr. Ngatiah Simon Nderitu",
  admissionsHeadline: "September intake is open.",
  admissionsIntro:
    "Recognition of Prior Learning (RPL) applications are accepted year-round, alongside our January, May and September intakes.",
};

export const getSite = cache(async function getSite(): Promise<SiteDetails> {
  const row = await pageContent.get("site:details");
  if (!row?.body) return DEFAULT_SITE;
  try {
    const v = JSON.parse(row.body);
    return {
      ...DEFAULT_SITE,
      ...v,
      partners: Array.isArray(v.partners) ? v.partners : DEFAULT_SITE.partners,
      banners: { ...DEFAULT_BANNERS, ...(v.banners && typeof v.banners === "object" ? v.banners : {}) },
    };
  } catch {
    return DEFAULT_SITE;
  }
});

export { telHref, waHref } from "@/lib/contact-links";
