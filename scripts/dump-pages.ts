// Saves the text of the old site's department/admissions pages to
// pages-dump.txt so the content can be reviewed and loaded accurately.
//   npm run pages:dump
import "./env";
import { writeFile } from "node:fs/promises";
import { htmlToText } from "../lib/wp-migrate";

const SLUGS = [
  "agriculture-department", "business-department", "offered-programmes", "course-offered",
  "department-values", "our-programs", "insight-from-the-hod-mechanical-department",
  "academics", "about", "registration", "students-council",
];
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36";

async function main() {
  let out = "";
  for (const slug of SLUGS) {
    let text = "(not fetched)";
    for (let i = 0; i < 4; i++) {
      try {
        const r = await fetch(`https://murangatech.ac.ke/wp-json/wp/v2/pages?slug=${slug}`, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) });
        const arr = (await r.json()) as { content?: { rendered?: string } }[];
        const html = (arr[0]?.content?.rendered || "")
          .replace(/<\/t[dh]>/gi, " | ")
          .replace(/<img[^>]*alt=["']([^"']+)["'][^>]*>/gi, " [image: $1] ");
        text = html ? htmlToText(html) : "(page not found or empty — content may be built with Elementor widgets)";
        break;
      } catch {
        await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
      }
    }
    out += `\n\n===== ${slug} =====\n${text}`;
    console.log(`  ${slug}: ${text.length} characters`);
  }
  await writeFile("pages-dump.txt", out);
  console.log("\nSaved pages-dump.txt");
}
main();
