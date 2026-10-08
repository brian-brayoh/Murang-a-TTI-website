// Storage backend for uploaded files.
//  - Default: files on disk under UPLOAD_ROOT (VPS / HostPinnacle).
//  - If BLOB_READ_WRITE_TOKEN is set (Vercel): files go to Vercel Blob under
//    the pathname "uploads/<rel>". Stored URLs stay "/uploads/<rel>" either
//    way, so content moves between hosts with no database changes.
import { writeFile, mkdir, unlink } from "node:fs/promises";
import path from "node:path";

export const UPLOAD_ROOT = process.env.UPLOAD_DIR || path.join(process.cwd(), "storage", "uploads");

/** Vercel may prefix the variable name when a store is connected (e.g. STORAGE_READ_WRITE_TOKEN). */
export function blobToken(): string {
  const direct = process.env.BLOB_READ_WRITE_TOKEN;
  if (direct) return direct.trim();
  const key = Object.keys(process.env).find((k) => /_READ_WRITE_TOKEN$/.test(k) && process.env[k]);
  return key ? String(process.env[key]).trim() : "";
}

export const blobEnabled = () => !!blobToken();

/** Public base URL of the Blob store, derived from the token (or BLOB_BASE_URL). */
export function blobBase(): string {
  if (process.env.BLOB_BASE_URL) return process.env.BLOB_BASE_URL.replace(/\/$/, "");
  const id = blobToken().split("_")[3];
  return id ? `https://${id.toLowerCase()}.public.blob.vercel-storage.com` : "";
}

/** rel like "gallery/123.jpg" (no leading slash). */
export async function putFile(rel: string, data: Buffer | Uint8Array, contentType: string) {
  if (blobEnabled()) {
    const { put } = await import("@vercel/blob");
    await put(`uploads/${rel}`, Buffer.from(data), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType,
      token: blobToken(),
    });
    return;
  }
  const file = path.join(UPLOAD_ROOT, rel);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, data);
}

export async function deleteFile(rel: string) {
  if (blobEnabled()) {
    const { del } = await import("@vercel/blob");
    await del(`${blobBase()}/uploads/${rel}`, { token: blobToken() }).catch(() => {});
    return;
  }
  const root = path.resolve(UPLOAD_ROOT);
  const file = path.resolve(root, rel);
  if (file.startsWith(root + path.sep)) await unlink(file).catch(() => {});
}
