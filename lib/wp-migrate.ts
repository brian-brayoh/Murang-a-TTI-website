// Pure helpers for turning WordPress REST API posts into MTTI content.
// No network, no database — so they can be unit tested anywhere.

export type WpPost = {
  id?: number;
  date?: string;
  date_gmt?: string;
  slug?: string;
  link?: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  content?: { rendered?: string };
  _embedded?: { author?: { name?: string }[] };
};

export type FileLink = { label: string; url: string };
export type Kind = "news" | "notice" | "tender" | "job" | "document";

export type Mapped = {
  kind: Kind;
  title: string;
  slug: string;
  legacyUrl: string;
  createdAt: string;
  author: string;
  excerpt: string;
  body: string;
  images: string[];
  files: FileLink[];
};

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  ndash: "–",
  mdash: "—",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
};

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, g: string) => {
    if (g[0] === "#") {
      const code = g[1].toLowerCase() === "x" ? parseInt(g.slice(2), 16) : parseInt(g.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : m;
    }
    const v = ENTITIES[g.toLowerCase()];
    return v === undefined ? m : v;
  });
}

export function htmlToText(html: string): string {
  let h = html || "";
  h = h.replace(/<(script|style|object|noscript)[\s\S]*?<\/\1>/gi, "");
  // Gutenberg file blocks are turned into attachments separately.
  h = h.replace(/<div[^>]*class="[^"]*wp-block-file[^"]*"[\s\S]*?<\/div>/gi, "");
  h = h.replace(/<br\s*\/?>/gi, "\n");
  h = h.replace(/<\/(p|div|h[1-6]|li|tr|blockquote|figure|figcaption|ul|ol|table)>/gi, "\n\n");
  h = h.replace(/<li[^>]*>/gi, "• ");
  h = h.replace(/<[^>]+>/g, "");
  h = decodeEntities(h);
  h = h.replace(/[ \t ]+/g, " ");
  h = h
    .split("\n")
    .map((l) => l.trim())
    .join("\n");
  h = h.replace(/\n{3,}/g, "\n\n");
  return h.trim();
}

const IMG_EXT = /\.(jpe?g|png|gif|webp)(\?.*)?$/i;
const FILE_EXT = /\.(pdf|docx?|xlsx?|pptx?|zip|csv)(\?.*)?$/i;
const SKIP_IMG = /(\/plugins\/|\/themes\/|emoji|gravatar|placeholder|spinner|loading\.|blank\.)/i;

/** Strip WordPress' "-1024x684" size suffix to get the full-size original. */
export function originalImage(url: string): string {
  return url.replace(/-\d{2,5}x\d{2,5}(\.[a-z0-9]+)(\?.*)?$/i, "$1");
}

function abs(url: string, base: string): string {
  try {
    return new URL(decodeEntities(url.trim()), base).toString();
  } catch {
    return "";
  }
}

export function extractImages(html: string, base = "https://murangatech.ac.ke"): string[] {
  const found: string[] = [];
  const add = (raw: string | undefined) => {
    if (!raw) return;
    const u = abs(raw, base);
    if (!u || !IMG_EXT.test(u) || SKIP_IMG.test(u)) return;
    found.push(originalImage(u));
  };
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    add(/\bdata-(?:orig-file|src|lazy-src)=["']([^"']+)["']/i.exec(tag)?.[1]);
    add(/\bsrc=["']([^"']+)["']/i.exec(tag)?.[1]);
  }
  for (const m of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)) add(m[1]);
  // dedupe by original file name
  const seen = new Set<string>();
  return found.filter((u) => {
    const key = u.split("/").pop()!.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function labelFromFilename(url: string): string {
  const name = decodeURIComponent(url.split("/").pop() || "").replace(/\.[a-z0-9]+(\?.*)?$/i, "");
  const t = name.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : "Download";
}

export function extractFileLinks(html: string, base = "https://murangatech.ac.ke"): FileLink[] {
  const out: FileLink[] = [];
  const seen = new Set<string>();
  // PDFs shown inline by a viewer plugin (iframe / embed / object, or the Google Docs viewer)
  for (const m of html.matchAll(/<(?:iframe|embed|object)\b[^>]*\b(?:src|data)=["']([^"']+)["']/gi)) {
    let raw = decodeEntities(m[1]);
    const viewer = /[?&]url=([^&]+)/i.exec(raw);
    if (viewer) raw = decodeURIComponent(viewer[1]);
    const url = abs(raw, base);
    if (!url || !FILE_EXT.test(url.split("#")[0]) || seen.has(url)) continue;
    seen.add(url);
    out.push({ label: labelFromFilename(url), url });
  }
  for (const m of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const url = abs(m[1], base);
    if (!url || !FILE_EXT.test(url) || seen.has(url)) continue;
    seen.add(url);
    let label = htmlToText(m[2]).replace(/\s+/g, " ").trim();
    if (!label || /^(download|click here|here|view|open)$/i.test(label)) label = labelFromFilename(url);
    out.push({ label, url });
  }
  return out;
}

const RX = {
  tender: /\b(tender|eoi|expression of interest|rfq|request for (quotation|proposal)|prequalification|pre-qualification)\b/i,
  job: /\b(vacanc(y|ies)|job|recruitment|career|position of|we are hiring|appointment of)\b/i,
  document: /\b(fee structure|admission letter|calendar|form|prospectus|brochure|handbook|joining instructions|syllabus)\b/i,
  notice: /\b(notice|circular|reminder|closure|reopening|re-opening|opening date|intake|exam|timetable|memo|announcement|public holiday)\b/i,
};

export function classify(title: string): Kind {
  if (RX.tender.test(title)) return "tender";
  if (RX.job.test(title)) return "job";
  if (RX.document.test(title)) return "document";
  if (RX.notice.test(title)) return "notice";
  return "news";
}

function toIso(p: WpPost): string {
  const iso = p.date_gmt ? p.date_gmt + "Z" : p.date ? p.date + "+03:00" : "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function clip(s: string, n: number): string {
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  const sp = cut.lastIndexOf(" ");
  return (sp > n * 0.6 ? cut.slice(0, sp) : cut).trim() + "…";
}

export function mapWpPost(p: WpPost, base = "https://murangatech.ac.ke"): Mapped {
  const title = htmlToText(p.title?.rendered || "").replace(/\s+/g, " ") || "Untitled";
  const html = p.content?.rendered || "";
  const body = htmlToText(html);
  const excerptRaw = htmlToText(p.excerpt?.rendered || "");
  const excerpt = clip((excerptRaw || body || title).replace(/\s+/g, " "), 180);
  return {
    kind: classify(title),
    title,
    slug: p.slug || "",
    legacyUrl: p.link || (p.slug ? `${base}/${p.slug}/` : ""),
    createdAt: toIso(p),
    author: p._embedded?.author?.[0]?.name || "The Registrar",
    excerpt,
    body,
    images: extractImages(html, base),
    files: extractFileLinks(html, base),
  };
}
