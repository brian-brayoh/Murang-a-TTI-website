import Link from "next/link";
import ImportForm from "./ImportForm";

export const dynamic = "force-dynamic";

export default function ImportCourses() {
  return (
    <div>
      <Link href="/admin/courses" className="text-sm text-steel hover:text-brand-700">&larr; Courses</Link>
      <h1 className="mt-2 font-display font-semibold text-2xl">Import courses from Excel</h1>
      <p className="text-sm text-steel max-w-2xl">Add many courses, with their departments, in one go. Download the template, fill it in, upload it, check the preview, then confirm.</p>
      <ImportForm />
    </div>
  );
}
