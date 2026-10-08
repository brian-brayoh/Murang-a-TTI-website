// Copies the photos shown on https://murangatech.ac.ke/gallery/ into the new
// gallery (downloaded to your uploads folder). Safe to re-run: photos already
// imported are skipped.
//   npm run gallery:sync -- --dry-run
//   npm run gallery:sync
import "./env";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { originalImage } from "../lib/wp-migrate";

const U = "https://murangatech.ac.ke/wp-content/uploads/";
const T = U + "elementor/thumbs/";
// Source: the old gallery page (checked 7 Oct 2026). The old site only exposes
// resized copies for most photos; replace any you want sharper by uploading the
// original in /admin/gallery and deleting the imported one.
const URLS: string[] = [
  T + "DSC_1001-scaled-r2t3wr21u6kyxqtlpzeb28gnias73cyhlp2lg989xg.jpg",
  T + "BUS1-r21b376k1gub3xr900ege60heruxty4tbyy63alt8k.jpeg",
  T + "DSC_0640-scaled-r20rvty37cetl8093nw4x4q3x1it8ig9y0o7lhpbus.jpg",
  T + "BUS-r1xw6qzahk3px8imoinorntfjres3ndgcz59oys5l0.jpg",
  T + "DSC_1012-scaled-r2t3w6dlntsnubnn2qgijdoiftm4e0oe6upww62xqc.jpg",
  U + "2021/11/WhatsApp-Image-2021-11-05-at-10.39.271-1024x768.jpeg",
  U + "2025/02/hos8-1024x461.jpeg",
  U + "2025/02/Mechanical-1-1024x575.jpeg",
  U + "2025/01/IMG-20240910-WA0111-1-1024x461.jpg",
  T + "hos1-r2t30mwkbyma9dgz93n6vc7oud2q3ngn6qnd5wuiis.jpeg",
  T + "hos2-r2t30os8pmouwle8y4gg0bqm14tgj1o3uzyc4grq6c.jpeg",
  T + "hos3-r2t30pq2wgq587cvsmv2kti2miotqqru74ltlqqc04.jpeg",
  T + "hos4-r2t30pq2wgq587cvsmv2kti2miotqqru74ltlqqc04.jpeg",
  T + "M001-scaled-r2t30uf9umwku96216w7fabdlg1nt8ahvrv904jd50.jpg",
  T + "DSC_0954-scaled-r2t3xhdj5jkzytrdgarv01tk536h2vuz1bc6w05938.jpg",
  T + "DSC_0910-scaled-r2t3xm2q3prfkvkjouszuimv40jb5ddmpylmadya84.jpg",
  T + "DSC_0867-scaled-r2t3xqrx1vxv6xdpxeu4ozg62xw57uwaelv1orrbd0.jpg",
  T + "DSC_0853-scaled-r2t3xyamkk85rt2spi358xjuu0v2xfq53n2xizg5z8.jpg",
  T + "DSC_0962-scaled-r2t3xcobylne4hsb76azfsel1go5j83ep09anxjrr8.jpg",
  T + "DSC_0971-scaled-r2t3x8wz79i8u1xrt4oh5tcqnx6oofohchncqtpcg4.jpg",
  T + "DSC_0973-scaled-r2t3x47s93bt804lkkncbcjfoztuly5tnudxcfwbb8.jpg",
  T + "DSC_0975-scaled-r2t3x0gfhr6nxka26j0u1dhlbgcdr5qwbbrzfc1w04.jpg",
];

const DRY = process.argv.includes("--dry-run");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36";
const ROOT = process.env.UPLOAD_DIR || path.join(process.cwd(), "storage", "uploads");

function describe(file: string): { caption: string; category: string } {
  if (/^hos/i.test(file)) return { caption: "Hospitality training", category: "Workshops & labs" };
  if (/^mechanical/i.test(file)) return { caption: "Mechanical engineering", category: "Workshops & labs" };
  if (/^bus/i.test(file)) return { caption: "Institute bus", category: "Campus life" };
  return { caption: "", category: "Campus life" };
}

// Elementor thumbs are named "<name>-r<hash>.<ext>"; the clean name is everything before "-r<hash>".
function cleanName(url: string): string {
  const base = decodeURIComponent(url.split("/").pop() || "photo.jpg");
  const ext = path.extname(base);
  const stem = base.slice(0, -ext.length).replace(/-r[0-9a-z]{20,}$/i, "").replace(/-\d{2,5}x\d{2,5}$/i, "");
  return `${stem.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}${ext.toLowerCase()}`;
}

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
  const names = URLS.map(cleanName);
  if (DRY) {
    URLS.forEach((u, i) => console.log(`  ${names[i].padEnd(40)} ${describe(names[i]).category}`));
    console.log(`\n${URLS.length} photos. Dry run: nothing written.`);
    return;
  }
  const { sql, ensureSchema, closeDb } = await import("../lib/db");
  const { galleryPhotos } = await import("../lib/repo");
  await ensureSchema();
  await mkdir(path.join(ROOT, "gallery"), { recursive: true });
  let added = 0, skipped = 0, failed = 0;
  for (let i = 0; i < URLS.length; i++) {
    const name = names[i];
    const local = `/uploads/gallery/${name}`;
    if ((await sql`SELECT 1 FROM gallery_photo WHERE url = ${local} LIMIT 1`).length) { skipped++; continue; }
    const buf = (await get(originalImage(URLS[i]))) || (await get(URLS[i]));
    if (!buf) { console.warn(`  ! could not download ${URLS[i]}`); failed++; continue; }
    await writeFile(path.join(ROOT, "gallery", name), buf);
    const d = describe(name);
    await galleryPhotos.create({ url: local, caption: d.caption, category: d.category });
    added++;
    console.log(`  + ${name}`);
  }
  console.log(`\nDone: ${added} added, ${skipped} already there, ${failed} failed.`);
  await closeDb();
}
main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
