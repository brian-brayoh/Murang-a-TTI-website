// Copies everything in storage/uploads (or UPLOAD_DIR) to Vercel Blob so a
// Vercel deployment can serve the migrated photos. Safe to re-run.
//   PowerShell:  $env:BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."; npm run blob:push
import "./env";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

const ROOT = process.env.UPLOAD_DIR || path.join(process.cwd(), "storage", "uploads");
const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".gif": "image/gif", ".webp": "image/webp",
  ".pdf": "application/pdf", ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".zip": "application/zip", ".csv": "text/csv",
};

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("Set BLOB_READ_WRITE_TOKEN first (Vercel → Storage → your Blob store → .env.local tab).");
    process.exit(1);
  }
  const files = await walk(ROOT);
  console.log(`Uploading ${files.length} files from ${ROOT} ...`);
  let done = 0, skipped = 0, failed = 0;
  const queue = [...files];
  async function worker() {
    for (let f = queue.shift(); f; f = queue.shift()) {
      const rel = path.relative(ROOT, f).split(path.sep).join("/");
      const type = TYPES[path.extname(f).toLowerCase()];
      if (!type) { skipped++; continue; }
      try {
        await put(`uploads/${rel}`, await readFile(f), { access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: type });
        if (++done % 25 === 0) console.log(`  ${done}/${files.length}`);
      } catch (e) {
        failed++;
        console.error(`  failed: ${rel}: ${(e as Error).message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker));
  console.log(`Done. uploaded ${done}, skipped ${skipped}, failed ${failed}.`);
  if (failed) process.exit(1);
}
main();
