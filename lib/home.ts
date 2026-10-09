import { pageContent } from "@/lib/repo";

export type HeroSlide = {
  kicker: string;
  title: string;
  tagline: string;
  cta: { label: string; href: string };
  src: string;
};
export type Banner = { show: boolean; text: string; linkText: string; href: string };

export type Popup = {
  show: boolean;
  headline: string;
  notice: string;
  welcome: string;
  /** how often one visitor sees it: every page load, once per visit, daily or weekly */
  frequency: "always" | "session" | "daily" | "weekly";
};

export const DEFAULT_POPUP: Popup = {
  show: true,
  headline: "Intake Ongoing",
  notice: "Applications are open now. RPL (Recognition of Prior Learning) programmes are also ongoing. Apply anytime.",
  welcome:
    "where skills are nurtured, talent is developed, and futures are built. We are delighted to have you as part of our learning community.",
  frequency: "session",
};

export async function getPopup(): Promise<{ popup: Popup; version: string; custom: boolean }> {
  const row = await pageContent.get("home:popup");
  let popup = DEFAULT_POPUP;
  if (row?.body) {
    try {
      popup = { ...DEFAULT_POPUP, ...JSON.parse(row.body) };
    } catch {}
  }
  return { popup, version: row ? String(new Date(row.updated_at).getTime()) : "0", custom: !!row };
}

export type Charter = { label: string; value: string };
export type Sections = {
  whoHeadline: string;
  mission: string;
  vision: string;
  values: string;
  deptHeading: string;
  charterHeadline: string;
  charterText: string;
  charter: Charter[];
  ctaHeadline: string;
  ctaButton: string;
};

export const DEFAULT_SECTIONS: Sections = {
  whoHeadline: "A centre of excellence in technical and vocational training.",
  mission: "To provide technical and vocational training that produces competent manpower able to compete in the labour market.",
  vision: "To be a centre of excellence in TVET, empowering learners with skills for innovation, employability and development.",
  values: "Integrity, discipline, teamwork and innovation, practised in every workshop and classroom.",
  deptHeading: "Eight departments, one workshop-first approach.",
  charterHeadline: "A service charter every trainee, staff member and partner can hold us to.",
  charterText:
    "The Charter sets out our service standards, timelines and the shared responsibilities between the institute and the people it serves \u2014 promoting transparency and continuous improvement.",
  charter: [
    { label: "Admission response", value: "3 working days" },
    { label: "Fee queries", value: "24 hours" },
    { label: "Complaints handling", value: "7 working days" },
    { label: "General correspondence", value: "24 hours" },
  ],
  ctaHeadline: "Ready to build a technical career?",
  ctaButton: "Apply now",
};

export const DEFAULT_SLIDES: HeroSlide[] = [
  {
    kicker: "The centre of excellence",
    title: "Murang'a Technical Training Institute",
    tagline: "Nurturing Technological Innovations",
    cta: { label: "See what we offer", href: "/academics" },
    src: `/uploads/migrated/2025/01/Mechanical-1.jpeg`,
  },
  {
    kicker: "Your gateway to skilled careers",
    title: "Building careers, one skill at a time",
    tagline: "Hands-on training across eight departments",
    cta: { label: "Explore our courses", href: "/academics" },
    src: `/uploads/migrated/2025/02/mech-2.jpeg`,
  },
  {
    kicker: "Education beyond the classroom",
    title: "Hands-on training for real results",
    tagline: "From hospitality kitchens to ICT labs",
    cta: { label: "Enroll now", href: "/admissions" },
    src: `/uploads/migrated/2025/02/hosp9.jpeg`,
  },
  {
    kicker: "Skills that transform lives",
    title: "Preparing you for a skilled future",
    tagline: "CBET-accredited programmes, Level 4 to Level 6",
    cta: { label: "Find out more", href: "/about" },
    src: `/uploads/migrated/2025/02/An-Instructor-1024x575.jpeg`,
  },
  {
    kicker: "Where dreams gain skills",
    title: "Turning passion into profession",
    tagline: "September intake is open. RPL applications all year",
    cta: { label: "Apply now", href: "/admissions" },
    src: `/uploads/migrated/2025/02/show-1024x770.jpg`,
  },
];

export const DEFAULT_BANNER: Banner = {
  show: true,
  text: "September intake is open —",
  linkText: "apply today",
  href: "/admissions",
};

function parseSlides(raw: string | undefined): HeroSlide[] | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    if (!Array.isArray(v)) return null;
    const out = v
      .filter((x) => x && typeof x.src === "string" && x.src)
      .map((x) => ({
        kicker: String(x.kicker || ""),
        title: String(x.title || ""),
        tagline: String(x.tagline || ""),
        cta: { label: String(x.cta?.label || ""), href: String(x.cta?.href || "/admissions") },
        src: String(x.src),
      }));
    return out.length ? out : null;
  } catch {
    return null;
  }
}

export async function getHome() {
  const [s, b, pu, sec] = await Promise.all([pageContent.get("home:slides"), pageContent.get("home:banner"), getPopup(),
    pageContent.get("home:sections"),
  ]);
  let banner = DEFAULT_BANNER;
  if (b?.body) {
    try {
      banner = { ...DEFAULT_BANNER, ...JSON.parse(b.body) };
    } catch {}
  }
  return {
    slides: parseSlides(s?.body) || DEFAULT_SLIDES,
    customSlides: !!parseSlides(s?.body),
    customBanner: !!b,
    popup: pu.popup,
    sections: (() => {
      try {
        return sec?.body ? ({ ...DEFAULT_SECTIONS, ...JSON.parse(sec.body) } as Sections) : DEFAULT_SECTIONS;
      } catch {
        return DEFAULT_SECTIONS;
      }
    })(),
    customSections: !!sec,
    customPopup: pu.custom,
    banner,
    updatedAt: s?.updated_at || b?.updated_at,
    updatedBy: s?.updated_by || b?.updated_by,
  };
}
