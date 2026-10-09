// Loads the OFFICIAL MTTI course list (the institute's "Courses offered" poster)
// into the course table: one row per course per level, published.
//
//   npm run courses:sync -- --dry-run      # show what would change, write nothing
//   npm run courses:sync                   # add missing courses, publish them
//   npm run courses:sync -- --hide-others  # also unpublish courses that are NOT on the poster
//
// Safe to re-run. It never deletes anything and never overwrites text you edited in
// the admin: for a course that already exists it only publishes it and fills in
// blank duration / entry / examining-body fields.
import "./env";

const BC = "Building & Civil";
const ME = "Mechanical Engineering";
const BU = "Business & Entrepreneurship";
const ICT = "ICT & Informatics";
const HO = "Hospitality Management";
const AG = "Agriculture";
const EE = "Electrical & Electronics";
const AS = "Applied Sciences";
const G = "(Grade I, II & III)";

// [department, course name, levels]. Level 3 also carries the "Grade I, II & III" trade-test courses.
const POSTER: [string, string, number[]][] = [
  // Building & Civil Engineering
  [BC, "Civil Engineering", [5, 6]],
  [BC, "Building Technician", [5, 6]],
  [BC, "Quantity Survey", [5, 6]],
  [BC, "Architectural Technology", [5, 6]],
  [BC, "Architectural Draftsmanship", [6]],
  [BC, "Plumbing", [3, 4, 5]],
  [BC, "Carpentry and Joinery", [4, 5]],
  [BC, `Plumbing ${G}`, [3]],
  [BC, `Masonry ${G}`, [3]],
  // Mechanical Engineering
  [ME, "Mechanical Technology (Production Option)", [5, 6]],
  [ME, "Automotive Engineering", [4, 5, 6]],
  [ME, "Welding and Fabrication", [4, 5, 6]],
  [ME, "Mechanical Production (Milling and Fabrication)", [4]],
  [ME, `Motor Vehicle Mechanics ${G}`, [3]],
  [ME, "Autobody Technology", [6]],
  // Business & Management Studies
  [BU, "Business Administration", [5, 6]],
  [BU, "Business Management", [5, 6]],
  [BU, "Supply Chain Management", [5, 6]],
  [BU, "Accountancy", [5, 6]],
  [BU, "Office Administration", [5, 6]],
  [BU, "Office Assistance", [4, 5]],
  // Information, Communication Technology (ICT)
  [ICT, "Information Communication Technology", [5, 6]],
  [ICT, "Computer Science", [6]],
  [ICT, "Cyber Security", [5, 6]],
  [ICT, `Computer Operator ${G}`, [3]],
  // Hospitality and Tourism
  [HO, "Tourism and Travel Management", [5, 6]],
  [HO, "Tour Guide", [5]],
  [HO, "Food Technology", [5, 6]],
  [HO, "Food and Beverage Production (Culinary Arts)", [4, 5, 6]],
  [HO, "Housekeeping and Accommodation", [4, 5, 6]],
  [HO, "Beauty Therapy", [3, 4, 5, 6]],
  [HO, "Hair Dressing", [3, 4, 5, 6]],
  [HO, "Fashion Design", [3, 4, 5, 6]],
  [HO, `Hair Dressing and Beauty Therapy ${G}`, [3]],
  [HO, "Pastry Cook", [4]],
  // General Agriculture
  [AG, "Agricultural Extension", [4, 5, 6]],
  [AG, "Horticulture Nursery Management", [4, 5, 6]],
  [AG, "Sustainable Agriculture for Rural Development", [5]],
  [AG, "Agripreneurship", [4, 5, 6]],
  // Electrical & Electronics Engineering
  [EE, "Electrical Engineering/Installation", [6]],
  [EE, "Electronics", [4, 5, 6]],
  [EE, "Refrigeration and Air Conditioning", [4, 5, 6]],
  [EE, "Electrical Engineering", [6]],
  [EE, "Electrical Installation", [4, 5, 6]],
  [EE, "Medical Engineering", [5, 6]],
  [EE, "Electrical Operation", [5]],
  [EE, `Electrical Wireman ${G}`, [3]],
  // Applied Sciences
  [AS, "Applied Biology", [5, 6]],
  [AS, "Science Laboratory Technology", [5, 6]],
];

