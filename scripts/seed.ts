import "./env";
import bcrypt from "bcryptjs";
import { posts, notices, timetables, tenders, jobs, staff, courses, documents, settings, tasks, adminUsers } from "../lib/repo";

// Demo content (sample news, notices, timetables, tenders, jobs, fee PDF) is
// placeholder text. It is only seeded with --demo; real content comes from
// `npm run migrate`.
const DEMO = process.argv.includes("--demo");

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@murangatech.ac.ke";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";

  if (!(await adminUsers.findByEmail(email))) {
    const passwordHash = await bcrypt.hash(password, 10);
    await adminUsers.create({ email, passwordHash, name: process.env.ADMIN_NAME || "", role: "admin" });
    console.log(`Admin user created: ${email}`);
  } else {
    console.log(`Admin user already exists: ${email}`);
  }

  if (DEMO && (await posts.listAll()).length === 0) {
    const seedPosts = [
      {
        title: "World Environmental Day Commemoration",
        excerpt:
          "MTTI trainees and staff marked World Environment Day with a tree-planting drive at Maliki Dam in Maragua Sub-County.",
        body: "Full story coming soon.",
      },
      {
        title: "Environment Conservation: 4,000 Trees Challenge at Kiambicho Forest",
        excerpt:
          "The institute joined the county-wide conservation push with a large-scale tree-planting exercise at Kiambicho Forest.",
        body: "Full story coming soon.",
      },
      {
        title: "May Intake 2026",
        excerpt:
          "Applications for the May intake are open across all seven departments. Apply online or report in person.",
        body: "Full story coming soon.",
      },
      {
        title: "Updated Admission Letter & Fee Structure",
        excerpt:
          "A revised admission letter template and fee structure are now available under Downloads.",
        body: "Full story coming soon.",
      },
    ];
    for (const p of seedPosts) await posts.create(p);
    console.log(`Seeded ${seedPosts.length} posts`);
  }

  if (DEMO && (await notices.listAll()).length === 0) {
    const seedNotices = [
      {
        title: "Fee balance clearance deadline",
        body: "All trainees must clear at least 60% of fees before sitting end-of-term assessments.",
      },
      {
        title: "Library extended hours during exam period",
        body: "The library will open 7:00am\u20138:00pm on weekdays through the assessment period.",
      },
      {
        title: "Change of workshop reporting time",
        body: "Mechanical and Building & Civil workshops now open at 7:30am, effective this term.",
      },
    ];
    for (const n of seedNotices) await notices.create(n);
    console.log(`Seeded ${seedNotices.length} notices`);
  }

  if (DEMO && (await timetables.listAll()).length === 0) {
    const seedTimetables = [
      { department: "Electrical & Electronics", level: "Level 5", dateRange: "Oct 6\u201310, 2026" },
      { department: "ICT & Informatics", level: "Level 6", dateRange: "Oct 13\u201317, 2026" },
      { department: "Mechanical Engineering", level: "Level 5", dateRange: "Oct 20\u201324, 2026" },
      { department: "Building & Civil", level: "Level 4", dateRange: "Oct 27\u201331, 2026" },
    ];
    for (const t of seedTimetables) await timetables.create(t);
    console.log(`Seeded ${seedTimetables.length} exam timetables`);
  }

  if (DEMO && (await tenders.listAll()).length === 0) {
    await tenders.create({ title: "Supply of workshop consumables \u2014 2026/2027" });
    console.log("Seeded 1 tender");
  }

  if (DEMO && (await jobs.listAll()).length === 0) {
    await jobs.create({ title: "Instructor, Electrical & Electronics" });
    await jobs.create({ title: "Accounts Assistant" });
    console.log("Seeded 2 job postings");
  }

  if ((await staff.listAll()).length === 0) {
    await staff.create({ name: "Prof. Peter Kagwanja", title: "Chairman, Board of Governors", department: "Administration" });
    console.log("Seeded 1 staff (run `npm run staff:sync` for the full team)");
  }

  if ((await courses.listAll()).length === 0) {
    // VERIFIED: taken from MTTI's own "Course Offered" page. Published.
    const verified = [
      { name: "Electrical and Electronics Technology (Artisan)", department: "Electrical & Electronics", level: 4,
        summary: "Basic wiring techniques, safety protocols and an introduction to electronic components." },
      { name: "Electrical and Electronics Technology (Craft)", department: "Electrical & Electronics", level: 5,
        summary: "Electrical measurements, domestic and commercial wiring, and basic troubleshooting." },
      { name: "Electrical and Electronics Engineering", department: "Electrical & Electronics", level: 6,
        summary: "Industrial automation, advanced circuit analysis and programmable logic controllers (PLCs)." },
    ];
    for (const c of verified) await courses.create({ ...c, published: true });

    // STAGED AS DRAFTS: programme names drawn from a third-party KUCCPS
    // listing and matched to MTTI's confirmed departments. NOT published
    // until the registrar confirms them (Admin > Courses > Publish).
    const staged: [string, string, number][] = [
      ["Automotive Technician", "Mechanical Engineering", 4],
      ["Automotive Technician", "Mechanical Engineering", 5],
      ["Automotive Engineering", "Mechanical Engineering", 6],
      ["Mechanical Production Technology", "Mechanical Engineering", 6],
      ["Welding and Fabrication", "Mechanical Engineering", 5],
      ["Plumbing", "Building & Civil", 4],
      ["Plumbing", "Building & Civil", 5],
      ["Building Technology", "Building & Civil", 6],
      ["Civil Engineering", "Building & Civil", 6],
      ["Food and Beverage Production, Sales and Services", "Hospitality Management", 5],
      ["Food and Beverage Production (Culinary Arts)", "Hospitality Management", 6],
      ["Housekeeping and Accommodation", "Hospitality Management", 5],
      ["Fashion Design", "Hospitality Management", 5],
      ["ICT Technician", "ICT & Informatics", 6],
      ["Business Management", "Business & Entrepreneurship", 6],
      ["Supply Chain Management", "Business & Entrepreneurship", 6],
      ["Accountancy", "Business & Entrepreneurship", 6],
      ["Human Resource Management", "Business & Entrepreneurship", 6],
      ["Marketing", "Business & Entrepreneurship", 6],
      ["Agripreneurship", "Agriculture", 6],
      ["Agricultural Extension", "Agriculture", 6],
    ];
    const publishStaged = process.argv.includes("--publish-drafts");
    for (const [name, department, level] of DEMO ? staged : []) {
      await courses.create({ name, department, level, published: publishStaged });
    }
    console.log(
      `Seeded ${verified.length} verified + ${DEMO ? staged.length : 0} ${publishStaged ? "PUBLISHED (demo)" : "draft"} courses`
    );
  }

  if (DEMO && (await documents.listAll()).length === 0) {
    await documents.create({ title: "Fee structure (Sept 2023)", url: "https://murangatech.ac.ke/wp-content/uploads/2025/02/MURANGA-FEE-STRUCTURE-FROM-SEPT-2023.pdf", category: "Fees" });
    console.log("Seeded 1 document (add the rest in /admin/downloads)");
  }

  // Site stats default to reasonable placeholders; edit in /admin/settings.
  await settings.set({ courses_on_offer: "30+", trainees: "1200+", trainers: "60+", departments: "7" });

  if ((await tasks.listAll()).length === 0) {
    const seedTasks: { title: string; category: string }[] = [
      { title: "Confirm 0748 108 000 is correct and has WhatsApp", category: "Launch" },
      { title: "Set a real AUTH_SECRET and ADMIN_PASSWORD for production (not the .env.example defaults)", category: "Launch" },
      { title: "Download the hero slideshow photos locally (public/images/hero/) instead of loading them from murangatech.ac.ke", category: "Photos" },
      { title: "Add real gallery photos in /admin/gallery", category: "Photos" },
      { title: "Add staff photos (or confirm initials-avatar fallback is acceptable)", category: "Photos" },
      { title: "Download the fee structure PDF locally instead of linking the old site", category: "Content" },
      { title: "Add remaining downloads: service charter, RPL form, complaints form", category: "Content" },
      { title: "Add real staff beyond Kagwanja and Kimani: HODs, instructors, support staff", category: "Content" },
      { title: "Add Students' Council officials (department \"Students' Council\" in /admin/staff)", category: "Content" },
      { title: "Confirm BOG chairman and CEO names are still current", category: "Content" },
      { title: "Confirm course lists for Agriculture, Business, Building & Civil, Hospitality, ICT, Mechanical, then publish the drafts in /admin/courses", category: "Courses" },
      { title: "Replace placeholder homepage stats in /admin/settings with real figures", category: "Content" },
    ];
    for (const t of seedTasks) await tasks.create(t);
    console.log(`Seeded ${seedTasks.length} launch-checklist tasks`);
  }

  console.log("Seed complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
