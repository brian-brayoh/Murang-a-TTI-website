// TEMPORARY diagnostic for the Vercel showcase. Safe to delete once photos work.
import { blobEnabled, blobBase } from "@/lib/storage";

const tokenVars = () => Object.keys(process.env).filter((k) => /READ_WRITE_TOKEN|BLOB/i.test(k));

export const dynamic = "force-dynamic";

export async function GET() {
  const base = blobBase();
  const out: Record<string, unknown> = {
    blobTokenPresent: blobEnabled(),
    blobHost: base ? base.replace(/^https?:\/\//, "") : null,
    tokenVariableNames: tokenVars(),
    databaseConfigured: !!process.env.DATABASE_URL,
  };
  if (base) {
    for (const rel of ["migrated/2025/01/Mechanical-1.jpeg", ".healthcheck.txt"]) {
      try {
        const r = await fetch(`${base}/uploads/${rel}`, { cache: "no-store" });
        out[`blob:${rel}`] = r.status;
      } catch (e) {
        out[`blob:${rel}`] = `error: ${(e as Error).message}`;
      }
    }
  }
  return Response.json(out);
}
