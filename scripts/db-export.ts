// Exports the whole database (+ uploaded files) into one zip you can carry to
// another host.   npm run db:export     ->  mtti-backup-YYYY-MM-DD.zip
// The zip contains admin password HASHES and applications/inquiries (personal
// data): keep it private and delete it after the move.
import "./env";
import { mkdir, writeFile, cp, rm, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { rawQuery, ensureSchema, closeDb } from "../lib/db";
import { TABLES } from "./db-tables";

const UPLOAD_ROOT = process.env.UPLOAD_DIR || path.join(process.cwd(), "storage", "uploads");

async function main() {
  await ensureSchema();
  const stamp = new Date().toISOString().slice(0, 10);
  const dir = path.join(process.cwd(), `backup-${stamp}`);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });

  const tables: Record<string, unknown[]> = {};
  for (const t of TABLES) {
    const rows = await rawQuery(`SELECT * FROM ${t}`);
    tables[t] = rows.map((r) => JSON.parse(JSON.stringify(r))); // Dates -> ISO strings
    console.log(`  ${t.padEnd(16)} ${rows.length} rows`);
  }
  await writeFile(path.join(dir, "data.json"), JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), tables }, null, 2));

  try {
    await stat(UPLOAD_ROOT);
    await cp(UPLOAD_ROOT, path.join(dir, "uploads"), { recursive: true });
    console.log(`  uploads copied from ${UPLOAD_ROOT}`);
  } catch {
    console.log("  (no uploads folder found — skipping files)");
  }

  const zip = path.join(process.cwd(), `mtti-backup-${stamp}.zip`);
  await rm(zip, { force: true });
  const r =
    process.platform === "win32"
      ? spawnSync("tar", ["-a", "-c", "-f", zip, "-C", dir, "."], { stdio: "inherit" })
      : spawnSync("zip", ["-qr", zip, "."], { cwd: dir, stdio: "inherit" });
  if (r.status !== 0) {
    console.log(`\nCould not zip automatically. Zip the folder yourself: ${dir}`);
  } else {
    await rm(dir, { recursive: true, force: true });
    console.log(`\nCreated ${zip}`);
  }
}
main().then(closeDb).catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
