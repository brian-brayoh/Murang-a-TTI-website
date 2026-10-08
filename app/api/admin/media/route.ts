import { auth } from "@/auth";
import { media } from "@/lib/repo";
import { saveMedia } from "@/lib/upload";
import { displayName, logActivity } from "@/lib/guard";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await auth())?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({ items: await media.list() });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const u = session.user as { id?: string; email?: string | null; name?: string | null; role?: string };
  const actor = { id: u.id || "", email: u.email || "", name: displayName(u), role: (u.role === "editor" ? "editor" : "admin") as "admin" | "editor" };
  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) return Response.json({ error: "No files received." }, { status: 400 });
  const added: string[] = [];
  const errors: string[] = [];
  for (const f of files) {
    try {
      const saved = await saveMedia(f);
      await media.add(saved);
      added.push(saved.url);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Upload failed");
    }
  }
  if (added.length) await logActivity(actor, "uploaded", "Media", added.length === 1 ? files[0].name : `${added.length} files`);
  return Response.json({ added, errors, items: await media.list() }, { status: added.length ? 200 : 400 });
}
