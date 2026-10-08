// Writes docs/ADMIN-GUIDE.md from lib/help-content.ts.   npm run docs:guide
import { writeFile, mkdir } from "node:fs/promises";
import { HELP, HELP_INTRO } from "../lib/help-content";

async function main() {
  const lines: string[] = ["# Murang'a TTI website: admin training guide", "", HELP_INTRO, ""];
  for (const s of HELP) {
    lines.push(`## ${s.title}`, "");
    if (s.intro) lines.push(s.intro, "");
    (s.steps || []).forEach((t, i) => lines.push(`${i + 1}. ${t}`));
    if (s.steps?.length) lines.push("");
    (s.tips || []).forEach((t) => lines.push(`> **Tip:** ${t}`, ""));
  }
  await mkdir("docs", { recursive: true });
  await writeFile("docs/ADMIN-GUIDE.md", lines.join("\n"));
  console.log("Wrote docs/ADMIN-GUIDE.md");
}
main();
