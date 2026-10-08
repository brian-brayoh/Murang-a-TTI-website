import Link from "next/link";
import { requireAdmin } from "@/lib/guard";
import ActivityList from "@/components/ActivityList";
import {
  posts,
  notices,
  timetables,
  tenders,
  jobs,
  staff,
  courses,
  galleryPhotos,
  documents,
  inquiries,
  applications,
  tasks,
  activity,
} from "@/lib/repo";

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const sp = await searchParams;
  const me = await requireAdmin();
  const recent = await activity.recent(8);
  const unread = await inquiries.unreadCount();
  const newApps = await applications.newCount();

  const cards = [
    { name: "News posts", count: (await posts.listAll()).length, href: "/admin/posts" },
    { name: "Courses", count: (await courses.listAll()).length, href: "/admin/courses" },
    { name: "Staff", count: (await staff.listAll()).length, href: "/admin/staff" },
    { name: "Notices", count: (await notices.listAll()).length, href: "/admin/notices" },
    { name: "Exam timetables", count: (await timetables.listAll()).length, href: "/admin/timetables" },
    { name: "Tenders", count: (await tenders.listAll()).length, href: "/admin/tenders" },
    { name: "Job postings", count: (await jobs.listAll()).length, href: "/admin/jobs" },
    { name: "Gallery photos", count: (await galleryPhotos.listAll()).length, href: "/admin/gallery" },
    { name: "Documents", count: (await documents.listAll()).length, href: "/admin/downloads" },
    { name: "Applications", count: (await applications.listAll()).length, href: "/admin/applications", badge: newApps },
    { name: "Messages", count: (await inquiries.listAll()).length, href: "/admin/inquiries", badge: unread },
    { name: "Open tasks", count: (await tasks.listAll()).length, href: "/admin/tasks", badge: await tasks.openCount() },
  ];

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl">Welcome, {me.name}</h1>
      <p className="mt-1 text-sm text-steel">Here is what is on the website today.</p>
      {sp.denied && <p className="mt-4 border border-accent bg-accent/10 text-sm px-3 py-2 max-w-xl">That area is for administrators only.</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/admin/posts/new" className="bg-brand-700 text-white text-sm font-semibold px-4 py-2 hover:bg-brand-900">+ New post</Link>
        <Link href="/admin/pages/custom/new" className="border border-brand-700 text-brand-700 text-sm font-semibold px-4 py-2 hover:bg-brand-700 hover:text-white">+ New page</Link>
        <Link href="/admin/media" className="border border-paper-line bg-white text-sm px-4 py-2 hover:border-brand-700">Upload photos</Link>
      </div>
      <div className="mt-8 grid sm:grid-cols-2 xl:grid-cols-3 gap-px bg-paper-line border border-paper-line">
        {cards.map((c) => (
          <Link
            key={c.name}
            href={c.href}
            className="bg-white p-6 hover:bg-paper transition-colors relative"
          >
            {!!c.badge && (
              <span className="absolute top-4 right-4 text-[10px] font-mono bg-accent text-brand-900 px-1.5 rounded-full">
                {c.badge} new
              </span>
            )}
            <p className="font-mono text-3xl text-accent">{c.count}</p>
            <p className="mt-1 text-sm text-steel">{c.name}</p>
          </Link>
        ))}
      </div>
    
      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display font-semibold text-lg">Recent activity</h2>
        <Link href="/admin/activity" className="text-sm text-brand-700 hover:text-accent-dark">See all</Link>
      </div>
      <div className="mt-3"><ActivityList items={recent} /></div>
    </div>
  );
}
