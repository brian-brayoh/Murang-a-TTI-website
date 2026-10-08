"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Where "Edit this page" should go for each public section.
function editTarget(path: string): { href: string; label: string } {
  const seg = path.split("/").filter(Boolean);
  const first = seg[0] || "";
  if (first === "courses" && seg[1]) return { href: `/admin/pages/dept/${seg[1]}`, label: "Edit this department" };
  const map: Record<string, [string, string]> = {
    blog: ["/admin/posts", "Manage news"],
    courses: ["/admin/courses", "Manage courses"],
    "e-notice": ["/admin/notices", "Manage notices"],
    gallery: ["/admin/gallery", "Manage gallery"],
    staff: ["/admin/staff", "Manage staff"],
    administration: ["/admin/staff", "Manage staff"],
    downloads: ["/admin/downloads", "Manage downloads"],
    "tenders-careers": ["/admin/tenders", "Manage tenders"],
    academics: ["/admin/pages", "Edit department pages"],
    admissions: ["/admin/applications", "View applications"],
    contact: ["/admin/inquiries", "View messages"],
  };
  const hit = map[first];
  if (hit) return { href: hit[0], label: hit[1] };
  if (!first) return { href: "/admin", label: "Open dashboard" };
  return { href: "/admin/pages", label: "Edit pages" };
}

export default function AdminBarClient({ name, role }: { name: string; role: string }) {
  const path = usePathname();
  const t = editTarget(path);
  return (
    <div className="bg-black text-white text-xs">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-1.5 flex flex-wrap items-center gap-x-5 gap-y-1">
        <span className="text-white/70">
          Signed in as <b className="text-white">{name}</b> ({role === "admin" ? "Administrator" : "Editor"})
        </span>
        <Link href="/admin" className="hover:text-accent">Dashboard</Link>
        <Link href="/admin/posts/new" className="hover:text-accent">+ New post</Link>
        <Link href="/admin/media" className="hover:text-accent">Media</Link>
        <Link href={t.href} className="ml-auto bg-accent text-brand-900 font-semibold px-3 py-1 hover:bg-accent-dark">
          {t.label}
        </Link>
      </div>
    </div>
  );
}
