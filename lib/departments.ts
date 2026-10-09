export const STAFF_DEPARTMENTS = [
  "Administration",
  "Agriculture",
  "Business & Entrepreneurship",
  "Building & Civil",
  "Electrical & Electronics",
  "Hospitality Management",
  "ICT & Informatics",
  "Mechanical Engineering",
  "Institute Services",
  "Support Staff",
  "Students' Council",
] as const;

export const ACADEMIC_DEPARTMENTS = [
  "Agriculture",
  "Applied Sciences",
  "Business & Entrepreneurship",
  "Building & Civil",
  "Electrical & Electronics",
  "Hospitality Management",
  "ICT & Informatics",
  "Mechanical Engineering",
] as const;

// Institute terms for CBET levels (from MTTI's published programme pages)
export const LEVEL_LABEL: Record<number, string> = {
  4: "Artisan",
  5: "Craft",
  6: "Diploma",
};

// The eight teaching departments (no Administration / Support Staff).
export const COURSE_DEPARTMENTS = [
  "Agriculture",
  "Applied Sciences",
  "Business & Entrepreneurship",
  "Building & Civil",
  "Electrical & Electronics",
  "Hospitality Management",
  "ICT & Informatics",
  "Mechanical Engineering",
] as const;

// MTTI's own naming for the three CBET levels it trains at.
export const LEVELS = [
  { level: 4, award: "Artisan" },
  { level: 5, award: "Craft" },
  { level: 6, award: "Diploma" },
] as const;

// Admin-only: same as LEVELS plus Level 3 and the trade-test Grades I-III (and short courses).
export const COURSE_LEVELS = [{ level: 3, award: "Level 3 / Grades" }, ...LEVELS] as const;
