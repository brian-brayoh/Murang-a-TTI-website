import { auth } from "@/auth";
import { courses } from "@/lib/repo";
import { buildWorkbook } from "@/lib/course-sheet";

export const dynamic = "force-dynamic";

// GET /api/admin/courses/template            -> blank template with an example row
// GET /api/admin/courses/template?export=1   -> every current course, same layout (edit and re-upload)
export async function GET(req: Request) {
  if (!(await auth())?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const exp = new URL(req.url).searchParams.get("export") === "1";
  const rows = exp
    ? (await courses.listAll()).map((c) => ({
        department: c.department,
        name: c.name,
        level: c.level,
        duration: c.duration || "",
        entry: c.entry || "",
        examBody: c.exam_body || "",
        summary: c.summary || "",
        details: c.details || "",
        published: c.published,
      }))
    : [];
  const buf = await buildWorkbook(rows, { examples: !exp });
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${exp ? "mtti-courses-current.xlsx" : "mtti-courses-template.xlsx"}"`,
      "Cache-Control": "no-store",
    },
  });
}
