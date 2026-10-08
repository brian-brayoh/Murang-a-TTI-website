// Collects the photos from each old department page, downloads them into your
// uploads folder and writes lib/dept-photos.json, which /courses/<department>
// uses for its photo strip. Safe to re-run.   npm run dept:photos
import "./env";
import { mkdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { extractImages } from "../lib/wp-migrate";

const SITE = "https://murangatech.ac.ke";
const ROOT = process.env.UPLOAD_DIR || path.join(process.cwd(), "storage", "uploads");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36";

// department id -> old pages that describe it
const PAGES: Record<string, string[]> = {
  agriculture: ["agriculture-department"],
  business: ["business-department"],
  building: ["offered-programmes"],
  electrical: ["course-offered"],
  hospitality: ["department-values"],
  ict: ["our-programs", "our-program"],
  mechanical: ["insight-from-the-hod-mechanical-department"],
};

const SKIP = /(logo|favicon|cropped|icon|banner|avatar|tvet|safaricom|partner)/i;

async function getBuf(url: string): Promise<Buffer | null> {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) });
      if (r.ok) return Buffer.from(await r.arrayBuffer());
      if (r.status === 404) return null;
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    } catch {
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  return null;
}

async function main() {
  const out: Record<string, { src: string; alt: string }[]> = {};
  for (const [id, slugs] of Object.entries(PAGES)) {
    out[id] = [];
    const seen = new Set<string>();
    for (const slug of slugs) {
      const buf = await getBuf(`${SITE}/${slug}/`);
      if (!buf) { console.warn(`  ! ${slug}: page not reachable`); continue; }
      const html = buf.toString("utf8");
      // alt text by file name, for nicer captions
      const alts = new Map<string, string>();
      for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
        const src = /\bsrc=["']([^"']+)["']/i.exec(m[0])?.[1] || "";
        const alt = /\balt=["']([^"']*)["']/i.exec(m[0])?.[1] || "";
        if (src) alts.set(src.split("/").pop()!.replace(/-\d+x\d+(?=\.)/, "").toLowerCase(), alt);
      }
      for (const url of extractImages(html, SITE)) {
        const m = /\/wp-content\/uploads\/(.+)$/.exec(url);
        if (!m || SKIP.test(m[1])) continue;
        const rel = decodeURIComponent(m[1].split("?")[0]);
        if (seen.has(rel)) continue;
        seen.add(rel);
        const dest = path.join(ROOT, "migrated", rel);
        if (!(await stat(dest).then(() => true, () => false))) {
          const img = await getBuf(url);
          if (!img || img.length < 8000) { if (img) console.log(`  - skipped tiny ${rel}`); continue; }
          await mkdir(path.dirname(dest), { recursive: true });
          await writeFile(dest, img);
        }
        const alt = alts.get(rel.split("/").pop()!.toLowerCase()) || "";
        out[id].push({ src: `/uploads/migrated/${rel}`, alt: alt.replace(/[-_]+/g, " ").trim() });
        console.log(`  + ${id}: ${rel}`);
      }
    }
  }
  await writeFile(path.join("lib", "dept-photos.json"), JSON.stringify(out, null, 2) + "\n");
  const n = Object.values(out).reduce((a, l) => a + l.length, 0);
  console.log(`\nDone: ${n} photos across ${Object.keys(out).length} departments.`);
}
main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
