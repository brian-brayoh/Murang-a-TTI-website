import { auth } from "@/auth";
import { media } from "@/lib/repo";
import { deleteFile } from "@/lib/storage";
import { displayName, logActivity } from "@/lib/guard";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  if (!(await auth())?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as { alt?: string };
  await media.setAlt(id, String(body.alt || "").slice(0, 300));
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const u = session.user as { id?: string; email?: string | null; name?: string | null; role?: string };
  const { id } = await ctx.params;
  const item = await media.get(id);
  if (item) {
    // Only remove the file when it was uploaded through the library (never migrated originals).
    if (item.url.startsWith("/uploads/media/")) {
      await deleteFile(item.url.replace(/^\/uploads\//, ""));
    }
    await media.remove(id);
    await logActivity({ id: u.id || "", email: u.email || "", name: displayName(u), role: u.role === "editor" ? "editor" : "admin" }, "deleted", "Media", item.filename);
  }
  return Response.json({ ok: true });
}
