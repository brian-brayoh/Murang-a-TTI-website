// Shrinks photos before they are stored: fixes phone rotation, caps the longest
// side, strips hidden location/camera data and re-compresses. The result is only
// used when it is actually smaller. GIFs are left alone.
import sharp from "sharp";

export const MAX_EDGE = 2000;

export async function optimiseImage(input: Buffer, mime: string): Promise<Buffer> {
  if (mime === "image/gif" || !mime.startsWith("image/")) return input;
  try {
    let img = sharp(input, { failOn: "none" }).rotate().resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true });
    if (mime === "image/jpeg") img = img.jpeg({ quality: 80, mozjpeg: true });
    else if (mime === "image/png") img = img.png({ compressionLevel: 9, effort: 7 });
    else if (mime === "image/webp") img = img.webp({ quality: 80 });
    const out = await img.toBuffer();
    return out.length < input.length ? out : input;
  } catch {
    return input; // never block an upload because optimising failed
  }
}
