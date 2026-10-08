import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { saveUpload } from "@/lib/upload";
import { requireAdmin, logActivity } from "@/lib/guard";
import { courses } from "@/lib/repo";
import { COURSE_DEPARTMENTS, COURSE_LEVELS } from "@/lib/departments";

function refresh() {
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
}

async function createCourse(formData: FormData) {
  "use server";
  const actor = await requireAdmin();
  await logActivity(actor, "added", "Course", String(formData.get("title") || formData.get("name") || ""));
  let imageUrl = "";
  try {
    imageUrl = (await saveUpload(formData.get("photo") as File | null, "gallery")) || "";
  } catch (e) {
    redirect(`/admin/courses?error=${encodeURIComponent((e as Error).message)}`);
  }
  await courses.create({
    imageUrl,
    details: String(formData.get("details") || "").trim(),
    name: String(formData.get("name") || "").trim(),
    department: String(formData.get("department")),
    level: Number(formData.get("level")),
    summary: String(formData.get("summary") || "").trim(),
    duration: String(formData.get("duration") || "").trim(),
    entry: String(formData.get("entry") || "").trim(),
    examBody: String(formData.get("exam_body") || "").trim(),
    published: true,
  });
  refresh();
}

async function updateCourse(formData: FormData) {
  "use server";
  const actor = await requireAdmin();
  await logActivity(actor, "updated", "Course", String(formData.get("title") || formData.get("name") || ""));
  let imageUrl = "";
  try {
    imageUrl = (await saveUpload(formData.get("photo") as File | null, "gallery")) || "";
  } catch (e) {
    redirect(`/admin/courses?error=${encodeURIComponent((e as Error).message)}`);
  }
  await courses.updateContent(String(formData.get("id")), {
    details: String(formData.get("details") || "").trim(),
    imageUrl,
  });
  refresh();
}

async function togglePublished(formData: FormData) {
  "use server";
  const actor = await requireAdmin();
  await logActivity(actor, "changed", "Course", String(formData.get("title") || formData.get("name") || ""));
  await courses.setPublished(String(formData.get("id")), formData.get("publish") === "1");
  refresh();
}

async function publishAll() {
  "use server";
  const actor = await requireAdmin();
  await logActivity(actor, "changed", "Course", "");
  await courses.publishAllDrafts();
  refresh();
}

async function deleteCourse(formData: FormData) {
  "use server";
  const actor = await requireAdmin();
  await logActivity(actor, "deleted", "Course", String(formData.get("title") || formData.get("name") || ""));
  await courses.remove(String(formData.get("id")));
  refresh();
}

const input =
  "mt-1 w-full border border-paper-line px-3 py-2 bg-paper focus:outline-none focus:border-brand-700";

export default async function AdminCourses({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const all = await courses.listAll();
  const drafts = all.filter((c) => !c.published).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display font-semibold text-2xl">Courses</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/courses/import" className="bg-brand-700 text-white font-semibold px-4 py-2 text-sm hover:bg-brand-900">&uarr; Import from Excel</Link>
          <a href="/api/admin/courses/template" className="border border-brand-700 text-brand-700 font-medium px-4 py-2 text-sm hover:bg-brand-700 hover:text-white">&darr; Excel template</a>
        </div>
      </div>
      {error && <p className="mt-4 text-sm text-red-700 border border-red-300 bg-red-50 p-3 max-w-2xl">{error}</p>}

      {drafts > 0 && (
        <div className="mt-6 border border-accent bg-accent/10 p-4 max-w-2xl flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm">
            <strong>{drafts} draft programmes</strong> are hidden from the public
            site. Confirm each with the registrar, then publish it below.
          </p>
          <form action={publishAll}>
            <button className="text-sm border border-brand-700 text-brand-700 px-3 py-1.5 hover:bg-brand-700 hover:text-white">
              Publish all drafts
            </button>
          </form>
        </div>
      )}

      <form action={createCourse} className="mt-8 border border-paper-line p-6 grid sm:grid-cols-2 gap-4 max-w-2xl">
        <div className="sm:col-span-2">
          <label className="text-sm text-steel">Course name</label>
          <input name="name" required className={input} />
        </div>
        <div>
          <label className="text-sm text-steel">Department</label>
          <select name="department" className={input}>
            {COURSE_DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-steel">Level</label>
          <select name="level" className={input} defaultValue={6}>
            {COURSE_LEVELS.map((l) => (
              <option key={l.level} value={l.level}>
                Level {l.level} ({l.award})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-steel">Duration (optional)</label>
          <input name="duration" placeholder="e.g. 3 years" className={input} />
        </div>
        <div>
          <label className="text-sm text-steel">Examined by (optional)</label>
          <input name="exam_body" placeholder="e.g. CDACC, KNEC" className={input} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm text-steel">Entry requirement (optional)</label>
          <input name="entry" placeholder="e.g. KCSE C- (minus) and above" className={input} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm text-steel">Short description (optional)</label>
          <textarea name="summary" rows={2} className={input} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm text-steel">Full write-up shown when the course is opened (optional)</label>
          <textarea name="details" rows={4} placeholder="What trainees learn, career paths, anything an applicant should know. Leave a blank line between paragraphs." className={input} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm text-steel">Photo (optional, otherwise the department photo is used)</label>
          <input type="file" name="photo" accept="image/*" className={input} />
        </div>
        <button className="sm:col-span-2 bg-brand-700 text-white font-semibold px-5 py-2.5 hover:bg-brand-900">
          Add and publish
        </button>
      </form>

      <div className="mt-10 divide-y divide-paper-line border-t border-b border-paper-line">
        {all.map((c) => (
          <div key={c.id} className="py-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">
                {c.name}{" "}
                <span className="font-mono text-xs text-steel">L{c.level}</span>
              </p>
              <p className="text-xs text-steel mt-0.5">
                {c.department} &middot;{" "}
                <span className={c.published ? "text-brand-700" : "text-accent-dark font-medium"}>
                  {c.published ? "Published" : "Draft"}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <form action={togglePublished}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="publish" value={c.published ? "0" : "1"} />
                <button className="text-xs border border-paper-line px-2.5 py-1.5 hover:border-brand-700">
                  {c.published ? "Unpublish" : "Publish"}
                </button>
              </form>
              <Link href={`/admin/edit/course/${c.id}`} className="text-xs border border-paper-line px-2.5 py-1.5 hover:border-brand-700">Edit details</Link>
              <details className="relative">
                <summary className="text-xs border border-paper-line px-2.5 py-1.5 hover:border-brand-700 cursor-pointer list-none">Edit write-up</summary>
                <form action={updateCourse} className="absolute right-0 z-10 mt-1 w-80 bg-white border border-paper-line p-3 shadow-lg space-y-2">
                  <input type="hidden" name="id" value={c.id} />
                  <textarea name="details" rows={5} defaultValue={c.details} className={input} />
                  <input type="file" name="photo" accept="image/*" className={input} />
                  <button className="text-xs bg-brand-700 text-white px-3 py-1.5">Save</button>
                </form>
              </details>
              <form action={deleteCourse}>
                <input type="hidden" name="id" value={c.id} />
                <button className="text-xs border border-paper-line px-2.5 py-1.5 hover:border-accent hover:text-accent">
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
        {all.length === 0 && <p className="py-6 text-sm text-steel">No courses yet.</p>}
      </div>
    </div>
  );
}
