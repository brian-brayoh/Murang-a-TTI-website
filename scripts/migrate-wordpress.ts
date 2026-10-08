// Imports real content from the old WordPress site into the new database.
//
//   npm run migrate:dry                      # fetch + classify, print a report, write nothing
//   npm run migrate                          # import for real (downloads media too)
//   npm run migrate -- --replace-placeholders   # first remove the demo content from the seed
//   npm run migrate -- --from-file=posts.json   # use a JSON file saved from the browser
//                                               # (when the old site's bot check blocks scripts)
//
// Flags: --dry-run  --base=URL  --no-media  --limit=N  --replace-placeholders  --from-file=PATH
import "./env";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { mapWpPost, extractFileLinks, originalImage, type Mapped, type WpPost, type FileLink } from "../lib/wp-migrate";

const args = process.argv.slice(2);
const flag = (n: string) => args.includes(`--${n}`);
const opt = (n: string) => args.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3);

const DRY = flag("dry-run");
const NO_MEDIA = flag("no-media");
const REPLACE = flag("replace-placeholders");
const BACKFILL = flag("backfill"); // add missing images/files to items imported earlier
const BASE = (opt("base") || "https://murangatech.ac.ke").replace(/\/$/, "");
const LIMIT = opt("limit") ? Number(opt("limit")) : Infinity;
const FROM_FILE = opt("from-file");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const UPLOAD_ROOT = process.env.UPLOAD_DIR || path.join(process.cwd(), "storage", "uploads");

// fetch() with retries; reports the underlying cause (DNS, timeout, TLS...)
// because Node only says "fetch failed".
async function fetchRetry(url: string, init: RequestInit = {}, tries = 5): Promise<Response> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fetch(url, { ...init, signal: AbortSignal.timeout(30000) });
    } catch (e) {
      last = e;
      const cause = (e as { cause?: { code?: string; message?: string } }).cause;
      console.warn(`  ! network error (${cause?.code || cause?.message || String(e)}) on ${url} — retry ${i + 1}/${tries}`);
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw last;
}

