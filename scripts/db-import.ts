// Loads a zip/folder made by `npm run db:export` into the database that
// DATABASE_URL points at (e.g. HostPinnacle Postgres). Safe to re-run: rows
// that already exist (same id / key) are left alone.
//   npm run db:import -- mtti-backup-2026-10-07.zip
import "./env";
import { readFile, mkdir, cp, stat, mkdtemp } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { rawQuery, ensureSchema, closeDb } from "../lib/db";
import { TABLES } from "./db-tables";

const UPLOAD_ROOT = process.env.UPLOAD_DIR || path.join(process.cwd(), "storage", "uploads");
const COL = /^[a-z_][a-z0-9_]*$/;

async function main() {
  const src = process.argv.slice(2).find((a) => !a.startsWith("--"));
  if (!src) throw new Error("Usage: npm run db:import -- <backup.zip | backup-folder>");
  let dir = path.resolve(src);
  if (dir.toLowerCase().endsWith(".zip")) {
    const tmp = await mkdtemp(path.join(os.tmpdir(), "mtti-import-"));
    const r = process.platform === "win32" ? spawnSync("tar", ["-xf", dir, "-C", tmp], { stdio: "inherit" }) : spawnSync("unzip", ["-q", dir, "-d", tmp], { stdio: "inherit" });
    if (r.status !== 0) throw new Error("Could not unzip the backup. Extract it manually and pass the folder instead.");
    dir = tmp;
  }
  const data = JSON.parse(await readFile(path.join(dir, "data.json"), "utf8")) as { tables: Record<string, Record<string, unknown>[]> };

  await ensureSchema(); // creates tables on the new database
  for (const t of TABLES) {
    const rows = data.tables[t] || [];
    let added = 0;
    for (const row of rows) {
      const cols = Object.keys(row);
      if (!cols.every((c) => COL.test(c))) throw new Error(`Bad column name in ${t}`);
      const vals = cols.map((c) => row[c]);
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
      const res = await rawQuery(
        `INSERT INTO ${t} (${cols.join(", ")}) VALUES (${placeholders}) ON CONFLICT DO NOTHING RETURNING 1`,
        vals
      );
      added += res.length;
    }
    console.log(`  ${t.padEnd(16)} ${added} added, ${rows.length - added} already there`);
  }

  try {
    await stat(path.join(dir, "uploads"));
    await mkdir(UPLOAD_ROOT, { recursive: true });
    await cp(path.join(dir, "uploads"), UPLOAD_ROOT, { recursive: true });
    console.log(`  uploads restored to ${UPLOAD_ROOT}`);
  } catch {
    console.log("  (backup has no uploads)");
  }
  console.log("\nImport complete.");
}
main().then(closeDb).catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
