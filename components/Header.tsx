"use client";

import Link from "next/link";
import { useState } from "react";
import { waHref } from "@/lib/contact-links";
import SocialIcons from "@/components/SocialIcons";

const departments = [
  { name: "All courses", href: "/courses" },
  { name: "Agriculture", href: "/academics#agriculture" },
  { name: "Business & Entrepreneurship", href: "/academics#business" },
  { name: "Building & Civil", href: "/academics#building" },
  { name: "Electrical & Electronics", href: "/academics#electrical" },
  { name: "Hospitality Management", href: "/academics#hospitality" },
  { name: "ICT & Informatics", href: "/academics#ict" },
  { name: "Mechanical Engineering", href: "/academics#mechanical" },
];

const aboutLinks = [
  { name: "About us", href: "/about" },
  { name: "Administration", href: "/administration" },
  { name: "Our Staff", href: "/staff" },
  { name: "Gallery", href: "/gallery" },
];

const eNoticeLinks = [
  { name: "Exam timetables", href: "/e-notice" },
  { name: "Notices", href: "/e-notice" },
  { name: "Students' Council", href: "/students-council" },
];

const navLinks = [
  { name: "Admissions", href: "/admissions" },
  { name: "Downloads", href: "/downloads" },
  { name: "Tenders & Careers", href: "/tenders-careers" },
  { name: "News", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

export default function Header({ site }: { site: { address: string; email: string; hours: string; whatsapp: string; social: { facebook?: string; instagram?: string; x?: string; youtube?: string; tiktok?: string } } }) {
  const [openMenu, setOpenMenu] = useState<"about" | "academics" | "enotice" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-brand-900 text-white">
      <div className="hidden md:flex items-center justify-between px-6 lg:px-10 py-2 text-xs text-white/90 bg-brand-700 border-b border-black/10">
        <span>{site.address}</span>
        <div className="flex items-center gap-5">
          <SocialIcons links={site.social} size={24} />
          <a href={`mailto:${site.email}`} className="hover:text-white">
            {site.email}
          </a>
          <span>{site.hours}</span>
        </div>
      </div>

      <div className="flex items-center justify-between px-6 lg:px-10 py-4">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.jpg"
            alt="Murang'a Technical Training Institute logo"
            className="h-11 w-11 rounded-full bg-white object-cover"
          />
          <span className="font-display font-semibold text-lg leading-tight">
            Murang&apos;a TTI
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 font-medium text-sm">
          <Link href="/" className="hover:text-accent transition-colors">
            Home
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setOpenMenu("about")}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button className="hover:text-accent transition-colors">About</button>
            {openMenu === "about" && (
              <div className="absolute left-0 top-full w-56 bg-white text-ink shadow-xl border-t-2 border-accent py-2">
                {aboutLinks.map((l) => (
                  <Link
                    key={l.name}
                    href={l.href}
                    className="block px-4 py-2.5 text-sm hover:bg-paper hover:text-brand-700"
                  >
                    {l.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div
            className="relative"
            onMouseEnter={() => setOpenMenu("academics")}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button className="hover:text-accent transition-colors">
              Academics
            </button>
            {openMenu === "academics" && (
              <div className="absolute left-0 top-full w-72 bg-white text-ink shadow-xl border-t-2 border-accent py-2">
                {departments.map((d) => (
                  <Link
                    key={d.name}
                    href={d.href}
                    className="block px-4 py-2.5 text-sm hover:bg-paper hover:text-brand-700"
                  >
                    {d.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div
            className="relative"
            onMouseEnter={() => setOpenMenu("enotice")}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button className="hover:text-accent transition-colors">
              Students E-NOTICE
            </button>
            {openMenu === "enotice" && (
              <div className="absolute left-0 top-full w-56 bg-white text-ink shadow-xl border-t-2 border-accent py-2">
                {eNoticeLinks.map((l) => (
                  <Link
                    key={l.name}
                    href={l.href}
                    className="block px-4 py-2.5 text-sm hover:bg-paper hover:text-brand-700"
                  >
                    {l.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {navLinks.map((l) => (
            <Link key={l.name} href={l.href} className="hover:text-accent transition-colors">
              {l.name}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <a
            href={waHref(site.whatsapp, "Hello MTTI, I want to apply")}
            className="text-sm font-medium border border-white/30 px-4 py-2 hover:border-accent hover:text-accent transition-colors"
          >
            WhatsApp us
          </a>
          <Link
            href="/admissions"
            className="text-sm font-semibold bg-accent px-4 py-2 hover:bg-accent-dark transition-colors"
          >
            Apply now
          </Link>
        </div>

        <button
          className="lg:hidden p-2"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className="block w-6 h-0.5 bg-white mb-1.5" />
          <span className="block w-6 h-0.5 bg-white mb-1.5" />
          <span className="block w-6 h-0.5 bg-white" />
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-brand-800 px-6 py-4 flex flex-col gap-1 text-sm">
          <Link href="/" className="py-2 border-b border-white/10">
            Home
          </Link>
          <Link href="/about" className="py-2 border-b border-white/10">
            About
          </Link>
          <Link href="/administration" className="py-2 border-b border-white/10">
            Administration
          </Link>
          <Link href="/staff" className="py-2 border-b border-white/10">
            Our Staff
          </Link>
          <Link href="/academics" className="py-2 border-b border-white/10">
            Academics
          </Link>
          <Link href="/courses" className="py-2 border-b border-white/10">
            Courses
          </Link>
          <Link href="/gallery" className="py-2 border-b border-white/10">
            Gallery
          </Link>
          <Link href="/e-notice" className="py-2 border-b border-white/10">
            Students E-NOTICE
          </Link>
          <Link href="/students-council" className="py-2 border-b border-white/10">
            Students&apos; Council
          </Link>
          {navLinks.map((l) => (
            <Link key={l.name} href={l.href} className="py-2 border-b border-white/10">
              {l.name}
            </Link>
          ))}
          <Link href="/admissions" className="mt-3 bg-accent text-center py-2.5 font-semibold">
            Apply now
          </Link>
          <SocialIcons links={site.social} className="mt-3" />
        </div>
      )}
    </header>
  );
}
