// Loads the programmes that are published on murangatech.ac.ke into the
// course table, with duration / entry / examining body where the old site
// lists them. Safe to re-run: courses are matched by name + department + level.
//   npm run courses:sync -- --dry-run
//   npm run courses:sync                  # add/update real courses
//   npm run courses:sync -- --clear-drafts   # also delete the unconfirmed draft courses
//
// Sources (checked 7 Oct 2026, old site pages): ICT, Building & Civil, Mechanical
// Engineering and Electrical & Electronics. Agriculture, Business and Hospitality
// have no course list on the old site, so none are loaded for them.
import "./env";

type C = { name: string; department: string; level: number; summary?: string; duration?: string; entry?: string; examBody?: string };

const ICT = "ICT & Informatics";
const EE = "Electrical & Electronics";
const BC = "Building & Civil";
const ME = "Mechanical Engineering";

const COURSES: C[] = [
  // --- ICT & Informatics (old site table) ---
  { name: "ICT Technician", department: ICT, level: 6, duration: "3 years", entry: "KCSE C- (minus) and above", examBody: "CDACC" },
  { name: "ICT Technician", department: ICT, level: 5, duration: "2 years", entry: "KCSE D (plain) and above", examBody: "CDACC" },
  { name: "Diploma in ICT", department: ICT, level: 6, duration: "3 years", entry: "KCSE C- (minus) and above", examBody: "KNEC" },
  { name: "Cyber Security", department: ICT, level: 6, duration: "3 years", entry: "KCSE C- (minus) and above", examBody: "CDACC" },
  { name: "Certificate in IT", department: ICT, level: 5, duration: "2 years", entry: "KCSE D (plain) and above", examBody: "KNEC" },
  { name: "Library and Information Science", department: ICT, level: 6, duration: "3 years", entry: "KCSE C- (minus) and above", examBody: "CDACC" },
  { name: "Computer Packages", department: ICT, level: 3, duration: "3 months", entry: "KCSE certificate", examBody: "Internal" },
  // --- Building & Civil (old "offered-programmes" table; fee there: KES 67,189 per year) ---
  { name: "Civil Engineering", department: BC, level: 6, duration: "3 years", entry: "KCSE C- and above", examBody: "KNEC" },
  { name: "Civil Engineering", department: BC, level: 5, duration: "2 years", entry: "KCSE mean grade D and above", examBody: "CDACC" },
  { name: "Building Technician", department: BC, level: 6, duration: "3 years", entry: "KCSE C- and above", examBody: "CDACC" },
  { name: "Building Technician", department: BC, level: 5, duration: "3 years", entry: "KCSE and above", examBody: "CDACC" },
  { name: "Carpentry and Joinery", department: BC, level: 5, duration: "2 years", entry: "KCSE mean grade D and above", examBody: "CDACC" },
  { name: "Carpentry and Joinery", department: BC, level: 4, duration: "1 year", entry: "KCSE", examBody: "CDACC" },
  { name: "Plumber", department: BC, level: 5, duration: "2 years", entry: "KCSE mean grade D and above", examBody: "CDACC" },
  // --- Mechanical Engineering (old HOD page lists names and levels only) ---
  { name: "Automotive Engineering", department: ME, level: 6 },
  { name: "Automotive Engineering", department: ME, level: 5 },
  { name: "Automotive Technician", department: ME, level: 4 },
  { name: "Mechanical Production Technician", department: ME, level: 6 },
  { name: "Mechanical Production Technician", department: ME, level: 5 },
  // --- Electrical & Electronics (old "Course Offered" page) ---
  { name: "Electrical and Electronics Technology (Artisan)", department: EE, level: 4, summary: "Basic wiring techniques, safety protocols and an introduction to electronic components." },
  { name: "Electrical and Electronics Technology (Craft)", department: EE, level: 5, summary: "Electrical measurements, domestic and commercial wiring, and basic troubleshooting." },
  { name: "Electrical and Electronics Engineering", department: EE, level: 6, summary: "Industrial automation, advanced circuit analysis and programmable logic controllers (PLCs)." },
];

const DRY = process.argv.includes("--dry-run");
const CLEAR = process.argv.includes("--clear-drafts");

async function main() {
  if (DRY) {
    for (const c of COURSES) console.log(`  L${c.level} ${c.department.padEnd(26)} ${c.name}${c.duration ? ` (${c.duration})` : ""}`);
    console.log(`\n${COURSES.length} courses${CLEAR ? "; would also delete all unpublished drafts" : ""}. Dry run: nothing written.`);
    return;
  }
  const { sql, ensureSchema, closeDb } = await import("../lib/db");
  const { courses } = await import("../lib/repo");
  await ensureSchema();
  if (CLEAR) {
    const gone = await sql`DELETE FROM course WHERE published = FALSE RETURNING id`;
    console.log(`  - deleted ${gone.length} unconfirmed draft courses`);
  }
  let added = 0, updated = 0;
  for (const c of COURSES) {
    const found = await sql`SELECT id FROM course WHERE name = ${c.name} AND department = ${c.department} AND level = ${c.level} LIMIT 1`;
    if (found[0]) {
      await sql`UPDATE course SET summary = ${c.summary || ""}, duration = ${c.duration || ""}, entry = ${c.entry || ""},
                exam_body = ${c.examBody || ""}, published = TRUE WHERE id = ${found[0].id as string}`;
      updated++;
    } else {
      await courses.create({ ...c, published: true });
      added++;
    }
  }
  console.log(`Done: ${added} added, ${updated} updated.`);
  await closeDb();
}
main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
