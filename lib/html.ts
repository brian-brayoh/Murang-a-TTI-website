// Safe HTML for editor-written content. The editor produces HTML; we sanitise it
// on the way out so a pasted script or odd markup can never reach visitors.
import sanitizeHtml from "sanitize-html";

const looksLikeHtml = (s: string) => /<\/?(p|h[1-6]|ul|ol|li|strong|em|a|img|br|blockquote|hr|div|span|table)\b[^>]*>/i.test(s);

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Plain text from the old WordPress import becomes paragraphs; HTML passes through. */
export function toHtml(body: string): string {
  if (!body) return "";
  if (looksLikeHtml(body)) return body;
  return body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function cleanHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "ul", "ol", "li", "blockquote", "hr", "a", "img", "table", "thead", "tbody", "tr", "th", "td", "figure", "figcaption"],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tag, attribs) => {
        const external = /^https?:\/\//i.test(attribs.href || "");
        return { tagName: "a", attribs: { ...attribs, ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}) } };
      },
    },
  });
}

/** Server-side: what to put into dangerouslySetInnerHTML for a stored body. */
export function renderBody(body: string): string {
  return cleanHtml(toHtml(body));
}
