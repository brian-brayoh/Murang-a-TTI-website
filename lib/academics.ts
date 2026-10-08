// Academics content. Electrical & Electronics is taken word-for-word in
// substance from MTTI's live "Course Offered" page. The other six
// departments carry only what the institute has published in general
// (department names, workshop photo captions); add their real programme
// lists in `levels` below as the registrar confirms them. Any department
// with no `levels` shows a pointer to admissions instead of invented courses.
// Local copies of the old site photos. Run `npm run images:sync` once to download them.
const BASE = "/uploads/migrated";

export type Level = { level: string; award: string; summary: string };

export type Department = {
  id: string;
  name: string;
  tagline: string;
  blurb: string;
  focus?: string[];
  levels?: Level[];
  careers?: string[];
  // For departments whose course list isn't published yet: what the old site
  // does say about them (sections or subjects), shown on the Courses page.
  highlights?: string[];
  highlightsLabel?: string;
  image?: string;
  imageCaption?: string;
};

export const pathway = [
  {
    level: "Level 4",
    award: "Artisan certificate",
    text: "Foundational, hands-on skills in a trade, with safety practice from day one.",
  },
  {
    level: "Level 5",
    award: "Craft certificate",
    text: "Deeper practical skill: installing, building, measuring and troubleshooting.",
  },
  {
    level: "Level 6",
    award: "Diploma",
    text: "Advanced technician competence, ready for industry or further study.",
  },
];

export const departments: Department[] = [
  {
    id: "agriculture",
    name: "Agriculture",
    tagline: "Farming as a business",
    blurb:
      "Crop and livestock training built around enterprise, so graduates can farm profitably or work in the wider agricultural sector.",
    image: `${BASE}/2025/04/cattle-farming.jpg`,
    imageCaption: "Livestock training, Agriculture Department",
  },
  {
    id: "business",
    name: "Business & Entrepreneurship",
    tagline: "Skills to run and grow an enterprise",
    blurb:
      "Business, records and enterprise skills for self-reliant graduates. Enterprise education runs through every programme at the institute.",
    highlightsLabel: "Subjects",
    highlights: ["Accounting", "Economics", "Business law", "Entrepreneurship", "Management", "Business ethics", "Information systems"],
  },
  {
    id: "building",
    name: "Building & Civil",
    tagline: "Learn the trade on the site floor",
    blurb:
      "Construction trades taught in working workshops, including a dedicated wood section for carpentry and joinery practice.",
    image: `${BASE}/elementor/thumbs/BUILD5-r15dhtqutldw52bjigetz4dvkp3gv02jpe3oir4090.jpeg`,
    imageCaption: "Wood section, Building Department",
  },
  {
    id: "electrical",
    name: "Electrical & Electronics",
    tagline: "From first wiring circuit to PLC automation",
    blurb:
      "Modern laboratories, tools and simulation software give trainees real-world practice, with industrial attachments and placement support through industry partners.",
    focus: [
      "Electrical power systems and transmission",
      "Electronics design and maintenance",
      "Automation and control systems",
      "Renewable energy systems: solar, wind and hydroelectric",
    ],
    levels: [
      {
        level: "Level 4",
        award: "Artisan certificate in Electrical and Electronics Technology",
        summary: "Basic wiring techniques, safety protocols and an introduction to electronic components.",
      },
      {
        level: "Level 5",
        award: "Craft in Electrical and Electronics Technology",
        summary: "Electrical measurements, domestic and commercial wiring, and basic troubleshooting.",
      },
      {
        level: "Level 6",
        award: "Diploma in Electrical and Electronics Engineering",
        summary: "Industrial automation, advanced circuit analysis and programmable logic controllers (PLCs).",
      },
    ],
    careers: [
      "Electrical technician",
      "Electronics specialist",
      "Renewable energy engineer",
      "Project manager",
    ],
    image: `${BASE}/2025/02/l5.jpg`,
    imageCaption: "Electrical and Electronics workshop",
  },
  {
    id: "hospitality",
    name: "Hospitality Management",
    tagline: "Kitchens, service and guest care",
    blurb:
      "Practical food production and service training in the institute's hospitality facilities, preparing trainees for hotels, catering and institutional management.",
    image: `${BASE}/2025/03/hos3-768x1024.jpeg`,
    highlightsLabel: "Sections",
    highlights: ["Food and beverage", "Housekeeping and laundry", "Fashion design", "Hair dressing and beauty"],
    imageCaption: "Hospitality trainees at work",
  },
  {
    id: "ict",
    name: "ICT & Informatics",
    tagline: "Digital skills for a connected economy",
    blurb:
      "Computer laboratory practice for trainees who want to work as ICT technicians and build digital skills employers ask for.",
    image: `${BASE}/2025/01/WhatsApp-Image-2025-01-23-at-7.05.09-AM-1-300x225.jpeg`,
    imageCaption: "ICT technician trainee demonstrating a skill",
  },
  {
    id: "mechanical",
    name: "Mechanical Engineering",
    tagline: "Engines, machines and workshop precision",
    blurb:
      "Well-equipped mechanical workshops where trainees learn by doing, from automotive engineering to machining, the same workshops visited by state officials.",
    image: `${BASE}/2025/02/mech-2.jpeg`,
    imageCaption: "Mechanical trainee demonstrating a skill in the workshop",
  },
];
