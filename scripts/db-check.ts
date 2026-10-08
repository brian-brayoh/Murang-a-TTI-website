// Shows what is in the database the website is actually using, and what to run if something is empty.
//   npm run db:check
import "./env";
import { sql } from "../lib/db";
import { ensureSchema } from "../lib/db";

async function n(q: Promise<unknown>) {
  const r = (await q) as { c: number | string }[];
  return Number(r[0]?.c ?? 0);
}

async function main() {
  const url = process.env.DATABASE_URL || "";
  const where = /neon\.tech/.test(url) ? "Neon (online)" : /localhost|127\.0\.0\.1/.test(url) ? "your computer (local Postgres)" : "another server";
  console.log(`\nDatabase: ${where}  ${url.replace(/:\/\/[^@]*@/, "://***@")}\n`);
  await ensureSchema();
  const rows = {
    "Courses published": await n(sql`SELECT count(*) AS c FROM course WHERE published = TRUE`),
    "Courses draft (hidden)": await n(sql`SELECT count(*) AS c FROM course WHERE published = FALSE`),
    Staff: await n(sql`SELECT count(*) AS c FROM staff`),
    "Gallery photos": await n(sql`SELECT count(*) AS c FROM gallery_photo`),
    "News posts": await n(sql`SELECT count(*) AS c FROM post`),
    Notices: await n(sql`SELECT count(*) AS c FROM notice`),
    "Admin users": await n(sql`SELECT count(*) AS c FROM admin_user`),
  };
  for (const [k, v] of Object.entries(rows)) console.log(`  ${k.padEnd(24)} ${v}`);
  console.log("");
  if (rows["Courses published"] === 0 && rows["Courses draft (hidden)"] > 0) console.log("-> Courses exist but are drafts. In the admin: Courses > Publish all drafts.");
  if (rows["Courses published"] === 0 && rows["Courses draft (hidden)"] === 0) console.log("-> No courses at all. Run:  npm run courses:sync");
  if (rows.Staff === 0) console.log("-> No staff. Run:  npm run staff:sync");
  if (rows["Gallery photos"] === 0) console.log("-> No gallery. Run:  npm run gallery:sync");
  if (rows["News posts"] === 0) console.log("-> No news. Run:  npm run migrate");
  if (rows["Admin users"] === 0) console.log("-> No admin user. Run:  npm run admin:password");
  console.log("");
  process.exit(0);
}
main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
