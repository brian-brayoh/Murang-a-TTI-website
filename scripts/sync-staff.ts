// Loads the people currently listed on https://murangatech.ac.ke/administration/
// (names, titles, photos) into the staff table. Safe to re-run: people are
// matched by name, so existing entries are updated, never duplicated.
//   npm run staff:sync -- --dry-run     # show what would happen
//   npm run staff:sync                  # write to the database + download photos
import "./env";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { originalImage } from "../lib/wp-migrate";

type P = { name: string; title: string; department: string; photo: string };
const U = "https://murangatech.ac.ke/wp-content/uploads/";

// Source: murangatech.ac.ke/administration (checked 7 Oct 2026). Order = display order.
const PEOPLE: P[] = [
  { name: "Mr. Ngatiah Simon Nderitu", title: "Principal", department: "Administration", photo: U + "2026/03/ngatia-principal-1024x683.jpg" },
  { name: "E.W. Ngiri", title: "Deputy Principal, Administration", department: "Administration", photo: U + "2026/05/DSC_2554_e-removebg-preview.png" },
  { name: "Jane Kariuki", title: "Deputy Principal, Academic Affairs", department: "Administration", photo: U + "2026/05/DSC_2668-e-1024x683.jpg" },
  { name: "Michael Tirop", title: "Registrar of Students", department: "Administration", photo: U + "2025/02/Tirop1-1-1024x973.jpeg" },
  { name: "Anne Mwangi", title: "Dean of Students", department: "Administration", photo: U + "elementor/thumbs/DSC_2522-e-scaled-rnkxr1es725pbu97h62ydgqowy1wzmpx1a6aqp31s4.jpg" },
  { name: "Lameck Kirubi", title: "Industrial Liaison Officer (ILO)", department: "Administration", photo: U + "elementor/thumbs/lameck-r1g63ppi3vpoykerbbn3icleneyhdopvill2pu7ozo.png" },
  { name: "Kang'ara Ian", title: "Examination Officer", department: "Administration", photo: U + "elementor/thumbs/M004-r2t30z4fkybfj6txcy2uyc1c3sv64sk7kus9ajnmt4.jpg" },
  { name: "Njuraita Muchai", title: "Head of Department, Electrical & Electronics", department: "Electrical & Electronics", photo: U + "2026/05/DSC_2580-e-150x150.jpg" },
  { name: "Winnie Gakii", title: "Head of Department, Hospitality Management", department: "Hospitality Management", photo: U + "2025/02/WINNIE-1-1024x763.jpeg" },
  { name: "Joy Weddy", title: "Head of Department, Agriculture", department: "Agriculture", photo: U + "2026/05/DSC_2553-e-300x200.jpg" },
  { name: "Harun Thumbi", title: "Head of Department, ICT & Informatics", department: "ICT & Informatics", photo: U + "2025/03/thumbi-276x300.jpeg" },
  { name: "Salome Mungai", title: "Head of Guidance and Counselling", department: "Institute Services", photo: U + "elementor/thumbs/WhatsApp-Image-2025-02-24-at-2.27.43-AM-rotated-r210v6fberul90mxlm3z6dd8i4e8llwbq570v7cqac.jpeg" },
  { name: "Roseann Macharia", title: "Librarian", department: "Institute Services", photo: U + "elementor/thumbs/roseann-r3mad2d1pnhp1lp4xgd3ug3w2580q5v6wrj1s2nhvo.png" },
  { name: "Hannah Maara", title: "Institute CBET Champion", department: "Institute Services", photo: U + "elementor/thumbs/hannah--r27u67w8f54kw6d1dizg1ikdunuul8nz2ruszhzvfg.jpeg" },
  { name: "Patrick Mugendi", title: "Deputy Head of Department, ICT & Informatics", department: "ICT & Informatics", photo: "" },
  { name: "Pricillah Muriithi", title: "Trainer, ICT & Informatics", department: "ICT & Informatics", photo: "" },
  { name: "Grace Wambugu", title: "Trainer, ICT & Informatics", department: "ICT & Informatics", photo: "" },
  { name: "Hildah Muchoki", title: "Trainer, ICT & Informatics", department: "ICT & Informatics", photo: "" },
  { name: "Evans Kaleke", title: "Trainer, ICT & Informatics", department: "ICT & Informatics", photo: "" },
  { name: "Susan Mwangi", title: "Building & Civil Department", department: "Building & Civil", photo: "" },
  { name: "Alex Matogo", title: "Sports Coordinator", department: "Institute Services", photo: U + "2026/05/WhatsApp-Image-2026-04-22-at-9.50.11-PM-300x200.jpeg" },
];

// People who have left — removed from the database when the sync runs.
const REMOVE = ["Rachel Kimani"];

const DRY = process.argv.includes("--dry-run");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36";
const ROOT = process.env.UPLOAD_DIR || path.join(process.cwd(), "storage", "uploads");

async function tryGet(url: string): Promise<Buffer | null> {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) });
      if (r.ok) return Buffer.from(await r.arrayBuffer());
      if (r.status === 404) return null;
    } catch {
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  return null;
}

async function savePhoto(p: P): Promise<string> {
  if (!p.photo) return "";
  const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const ext = (path.extname(new URL(p.photo).pathname) || ".jpg").toLowerCase();
  const buf = (await tryGet(originalImage(p.photo))) || (await tryGet(p.photo));
  if (!buf) {
    console.warn(`  ! photo not downloaded for ${p.name} — keeping the old-site link`);
    return p.photo;
  }
  await mkdir(path.join(ROOT, "staff"), { recursive: true });
  await writeFile(path.join(ROOT, "staff", `${slug}${ext}`), buf);
  return `/uploads/staff/${slug}${ext}`;
}

async function main() {
  if (DRY) {
    for (const p of PEOPLE) console.log(`  ${p.department.padEnd(26)} ${p.name} — ${p.title}`);
    console.log(`\nWould remove: ${REMOVE.join(", ")}\nDry run: nothing written.`);
    return;
  }
  const { sql, ensureSchema, closeDb } = await import("../lib/db");
  const { staff } = await import("../lib/repo");
  await ensureSchema();
  for (const name of REMOVE) {
    const gone = await sql`DELETE FROM staff WHERE lower(name) = ${name.toLowerCase()} RETURNING id`;
    if (gone.length) console.log(`  - removed ${name}`);
  }
  const existing = (await staff.listAll()) as { id: string; name: string }[];
  let added = 0, updated = 0;
  for (const p of PEOPLE) {
    const photo = await savePhoto(p);
    const match = existing.find((e) => e.name.trim().toLowerCase() === p.name.toLowerCase());
    if (match) {
      await sql`UPDATE staff SET title = ${p.title}, department = ${p.department}, photo_url = CASE WHEN ${photo}::text <> '' THEN ${photo}::text ELSE photo_url END WHERE id = ${match.id}`;
      updated++;
    } else {
      await staff.create({ name: p.name, title: p.title, department: p.department, photoUrl: photo });
      added++;
    }
    console.log(`  ${match ? "~" : "+"} ${p.name}`);
  }
  console.log(`\nDone: ${added} added, ${updated} updated.`);
  await closeDb();
}
main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