// Duration / entry / examiner the old murangatech.ac.ke site published (filled only where blank).
const DETAILS: Record<string, { duration?: string; entry?: string; examBody?: string }> = {
  "Civil Engineering|6": { duration: "3 years", entry: "KCSE C- and above", examBody: "KNEC" },
  "Civil Engineering|5": { duration: "2 years", entry: "KCSE mean grade D and above", examBody: "CDACC" },
  "Building Technician|6": { duration: "3 years", entry: "KCSE C- and above", examBody: "CDACC" },
  "Building Technician|5": { duration: "3 years", entry: "KCSE and above", examBody: "CDACC" },
  "Carpentry and Joinery|5": { duration: "2 years", entry: "KCSE mean grade D and above", examBody: "CDACC" },
  "Carpentry and Joinery|4": { duration: "1 year", entry: "KCSE", examBody: "CDACC" },
  "Plumbing|5": { duration: "2 years", entry: "KCSE mean grade D and above", examBody: "CDACC" },
  "Information Communication Technology|6": { duration: "3 years", entry: "KCSE C- (minus) and above", examBody: "KNEC" },
  "Information Communication Technology|5": { duration: "2 years", entry: "KCSE D (plain) and above", examBody: "KNEC" },
  "Cyber Security|6": { duration: "3 years", entry: "KCSE C- (minus) and above", examBody: "CDACC" },
};

// Old-site names -> poster names (a rename keeps whatever details were already saved).
const RENAMES: { dept: string; from: string; to: string; levels: number[] }[] = [
  { dept: ICT, from: "Diploma in ICT", to: "Information Communication Technology", levels: [6] },
  { dept: ICT, from: "Certificate in IT", to: "Information Communication Technology", levels: [5] },
  { dept: BC, from: "Plumber", to: "Plumbing", levels: [5] },
  { dept: ME, from: "Automotive Technician", to: "Automotive Engineering", levels: [4] },
  { dept: ME, from: "Mechanical Production Technician", to: "Mechanical Technology (Production Option)", levels: [5, 6] },
];

const DRY = process.argv.includes("--dry-run");
const HIDE = process.argv.includes("--hide-others");
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

async function main() {
  const wanted = POSTER.flatMap(([department, name, levels]) => levels.map((level) => ({ department, name, level })));
  const wantedKeys = new Set(wanted.map((c) => `${norm(c.name)}|${c.department}|${c.level}`));
  console.log(`Poster: ${POSTER.length} courses, ${wanted.length} course-level rows.`);

  const { sql, ensureSchema, closeDb } = await import("../lib/db");
  const { courses } = await import("../lib/repo");
  await ensureSchema();

  type Row = { id: string; name: string; department: string; level: number; published: boolean; duration: string; entry: string; exam_body: string };
  let rows = (await sql`SELECT id, name, department, level, published, duration, entry, exam_body FROM course`) as Row[];
  const find = (name: string, department: string, level: number) =>
    rows.find((r) => norm(r.name) === norm(name) && r.department === department && r.level === level);

  let renamed = 0, added = 0, published = 0, filled = 0;

  for (const rn of RENAMES) {
    for (const level of rn.levels) {
      const old = find(rn.from, rn.dept, level);
      if (old && !find(rn.to, rn.dept, level)) {
        console.log(`  rename  L${level} ${rn.dept}: "${rn.from}" -> "${rn.to}"`);
        if (!DRY) await sql`UPDATE course SET name = ${rn.to} WHERE id = ${old.id}`;
        old.name = rn.to; // also in a dry run, so the report below is accurate
        renamed++;
      }
    }
  }

  for (const c of wanted) {
    const d = DETAILS[`${c.name}|${c.level}`] || {};
    const row = find(c.name, c.department, c.level);
    if (!row) {
      console.log(`  add     L${c.level} ${c.department}: ${c.name}`);
      if (!DRY) await courses.create({ ...c, summary: "", duration: d.duration, entry: d.entry, examBody: d.examBody, published: true });
      added++;
      continue;
    }
    if (!row.published) {
      published++;
      if (!DRY) await sql`UPDATE course SET published = TRUE WHERE id = ${row.id}`;
    }
    if ((!row.duration && d.duration) || (!row.entry && d.entry) || (!row.exam_body && d.examBody)) {
      filled++;
      if (!DRY)
        await sql`UPDATE course SET duration = ${row.duration || d.duration || ""}, entry = ${row.entry || d.entry || ""},
                  exam_body = ${row.exam_body || d.examBody || ""} WHERE id = ${row.id}`;
    }
  }

  if (!DRY) rows = (await sql`SELECT id, name, department, level, published, duration, entry, exam_body FROM course`) as Row[];
  const others = rows.filter((r) => !wantedKeys.has(`${norm(r.name)}|${r.department}|${r.level}`));
  if (others.length) {
    console.log(`\nIn your list but NOT on the poster (${others.length}):`);
    for (const r of others) console.log(`  ${r.published ? "published" : "draft    "}  L${r.level} ${r.department}: ${r.name}`);
    if (HIDE && !DRY) {
      await sql`UPDATE course SET published = FALSE WHERE id = ANY(${others.map((o) => o.id)})`;
      console.log("  -> unpublished (use Admin > Courses > Publish to bring any back).");
    } else if (!HIDE) {
      console.log("  Left as they are. Re-run with --hide-others to unpublish them.");
    }
  }

  console.log(`\n${DRY ? "DRY RUN, nothing written. Would: " : "Done: "}${added} added, ${renamed} renamed, ${published} re-published, ${filled} details filled.`);
  await closeDb();
}
main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
