// Registers every file already in your uploads folder (migrated old-site files,
// gallery, staff photos, documents) in the Media Library so the admin can find
// and reuse them. Safe to re-run.   npm run media:index
import "./env";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = process.env.UPLOAD_DIR || path.join(process.cwd(), "storage", "uploads");
const EXT: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif",
  ".pdf": "application/pdf", ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel", ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint", ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".zip": "application/zip", ".csv": "text/csv",
};

async function* walk(dir: string): AsyncGenerator<string> {
  for (const e of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

async function main() {
  const { media } = await import("../lib/repo");
  const { closeDb } = await import("../lib/db");
  let n = 0;
  for await (const file of walk(ROOT)) {
    const mime = EXT[path.extname(file).toLowerCase()];
    if (!mime) continue;
    const rel = path.relative(ROOT, file).split(path.sep).join("/");
    // skip WordPress thumbnails like name-300x225.jpg when the full-size exists next to it
    if (/-\d{2,4}x\d{2,4}\.[a-z]+$/i.test(rel)) continue;
    const size = (await stat(file)).size;
    await media.add({ url: `/uploads/${rel.split("/").map(encodeURIComponent).join("/")}`, filename: path.basename(file), mime, size });
    n++;
  }
  console.log(`Indexed ${n} files in the Media Library.`);
  await closeDb();
}
main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
