// One place that describes the simple "edit this record" forms in the admin:
// tenders, careers, exam timetables, downloads, gallery photos, staff and courses.
import { ACADEMIC_DEPARTMENTS, COURSE_DEPARTMENTS, STAFF_DEPARTMENTS } from "./departments";

export type Field = {
  name: string; // form field name
  col: string; // column on the record
  label: string;
  kind: "text" | "textarea" | "select" | "date" | "image" | "file" | "datalist";
  options?: readonly string[] | { value: string; label: string }[];
  hint?: string;
  required?: boolean;
};

export type EditType = {
  label: string; // singular, for headings
  list: string; // admin list page
  revalidate: string[]; // public pages to refresh after a save
  fields: Field[];
};

const posted: Field[] = [
  { name: "title", col: "title", label: "Title", kind: "text", required: true },
  { name: "status", col: "status", label: "Status shown on the website", kind: "datalist", options: ["Open", "Closed"], hint: "e.g. Open, Closed, or Posted Mar 2025" },
  { name: "attachmentUrl", col: "attachment_url", label: "Document (PDF or Word)", kind: "file" },
  { name: "date", col: "created_at", label: "Date", kind: "date" },
];

export const EDIT_TYPES: Record<string, EditType> = {
  tender: { label: "Tender", list: "/admin/tenders", revalidate: ["/tenders-careers"], fields: posted },
  job: { label: "Career opening", list: "/admin/jobs", revalidate: ["/tenders-careers"], fields: posted },
  timetable: {
    label: "Exam timetable",
    list: "/admin/timetables",
    revalidate: ["/e-notice"],
    fields: [
      { name: "department", col: "department", label: "Department", kind: "select", options: ACADEMIC_DEPARTMENTS, required: true },
      { name: "level", col: "level", label: "Level", kind: "text", required: true, hint: "e.g. Level 5" },
      { name: "dateRange", col: "date_range", label: "Dates", kind: "text", required: true, hint: "e.g. Oct 6–10, 2026" },
    ],
  },
  document: {
    label: "Download",
    list: "/admin/downloads",
    revalidate: ["/downloads"],
    fields: [
      { name: "title", col: "title", label: "Title", kind: "text", required: true },
      { name: "category", col: "category", label: "Group on the Downloads page", kind: "datalist", options: ["General", "Fees", "Forms", "Admissions", "Academic calendar"] },
      { name: "url", col: "url", label: "File", kind: "file", required: true },
    ],
  },
  gallery: {
    label: "Gallery photo",
    list: "/admin/gallery",
    revalidate: ["/gallery"],
    fields: [
      { name: "url", col: "url", label: "Photo", kind: "image", required: true },
      { name: "caption", col: "caption", label: "Caption", kind: "text" },
      { name: "category", col: "category", label: "Group", kind: "datalist", options: ["Workshops & labs", "Campus life"] },
    ],
  },
  staff: {
    label: "Staff member",
    list: "/admin/staff",
    revalidate: ["/staff", "/administration", "/about"],
    fields: [
      { name: "name", col: "name", label: "Full name", kind: "text", required: true },
      { name: "title", col: "title", label: "Job title", kind: "text", required: true },
      { name: "department", col: "department", label: "Department", kind: "select", options: STAFF_DEPARTMENTS, required: true },
      { name: "photoUrl", col: "photo_url", label: "Photo", kind: "image" },
    ],
  },
  course: {
    label: "Course",
    list: "/admin/courses",
    revalidate: ["/courses", "/academics"],
    fields: [
      { name: "name", col: "name", label: "Course name", kind: "text", required: true },
      { name: "department", col: "department", label: "Department", kind: "select", options: COURSE_DEPARTMENTS, required: true },
      {
        name: "level",
        col: "level",
        label: "Level",
        kind: "select",
        options: [
          { value: "4", label: "Level 4 · Artisan" },
          { value: "5", label: "Level 5 · Craft" },
          { value: "6", label: "Level 6 · Diploma" },
          { value: "3", label: "Short course" },
        ],
      },
      { name: "duration", col: "duration", label: "Duration", kind: "text", hint: "e.g. 3 years" },
      { name: "entry", col: "entry", label: "Entry requirement", kind: "text", hint: "e.g. KCSE C- and above" },
      { name: "examBody", col: "exam_body", label: "Examined by", kind: "text", hint: "e.g. KNEC or CDACC" },
      { name: "summary", col: "summary", label: "Short description", kind: "textarea" },
    ],
  },
};
