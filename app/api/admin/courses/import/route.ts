import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { courses } from "@/lib/repo";
import { checkRows, courseKey, readRows } from "@/lib/course-sheet";
import { displayName, logActivity } from "@/lib/guard";

export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024;

// POST multipart: file, mode = "skip" | "update", commit = "1" to save (otherwise preview only)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const u = session.user as { id?: string; email?: string | null; name?: string | null; role?: string };

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return Response.json({ error: "Choose an Excel (.xlsx) or .csv file first." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "The file is too large (5 MB maximum)." }, { status: 400 });
  if (!/\.(xlsx|csv)$/i.test(file.name)) return Response.json({ error: "Please upload an .xlsx or .csv file." }, { status: 400 });
  const update = form.get("mode") === "update";
  const commit = form.get("commit") === "1";

  let checked;
  try {
    checked = checkRows(await readRows(Buffer.from(await file.arrayBuffer()), file.name));
  } catch (e) {
    return Response.json({ error: (e as Error).message || "Could not read that file." }, { status: 400 });
  }
  if (checked.length === 0) return Response.json({ error: "No courses found in the file. Fill in the rows under the headings and try again." }, { status: 400 });

  const existing = new Map((await courses.listAll()).map((c) => [courseKey(c.name, c.department, c.level), c.id]));
  const seen = new Set<string>();
  const rows = checked.map((r) => {
    if (!r.ok || !r.data) return { row: r.row, status: "error" as const, message: r.error, name: "", department: "", level: 0 };
    const d = r.data;
    const key = courseKey(d.name, d.department, d.level);
    const base = { row: r.row, name: d.name, department: d.department, level: d.level, published: d.published };
    if (seen.has(key)) return { ...base, status: "skip" as const, message: "Repeated in this file" };
    seen.add(key);
    const id = existing.get(key);
    if (id) return update ? { ...base, status: "update" as const, message: "Already exists. Will be updated", id, data: d } : { ...base, status: "skip" as const, message: "Already exists. Skipped" };
    return { ...base, status: "new" as const, data: d };
  });

  const count = (s: string) => rows.filter((r) => r.status === s).length;
  const summary = { total: rows.length, new: count("new"), update: count("update"), skip: count("skip"), error: count("error") };

  if (commit) {
    const actor = { id: u.id || "", email: u.email || "", name: displayName(u), role: (u.role === "editor" ? "editor" : "admin") as "admin" | "editor" };
    for (const r of rows) {
      if (r.status === "new" && "data" in r && r.data) {
        await courses.create({ ...r.data, examBody: r.data.examBody });
      } else if (r.status === "update" && "data" in r && r.data && "id" in r) {
        await courses.updateFromSheet(r.id as string, r.data);
      }
    }
    await logActivity(actor, "imported", "Courses", `${summary.new} added, ${summary.update} updated from ${file.name}`);
    revalidatePath("/admin/courses");
    revalidatePath("/courses", "layout");
    revalidatePath("/academics");
  }

  return Response.json({
    committed: commit,
    summary,
    rows: rows.map(({ row, status, message, name, department, level }) => ({ row, status, message, name, department, level })),
  });
}
