import { pageContent, staff } from "@/lib/repo";

export type Official = { position: string; name: string; photo: string };

// Placeholder positions shown until the names are confirmed.
export const DEFAULT_POSITIONS = [
  "Chairperson",
  "Vice Chairperson",
  "Secretary General",
  "Treasurer",
  "Academic Secretary",
  "Sports & Entertainment Secretary",
  "Gender & Welfare Secretary",
  "Hospitality Secretary",
];

export async function getCouncil(): Promise<{ officials: Official[]; saved: boolean; updatedAt?: string | Date; updatedBy?: string }> {
  const row = await pageContent.get("council:officials");
  if (row?.body) {
    try {
      const v = JSON.parse(row.body);
      if (Array.isArray(v)) {
        return {
          officials: v.map((o) => ({ position: String(o.position || ""), name: String(o.name || ""), photo: String(o.photo || "") })).filter((o) => o.position),
          saved: true,
          updatedAt: row.updated_at,
          updatedBy: row.updated_by,
        };
      }
    } catch {}
  }
  // older data: council members stored as staff in the "Students' Council" department
  const legacy = (await staff.listAll()).filter((p) => p.department === "Students' Council");
  if (legacy.length) {
    return { officials: legacy.map((p) => ({ position: p.title, name: p.name, photo: p.photo_url || "" })), saved: false };
  }
  return { officials: DEFAULT_POSITIONS.map((position) => ({ position, name: "", photo: "" })), saved: false };
}
