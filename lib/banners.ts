// Photos behind the heading at the top of each page. Editable in Admin > Site details > Page banners.
const M = "/uploads/migrated";

export const BANNER_PAGES = [
  { key: "about", label: "About us", src: `${M}/2025/02/An-Instructor-1024x575.jpeg` },
  { key: "academics", label: "Academics", src: `${M}/2025/02/l5.jpg` },
  { key: "admissions", label: "Admissions", src: `${M}/2025/02/show-1024x770.jpg` },
  { key: "courses", label: "Courses", src: `${M}/2025/01/Mechanical-1.jpeg` },
  { key: "contact", label: "Contact", src: `${M}/2025/02/mech-2.jpeg` },
  { key: "administration", label: "Administration", src: `${M}/2025/02/An-Instructor-1024x575.jpeg` },
  { key: "staff", label: "Our staff", src: `${M}/2025/02/mech-2.jpeg` },
  { key: "gallery", label: "Gallery", src: `${M}/2025/02/hosp9.jpeg` },
  { key: "downloads", label: "Downloads", src: `${M}/2025/02/l5.jpg` },
  { key: "enotice", label: "E-NOTICE", src: `${M}/2025/02/hosp9.jpeg` },
  { key: "council", label: "Students' Council", src: `${M}/2025/02/show-1024x770.jpg` },
  { key: "tenders", label: "Tenders & careers", src: `${M}/2025/01/Mechanical-1.jpeg` },
  { key: "news", label: "News", src: `${M}/2025/02/An-Instructor-1024x575.jpeg` },
] as const;

export type BannerKey = (typeof BANNER_PAGES)[number]["key"];
export const DEFAULT_BANNERS = Object.fromEntries(BANNER_PAGES.map((b) => [b.key, b.src])) as Record<BannerKey, string>;
