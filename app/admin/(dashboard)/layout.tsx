import { auth, signOut } from "@/auth";
import { inquiries, applications, tasks } from "@/lib/repo";
import { redirect } from "next/navigation";
import { displayName } from "@/lib/guard";
import { adminUsers } from "@/lib/repo";
import AdminSidebar, { type NavGroup } from "@/components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // /admin/login renders its own full-screen layout; everything else here
  // requires a session.
  const u = session?.user as { email?: string | null } | undefined;
  if (!u?.email) redirect("/admin/login");
  const row = await adminUsers.findByEmail(u.email);
  if (!row) redirect("/admin/login");

  const [unread, newApps, openTasks] = await Promise.all([inquiries.unreadCount(), applications.newCount(), tasks.openCount()]);

  const groups: NavGroup[] = [
    { title: "Overview", items: [{ name: "Dashboard", href: "/admin" }] },
    {
      title: "Content",
      items: [
        { name: "News", href: "/admin/posts" },
        { name: "Home page", href: "/admin/home" },
        { name: "Site details", href: "/admin/site" },
        { name: "Pages", href: "/admin/pages" },
        { name: "Notices", href: "/admin/notices" },
        { name: "Exam timetables", href: "/admin/timetables" },
        { name: "Tenders", href: "/admin/tenders" },
        { name: "Careers", href: "/admin/jobs" },
        { name: "Downloads", href: "/admin/downloads" },
      ],
    },
    {
      title: "Media",
      items: [
        { name: "Media library", href: "/admin/media" },
        { name: "Gallery", href: "/admin/gallery" },
      ],
    },
    {
      title: "Institute",
      items: [
        { name: "Courses", href: "/admin/courses" },
        { name: "Staff", href: "/admin/staff" },
        { name: "Students' Council", href: "/admin/council" },
        { name: "Partners", href: "/admin/partners" },
      ],
    },
    {
      title: "Inbox",
      items: [
        { name: "Applications", href: "/admin/applications", badge: newApps },
        { name: "Messages", href: "/admin/inquiries", badge: unread },
      ],
    },
    {
      title: "Site",
      items: [
        { name: "Tasks", href: "/admin/tasks", badge: openTasks },
        { name: "Activity", href: "/admin/activity" },
        { name: "Users", href: "/admin/users", adminOnly: true },
        { name: "Settings", href: "/admin/settings", adminOnly: true },
        { name: "Help", href: "/admin/help" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <AdminSidebar
        groups={groups}
        user={{ name: displayName(row), email: row.email, role: row.role === "editor" ? "editor" : "admin" }}
        signOut={async () => {
          "use server";
          await signOut({ redirectTo: "/admin/login" });
        }}
      />
      <main className="lg:pl-64">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