async function getJson(url: string): Promise<{ data: unknown; total?: number }> {
  const res = await fetchRetry(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  try {
    return { data: JSON.parse(text), total: Number(res.headers.get("x-wp-totalpages")) || undefined };
  } catch {
    throw new Error(
      `Got HTML instead of JSON from ${url} — the old site's bot check is probably blocking scripts. ` +
        `Open that URL in your browser, save the JSON, and re-run with --from-file=that.json`
    );
  }
}

async function fetchAllPosts(): Promise<WpPost[]> {
  const all: WpPost[] = [];
  for (let page = 1; page < 50; page++) {
    const url = `${BASE}/wp-json/wp/v2/posts?per_page=100&page=${page}&_embed=1`;
    let r;
    try {
      r = await getJson(url);
    } catch (e) {
      if (page > 1 && /HTTP 400/.test(String(e))) break; // past the last page
      throw e;
    }
    const arr = r.data as WpPost[];
    if (!Array.isArray(arr) || arr.length === 0) break;
    all.push(...arr);
    if (arr.length < 100) break;
  }
  return all;
}

async function fetchPage(slug: string): Promise<WpPost | null> {
  try {
    const r = await getJson(`${BASE}/wp-json/wp/v2/pages?slug=${slug}`);
    const arr = r.data as WpPost[];
    return Array.isArray(arr) && arr[0] ? arr[0] : null;
  } catch {
    return null;
  }
}

async function loadSource(): Promise<{ posts: WpPost[]; pages: WpPost[] }> {
  if (FROM_FILE) {
    const raw = JSON.parse(await readFile(FROM_FILE, "utf8"));
    if (!DRY && raw && raw.__test_only) {
      throw new Error("That file is a test fixture — it can only be used with --dry-run.");
    }
    if (Array.isArray(raw)) return { posts: raw, pages: [] };
    return { posts: raw.posts || [], pages: raw.pages || [] };
  }
  const posts = await fetchAllPosts();
  const pages: WpPost[] = [];
  for (const slug of ["downloads-2", "tenders-and-careers"]) {
    const p = await fetchPage(slug);
    if (p) pages.push(p);
  }
  return { posts, pages };
}

// ---- media ----
const mediaCache = new Map<string, string>();

async function downloadMedia(url: string): Promise<string | null> {
  if (mediaCache.has(url)) return mediaCache.get(url)!;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  // Only mirror files that live on the old site; leave other hosts untouched.
  if (u.host.replace(/^www\./, "") !== new URL(BASE).host.replace(/^www\./, "")) return null;
  const rel = decodeURIComponent(u.pathname).replace(/^\/wp-content\/uploads\//, "").replace(/^\/+/, "");
  if (rel.includes("..")) return null;

  const candidates = [url];
  const orig = originalImage(url);
  if (orig !== url) candidates.unshift(orig); // try the full-size original first
  for (const c of candidates) {
    try {
      const res = await fetchRetry(c, { headers: { "User-Agent": UA } }, 3);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      const finalDest = path.join(UPLOAD_ROOT, "migrated", decodeURIComponent(new URL(c).pathname).replace(/^\/wp-content\/uploads\//, "").replace(/^\/+/, ""));
      await mkdir(path.dirname(finalDest), { recursive: true });
      await writeFile(finalDest, buf);
      const rel2 = path.relative(path.join(UPLOAD_ROOT, "migrated"), finalDest).split(path.sep).map(encodeURIComponent).join("/");
      const out = "/uploads/migrated/" + rel2;
      mediaCache.set(url, out);
      return out;
    } catch {
      /* try next candidate */
    }
  }
  console.warn(`  ! could not download ${url}`);
  return null;
}

async function localise(url: string): Promise<string> {
  if (DRY || NO_MEDIA) return url;
  return (await downloadMedia(url)) || url;
}

function postedLabel(iso: string) {
  return "Posted " + new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "Africa/Nairobi" });
}

async function main() {
  console.log(`${DRY ? "[DRY RUN] " : ""}Source: ${FROM_FILE ? FROM_FILE : BASE}`);
  const { posts: wpPosts, pages } = await loadSource();
  const mapped: Mapped[] = wpPosts
    .slice(0, LIMIT)
    .map((p) => mapWpPost(p, BASE))
    // Drafts-in-disguise: no real title and nothing in the body.
    .filter((m) => !(m.title === "Untitled" && !m.body && m.images.length === 0 && m.files.length === 0));
  console.log(`Found ${wpPosts.length} posts, ${pages.length} pages`);

  const counts: Record<string, number> = {};
  for (const m of mapped) counts[m.kind] = (counts[m.kind] || 0) + 1;
  console.log("Classified:", counts);
  for (const m of mapped) {
    console.log(
      `  [${m.kind.padEnd(8)}] ${m.createdAt.slice(0, 10)}  ${m.title.slice(0, 70)}  (${m.images.length} img, ${m.files.length} file)`
    );
  }

  // Files linked from the downloads / tenders pages
  const pageFiles: { page: string; link: FileLink }[] = [];
  for (const pg of pages) {
    for (const link of extractFileLinks(pg.content?.rendered || "", BASE)) pageFiles.push({ page: pg.slug || "", link });
  }
  console.log(`Page file links: ${pageFiles.length}`);
  for (const f of pageFiles) console.log(`  [${f.page}] ${f.link.label} -> ${f.link.url}`);

  if (DRY) {
    console.log("\nDry run only — nothing was written. Re-run without --dry-run to import.");
    return;
  }

  // Dynamic import: needs DATABASE_URL, which a dry run shouldn't require.
  const { posts, notices, tenders, jobs, documents } = await import("../lib/repo");
  const { legacyUrlExists } = await import("../lib/repo");
  const { sql, ensureSchema } = await import("../lib/db");
  await ensureSchema();

  if (REPLACE) {
    // Deletes ONLY the demo rows created by the seed script (no legacy_url, exact seeded text).
    await sql`DELETE FROM post WHERE legacy_url = '' AND title IN (
      'World Environmental Day Commemoration',
      'Environment Conservation: 4,000 Trees Challenge at Kiambicho Forest',
      'May Intake 2026', 'Updated Admission Letter & Fee Structure')`;
    await sql`DELETE FROM notice WHERE legacy_url = '' AND title IN (
      'Fee balance clearance deadline','Library extended hours during exam period','Change of workshop reporting time')`;
    await sql`DELETE FROM tender WHERE legacy_url = '' AND title = 'Supply of workshop consumables — 2026/2027'`;
    await sql`DELETE FROM job_posting WHERE legacy_url = '' AND title IN ('Instructor, Electrical & Electronics','Accounts Assistant')`;
    await sql`DELETE FROM exam_timetable WHERE
      (department = 'Electrical & Electronics' AND level = 'Level 5' AND date_range = 'Oct 6–10, 2026') OR
      (department = 'ICT & Informatics' AND level = 'Level 6' AND date_range = 'Oct 13–17, 2026') OR
      (department = 'Mechanical Engineering' AND level = 'Level 5' AND date_range = 'Oct 20–24, 2026') OR
      (department = 'Building & Civil' AND level = 'Level 4' AND date_range = 'Oct 27–31, 2026')`;
    await sql`DELETE FROM document WHERE title = 'Fee structure (Sept 2023)' AND url LIKE '%MURANGA-FEE-STRUCTURE-FROM-SEPT-2023.pdf'`;
    console.log("Removed seeded placeholder content.");
  }

  if (BACKFILL) {
    const { backfillMedia } = await import("../lib/repo");
    const sum = { updated: 0, unchanged: 0, missing: 0 };
    const empty: string[] = [];
    for (const m of mapped) {
      const table = m.kind === "notice" ? "notice" : m.kind === "tender" ? "tender" : m.kind === "job" ? "job_posting" : null;
      if (!table || !m.legacyUrl) continue;
      const files: FileLink[] = [];
      for (const f of m.files) files.push({ label: f.label, url: await localise(f.url) });
      const imageUrl = m.images[0] ? await localise(m.images[0]) : "";
      const r = await backfillMedia(table, m.legacyUrl, { imageUrl, files });
      sum[r]++;
      if (r === "updated") console.log(`  + ${m.kind}: ${m.title.slice(0, 60)}  (${imageUrl ? "image " : ""}${files.length} file${files.length === 1 ? "" : "s"})`);
      if (!imageUrl && files.length === 0) empty.push(`${m.kind}: ${m.title}  ${m.legacyUrl}`);
    }
    console.log("\nBackfill:", sum);
    if (empty.length) {
      console.log("\nThese had no image or file on the old site either (open them in /admin and attach one if needed):");
      for (const e of empty) console.log("  - " + e);
    }
    return;
  }

  const stat = { post: 0, notice: 0, tender: 0, job: 0, document: 0, skipped: 0 };

  for (const m of mapped) {
    const table = m.kind === "news" ? "post" : m.kind === "job" ? "job_posting" : m.kind === "tender" ? "tender" : m.kind === "notice" ? "notice" : "document";
    const key = m.kind === "document" ? m.files[0]?.url : m.legacyUrl;
    if (!key) {
      stat.skipped++;
      continue;
    }
    if (await legacyUrlExists(table, key)) {
      stat.skipped++;
      continue;
    }
    const files: FileLink[] = [];
    for (const f of m.files) files.push({ label: f.label, url: await localise(f.url) });
    const images: string[] = [];
    for (const i of m.images) images.push(await localise(i));
    const firstFile = files[0]?.url || "";

    if (m.kind === "news") {
      await posts.create({
        title: m.title, slug: m.slug, excerpt: m.excerpt, body: m.body, author: m.author,
        imageUrl: images[0] || "", images, attachments: files, legacyUrl: m.legacyUrl, createdAt: m.createdAt,
      });
      stat.post++;
    } else if (m.kind === "notice") {
      await notices.create({ title: m.title, body: m.body || m.excerpt, attachmentUrl: firstFile, legacyUrl: m.legacyUrl, createdAt: m.createdAt });
      stat.notice++;
    } else if (m.kind === "tender") {
      await tenders.create({ title: m.title, status: postedLabel(m.createdAt), attachmentUrl: firstFile, legacyUrl: m.legacyUrl, createdAt: m.createdAt });
      stat.tender++;
    } else if (m.kind === "job") {
      await jobs.create({ title: m.title, status: postedLabel(m.createdAt), attachmentUrl: firstFile, legacyUrl: m.legacyUrl, createdAt: m.createdAt });
      stat.job++;
    } else {
      for (const f of files) {
        if (await legacyUrlExists("document", f.url)) continue;
        await documents.create({ title: f.label || m.title, url: f.url, category: "General" });
        stat.document++;
      }
    }
    console.log(`  + ${m.kind}: ${m.title.slice(0, 70)}`);
  }

  // Files from the Downloads page -> documents; from Tenders & Careers -> tenders/jobs
  for (const { page, link } of pageFiles) {
    const url = await localise(link.url);
    if (page === "tenders-and-careers") {
      const isJob = /\b(vacanc|job|recruit|career|position)/i.test(link.label);
      const table = isJob ? "job_posting" : "tender";
      if (await legacyUrlExists(table, link.url)) { stat.skipped++; continue; }
      const input = { title: link.label, status: "Open", attachmentUrl: url, legacyUrl: link.url };
      if (isJob) { await jobs.create(input); stat.job++; } else { await tenders.create(input); stat.tender++; }
    } else {
      if (await legacyUrlExists("document", url) || await legacyUrlExists("document", link.url)) { stat.skipped++; continue; }
      await documents.create({ title: link.label, url, category: /fee/i.test(link.label) ? "Fees" : "General" });
      stat.document++;
    }
    console.log(`  + ${page}: ${link.label.slice(0, 70)}`);
  }

  console.log("\nDone:", stat);
  console.log("Review everything in /admin, then delete anything that should not be public.");
}

main().catch((e) => {
  console.error("\nMigration failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
