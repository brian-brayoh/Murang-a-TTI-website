// Serves uploaded and migrated files at runtime. Next only serves files that
// existed in /public when the server started, so files uploaded from the admin
// would 404 in production. Files live in UPLOAD_DIR (default ./storage/uploads).
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { UPLOAD_ROOT, blobEnabled, blobBase } from "@/lib/storage";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".zip": "application/zip",
  ".csv": "text/csv",
};

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await ctx.params;
  if (blobEnabled()) {
    const rel = segments.map((s) => decodeURIComponent(s));
    if (rel.some((s) => s === ".." || s === "." || s.includes("/"))) return new Response("Not found", { status: 404 });
    const t = TYPES[path.extname(rel[rel.length - 1]).toLowerCase()];
    if (!t) return new Response("Not found", { status: 404 });
    const upstream = await fetch(`${blobBase()}/uploads/${rel.map(encodeURIComponent).join("/")}`).catch(() => null);
    if (!upstream || !upstream.ok || !upstream.body) return new Response("Not found", { status: 404 });
    return new Response(upstream.body, {
      headers: {
        "Content-Type": t,
        "Cache-Control": "public, max-age=86400, s-maxage=31536000",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
  const root = path.resolve(UPLOAD_ROOT);
  const file = path.resolve(root, ...segments.map((s) => decodeURIComponent(s)));
  if (file !== root && !file.startsWith(root + path.sep)) {
    return new Response("Not found", { status: 404 });
  }
  const type = TYPES[path.extname(file).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });
  try {
    if (!(await stat(file)).isFile()) return new Response("Not found", { status: 404 });
    const data = await readFile(file);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        "Content-Length": String(data.length),
        "Cache-Control": "public, max-age=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
