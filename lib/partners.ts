import { pageContent } from "@/lib/repo";

export type Partner = { name: string; logo: string; url: string };

// Shown until the partners are edited in Admin > Partners. Logos are the ones
// already on the old murangatech.ac.ke site; TVETA and TVET CDACC have no logo
// file yet, so they show their name until one is uploaded.
const M = "/uploads/migrated/2025/02";
export const DEFAULT_PARTNERS: Partner[] = [
  { name: "KNEC", logo: `${M}/KNEC.jpg`, url: "" },
  { name: "TVETA", logo: "", url: "" },
  { name: "KUCCPS", logo: `${M}/kuccps.jpg`, url: "" },
  { name: "HELB", logo: `${M}/helb-loan.jpg`, url: "" },
  { name: "TVET CDACC", logo: "", url: "" },
  { name: "KATTI", logo: `${M}/KATTI.jpg`, url: "" },
];

export async function getPartners(): Promise<{ partners: Partner[]; saved: boolean; updatedAt?: string | Date; updatedBy?: string }> {
  const row = await pageContent.get("site:partners");
  if (row?.body) {
    try {
      const v = JSON.parse(row.body);
      if (Array.isArray(v)) {
        return {
          partners: v
            .map((p) => ({ name: String(p?.name || ""), logo: String(p?.logo || ""), url: String(p?.url || "") }))
            .filter((p) => p.name || p.logo),
          saved: true,
          updatedAt: row.updated_at,
          updatedBy: row.updated_by,
        };
      }
    } catch {}
  }
  return { partners: DEFAULT_PARTNERS, saved: false };
}
