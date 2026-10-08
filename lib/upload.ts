// Saves an uploaded file to disk under UPLOAD_ROOT/<folder>/ and returns
// its public URL path. This needs a persistent, writable filesystem — it
// works on a VPS (Hostinger VPS, any Node host running `next start`
// continuously) but NOT on serverless hosts like Vercel, where the
// filesystem is read-only at runtime. On Vercel, swap this for a blob
// store (Vercel Blob, S3, Cloudinary) instead — every call site here goes
// through this one function, so that's a single-file change.
import path from "node:path";
import { optimiseImage } from "./image-optimise";
import { UPLOAD_ROOT, putFile } from "./storage";
export { UPLOAD_ROOT };

// Files are served by app/uploads/[...path]/route.ts. Disk by default (set
// UPLOAD_DIR to a persistent folder); Vercel Blob when BLOB_READ_WRITE_TOKEN is set.

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const DOC_TYPES = ["application/pdf"];

function safeExt(filename: string, fallback: string) {
  const ext = path.extname(filename).toLowerCase().replace(/[^a-z0-9.]/g, "");
  return ext || fallback;
}

export async function saveUpload(
  file: File | null,
  folder: "gallery" | "staff" | "documents"
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  if (file.size > MAX_BYTES) {
    throw new Error("That file is too large — 8MB max.");
  }
  const allowed = folder === "documents" ? [...IMAGE_TYPES, ...DOC_TYPES] : IMAGE_TYPES;
  if (!allowed.includes(file.type)) {
    throw new Error(
      folder === "documents"
        ? "Only PDF, JPG, PNG, WEBP or GIF files are allowed."
        : "Only JPG, PNG, WEBP or GIF images are allowed."
    );
  }

  const bytes = await optimiseImage(Buffer.from(await file.arrayBuffer()), file.type);
  const ext = safeExt(file.name, file.type === "application/pdf" ? ".pdf" : ".jpg");
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  await putFile(`${folder}/${filename}`, bytes, file.type);
  return `/uploads/${folder}/${filename}`;
}


// ---- Media library uploads (any editor-friendly file type, 25MB) ----
export const MEDIA_MAX_BYTES = 25 * 1024 * 1024;
const MEDIA_EXT: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif",
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

export async function saveMedia(file: File): Promise<{ url: string; filename: string; mime: string; size: number }> {
  if (file.size === 0) throw new Error(`${file.name} is empty.`);
  if (file.size > MEDIA_MAX_BYTES) throw new Error(`${file.name} is too large (25MB max).`);
  const ext = path.extname(file.name).toLowerCase();
  const mime = MEDIA_EXT[ext];
  if (!mime) throw new Error(`${file.name}: file type not allowed. Use JPG, PNG, WEBP, GIF, PDF, Word, Excel, PowerPoint, CSV or ZIP.`);
  const now = new Date();
  const base = file.name
    .slice(0, file.name.length - ext.length)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) || "file";
  const filename = `${base}-${Math.random().toString(36).slice(2, 6)}${ext}`;
  const data = await optimiseImage(Buffer.from(await file.arrayBuffer()), mime);
  const rel = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${filename}`;
  await putFile(`media/${rel}`, data, mime);
  return { url: `/uploads/media/${rel}`, filename: file.name, mime, size: data.length };
}
