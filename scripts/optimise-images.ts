// Shrinks the photos already in your uploads folder (migrated old-site photos, gallery,
// staff, media). Originals are copied to <uploads>/../originals-backup first, so nothing
// is lost. Safe to re-run.
//   npm run images:optimise -- --dry-run   # report only
//   npm run images:optimise
import "./env";
import { readdir, readFile, writeFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { optimiseImage, MAX_EDGE } from "../lib/image-optimise";

const DRY = process.argv.includes("--dry-run");
const ROOT = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), "storage", "uploads"));
const BACKUP = path.join(path.dirname(ROOT), "originals-backup");
const MIME: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
const MIN_BYTES = 250 * 1024; // leave small files alone

async function* walk(dir: string): AsyncGenerator<string> {
  for (const e of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

const mb = (n: number) => (n / 1048576).toFixed(1) + " MB";

async function main() {
  let before = 0, after = 0, changed = 0, seen = 0;
  for await (const file of walk(ROOT)) {
    const mime = MIME[path.extname(file).toLowerCase()];
    if (!mime) continue;
    const size = (await stat(file)).size;
    seen++;
    if (size < MIN_BYTES) continue;
    const input = await readFile(file);
    const meta = await sharp(input, { failOn: "none" }).metadata().catch(() => null);
    const out = await optimiseImage(input, mime);
    if (out.length >= input.length * 0.9) continue; // not worth touching
    before += input.length;
    after += out.length;
    changed++;
    const rel = path.relative(ROOT, file);
    console.log(`  ${DRY ? "would shrink" : "shrunk"} ${rel}  ${mb(input.length)} -> ${mb(out.length)}${meta && (meta.width || 0) > MAX_EDGE ? `  (${meta.width}px wide)` : ""}`);
    if (!DRY) {
      const bak = path.join(BACKUP, rel);
      await mkdir(path.dirname(bak), { recursive: true });
      await writeFile(bak, input);
      await writeFile(file, out);
    }
  }
  console.log(`\n${seen} photos checked, ${changed} ${DRY ? "can be" : ""} optimised. ${mb(before)} -> ${mb(after)} (saved ${mb(before - after)}).`);
  if (!DRY && changed) console.log(`Originals are in ${BACKUP}`);
}
main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
