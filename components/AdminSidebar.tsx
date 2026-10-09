"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export type NavGroup = { title: string; items: { name: string; href: string; badge?: number; adminOnly?: boolean }[] };

const ICON: Record<string, string> = {
  Dashboard: "M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10",
  News: "M4 5h13v14H6a2 2 0 01-2-2V5zm13 3h3v9a2 2 0 01-2 2M8 9h5M8 13h5",
  "Home page": "M3 11l9-8 9 8v10h-6v-6H9v6H3V11z",
  "Site details": "M12 3a9 9 0 100 18 9 9 0 000-18zm0 5v5m0 3v.01",
  "Students' Council": "M17 20v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M10 10a4 4 0 100-8 4 4 0 000 8zm13 10v-2a4 4 0 00-3-3.9M16 2.1a4 4 0 010 7.8",
  Partners: "M8 12h8m-8 0a3 3 0 11-6 0 3 3 0 016 0zm14 0a3 3 0 11-6 0 3 3 0 016 0z",
  Pages: "M7 3h7l5 5v13H7V3zm7 0v5h5",
  Notices: "M12 3a6 6 0 00-6 6c0 5-2 6-2 7h16c0-1-2-2-2-7a6 6 0 00-6-6zm-2 16a2 2 0 004 0",
  "Exam timetables": "M4 6h16v14H4V6zm0 5h16M8 3v4M16 3v4",
  Tenders: "M5 3h14v18H5V3zm4 5h6M9 12h6M9 16h4",
  Careers: "M4 8h16v11H4V8zm5 0V5h6v3",
  Downloads: "M12 3v12m0 0l-4-4m4 4l4-4M5 20h14",
  "Media library": "M4 5h16v14H4V5zm0 11l5-5 4 4 3-3 4 4M9 9h.01",
  Gallery: "M3 7h4l2-3h6l2 3h4v13H3V7zm9 10a4 4 0 100-8 4 4 0 000 8z",
  Courses: "M3 8l9-4 9 4-9 4-9-4zm4 2v5c0 1.5 2.5 3 5 3s5-1.5 5-3v-5",
  Staff: "M16 11a4 4 0 10-8 0 4 4 0 008 0zM4 21c0-4 4-6 8-6s8 2 8 6",
  Applications: "M6 3h9l4 4v14H6V3zm3 9h7M9 16h7",
  Messages: "M3 6h18v12H3V6zm0 0l9 7 9-7",
  Tasks: "M5 12l4 4L19 6M5 4h14v16H5V4z",
  Activity: "M3 12h4l3-8 4 16 3-8h4",
  Users: "M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zm-6 9c0-3.5 3-5 6-5s6 1.5 6 5m2-9a3 3 0 100-6m3 11c0-2.5-1.5-4-3-4.5",
  Settings: "M12 15a3 3 0 100-6 3 3 0 000 6zm7-3l2 1-2 3-2-.5-1.5 1V20h-3l-.5-2-2 .5L7 19l-.5-2-2-1 2-3-2-1 2-3 2 .5L8.5 8 9 6h3l.5 2 2-.5L16 8l.5 2 2 1z",
  Help: "M12 17v.01M9.5 9a2.5 2.5 0 115 0c0 1.7-2.5 2-2.5 4M12 3a9 9 0 100 18 9 9 0 000-18z",
  "My account": "M12 12a4 4 0 100-8 4 4 0 000 8zm-8 9c0-4 4-6 8-6s8 2 8 6",
};

function Icon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0 opacity-80">
      <path d={ICON[name] || ICON.Pages} />
    </svg>
  );
}

export default function AdminSidebar({
  groups,
  user,
  signOut,
}: {
  groups: NavGroup[];
  user: { name: string; email: string; role: string };
  signOut: () => Promise<void>;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/admin" ? path === "/admin" : path === href || path.startsWith(href + "/"));

  const nav = (
    <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
      {groups.map((g) => (
        <div key={g.title}>
          <p className="px-3 mb-1.5 font-mono text-[10px] uppercase tracking-widest text-brand-200/60">{g.title}</p>
          <ul className="space-y-0.5">
            {g.items
              .filter((i) => !i.adminOnly || user.role === "admin")
              .map((i) => (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    onClick={() => setOpen(false)}
                    aria-current={active(i.href) ? "page" : undefined}
                    className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors border-l-2 ${
                      active(i.href) ? "bg-white/10 text-white border-accent" : "text-brand-200 border-transparent hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon name={i.name} />
                    <span className="flex-1">{i.name}</span>
                    {!!i.badge && <span className="text-[10px] font-mono bg-accent text-brand-900 px-1.5 rounded-full">{i.badge}</span>}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  const panel = (
    <div className="flex h-full flex-col bg-brand-900 text-white">
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/admin" className="font-display font-semibold text-lg">MTTI admin</Link>
        <a href="/" target="_blank" rel="noopener noreferrer" className="mt-1 block text-xs text-brand-200 hover:text-accent">View website ↗</a>
      </div>
      {nav}
      <div className="border-t border-white/10 p-4">
        <Link href="/admin/account" onClick={() => setOpen(false)} className="flex items-center gap-3 group">
          <span className="h-9 w-9 rounded-full bg-accent text-brand-900 grid place-items-center font-semibold shrink-0">
            {(user.name || user.email).charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium truncate group-hover:text-accent">{user.name || user.email}</span>
            <span className="block text-xs text-brand-200">{user.role === "admin" ? "Administrator" : "Editor"}</span>
          </span>
        </Link>
        <form action={signOut} className="mt-3">
          <button className="w-full text-sm border border-white/25 px-3 py-1.5 hover:border-accent hover:text-accent">Sign out</button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* desktop */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30">{panel}</aside>
      {/* mobile bar + drawer */}
      <div className="lg:hidden sticky top-0 z-30 bg-brand-900 text-white flex items-center justify-between px-4 py-3">
        <Link href="/admin" className="font-display font-semibold">MTTI admin</Link>
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="border border-white/30 px-3 py-1.5 text-sm">Menu</button>
      </div>
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="w-72 max-w-[85vw] h-full">{panel}</div>
          <button aria-label="Close menu" onClick={() => setOpen(false)} className="flex-1 bg-black/50" />
        </div>
      )}
    </>
  );
}
