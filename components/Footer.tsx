import Link from "next/link";
import { telHref } from "@/lib/contact-links";
import SocialIcons from "@/components/SocialIcons";
import type { SiteDetails } from "@/lib/site-details";

const quickLinks = [
  { name: "About us", href: "/about" },
  { name: "Administration", href: "/administration" },
  { name: "Our Staff", href: "/staff" },
  { name: "Academics", href: "/academics" },
  { name: "Courses", href: "/courses" },
  { name: "Admissions", href: "/admissions" },
  { name: "Gallery", href: "/gallery" },
  { name: "Downloads", href: "/downloads" },
  { name: "Tenders & Careers", href: "/tenders-careers" },
  { name: "Contact", href: "/contact" },
];

export default function Footer({ site }: { site: SiteDetails }) {
  return (
    <footer className="bg-brand-900 text-brand-200">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-14 grid gap-10 md:grid-cols-3">
        <div>
          <span className="font-display font-semibold text-lg text-white">
            Murang&apos;a TTI
          </span>
          <p className="mt-3 text-sm leading-relaxed">{site.footerBlurb}</p>
          <SocialIcons links={site} className="mt-4" />
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold text-white tick">
            Quick links
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {quickLinks.map((l) => (
              <li key={l.name}>
                <Link href={l.href} className="hover:text-accent transition-colors">
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold text-white tick">
            Get in touch
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>{site.address}</li>
            <li>
              <a href={`tel:${telHref(site.phone)}`} className="hover:text-accent">{site.phone}</a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-accent">
                {site.email}
              </a>
            </li>
            <li>{site.hours}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs">
          <span>&copy; {new Date().getFullYear()} Murang&apos;a Technical Training Institute</span>
          <span>Designed &amp; built by BMM Creations</span>
        </div>
      </div>
    </footer>
  );
}
