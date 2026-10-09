// Removes the KNEC, HELB and KATTI logos from the photo gallery (they now live in
// the scrolling partners strip). Safe to re-run.
//   npm run partners:setup
import "./env";

async function main() {
  const { sql, ensureSchema, closeDb } = await import("../lib/db");
  await ensureSchema();
  const rows = await sql`
    DELETE FROM gallery_photo
    WHERE url ILIKE '%/knec.%' OR url ILIKE '%/katti.%' OR url ILIKE '%/helb-loan.%' OR url ILIKE '%/kuccps.%'
    RETURNING url`;
  console.log(rows.length ? rows.map((r) => `  - removed ${r.url}`).join("\n") : "  Nothing to remove.");
  console.log(`\nDone: ${rows.length} logo(s) removed from the gallery. The image files are kept (the partners strip uses them).`);
  await closeDb();
}
main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
