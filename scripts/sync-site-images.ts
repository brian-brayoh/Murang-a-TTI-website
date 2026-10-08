// Downloads the old-site photos used by the Home hero and the Academics/Courses
// pages into your uploads folder, so they keep working after the old site goes
// away. Safe to re-run.   npm run images:sync
import "./env";
import { mkdir, writeFile, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { originalImage } from "../lib/wp-migrate";

const OLD = "https://murangatech.ac.ke/wp-content/uploads/";
const ROOT = process.env.UPLOAD_DIR || path.join(process.cwd(), "storage", "uploads");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36";

async function get(url: string): Promise<Buffer | null> {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) });
      if (r.ok) return Buffer.from(await r.arrayBuffer());
      if (r.status === 404) return null;
    } catch {
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  return null;
}

async function main() {
  const files = ["components/HeroSlider.tsx", "lib/academics.ts"];
  const rels = new Set<string>();
  for (const f of files) {
    const text = await readFile(f, "utf8");
    for (const m of text.matchAll(/\$\{BASE\}\/([^`'"]+)/g)) rels.add(m[1]);
  }
  let saved = 0, skipped = 0, failed = 0;
  for (const rel of rels) {
    const dest = path.join(ROOT, "migrated", rel);
    if (await stat(dest).then(() => true, () => false)) { skipped++; continue; }
    const buf = (await get(originalImage(OLD + rel))) || (await get(OLD + rel));
    if (!buf) { console.warn(`  ! could not download ${rel}`); failed++; continue; }
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, buf);
    saved++;
    console.log(`  + ${rel}`);
  }
  console.log(`\nDone: ${saved} downloaded, ${skipped} already there, ${failed} failed (${rels.size} photos).`);
}
main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
