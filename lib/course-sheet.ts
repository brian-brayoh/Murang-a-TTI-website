import ExcelJS from "exceljs";
import { COURSE_DEPARTMENTS, COURSE_LEVELS } from "@/lib/departments";

export type SheetCourse = {
  department: string;
  name: string;
  level: number;
  duration: string;
  entry: string;
  examBody: string;
  summary: string;
  details: string;
  published: boolean;
};

export const COLUMNS = [
  { key: "department", header: "Department *", width: 30 },
  { key: "name", header: "Course name *", width: 44 },
  { key: "level", header: "Level *", width: 12 },
  { key: "duration", header: "Duration", width: 16 },
  { key: "entry", header: "Entry requirement", width: 34 },
  { key: "examBody", header: "Examined by", width: 18 },
  { key: "summary", header: "Short summary", width: 46 },
  { key: "details", header: "Full description", width: 60 },
  { key: "published", header: "Published (Yes/No)", width: 18 },
] as const;

const MAX_ROWS = 1000;

// ---- building the workbook --------------------------------------------------

export async function buildWorkbook(rows: SheetCourse[], opts: { examples: boolean }): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Murang'a TTI website";

  const ws = wb.addWorksheet("Courses", { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = COLUMNS.map((c) => ({ header: c.header, key: c.key, width: c.width }));
  const head = ws.getRow(1);
  head.height = 24;
  head.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF8F3540" } };
    cell.alignment = { vertical: "middle", wrapText: true };
  });

  const list = rows.map((r) => ({ ...r, level: r.level, published: r.published ? "Yes" : "No" }));
  if (opts.examples) {
    list.push(
      {
        department: "ICT & Informatics",
        name: "EXAMPLE: Diploma in Information Communication Technology (delete this row)",
        level: 6,
        duration: "2 years",
        entry: "KCSE mean grade C- (minus)",
        examBody: "KNEC",
        summary: "One or two sentences shown on the course card.",
        details: "Optional. A longer description shown when a visitor opens the course.",
        published: "Yes",
      } as never,
    );
  }
  for (const r of list) ws.addRow(r);
  ws.eachRow({ includeEmpty: false }, (row, n) => {
    if (n > 1) row.alignment = { vertical: "top", wrapText: true };
  });
  if (opts.examples) {
    const ex = ws.getRow(2);
    ex.font = { italic: true, color: { argb: "FF888888" } };
  }

  // drop-downs on 1000 rows
  const lists = wb.addWorksheet("Lists");
  lists.getCell("A1").value = "Departments";
  lists.getCell("B1").value = "Levels";
  lists.getCell("C1").value = "Published";
  lists.getRow(1).font = { bold: true };
  COURSE_DEPARTMENTS.forEach((d, i) => (lists.getCell(`A${i + 2}`).value = d));
  COURSE_LEVELS.forEach((l, i) => (lists.getCell(`B${i + 2}`).value = l.level));
  lists.getCell("C2").value = "Yes";
  lists.getCell("C3").value = "No";
  lists.getColumn(1).width = 32;
  const deptRef = `Lists!$A$2:$A$${COURSE_DEPARTMENTS.length + 1}`;
  const lvlRef = `Lists!$B$2:$B$${COURSE_LEVELS.length + 1}`;
  for (let r = 2; r <= MAX_ROWS + 1; r++) {
    ws.getCell(`A${r}`).dataValidation = { type: "list", allowBlank: true, formulae: [deptRef], showErrorMessage: true, errorTitle: "Department", error: "Pick a department from the list." };
    ws.getCell(`C${r}`).dataValidation = { type: "list", allowBlank: true, formulae: [lvlRef], showErrorMessage: true, errorTitle: "Level", error: "Use 3 (Level 3, Grade I-III or short course), 4, 5 or 6." };
    ws.getCell(`I${r}`).dataValidation = { type: "list", allowBlank: true, formulae: ['"Yes,No"'] };
  }

  const help = wb.addWorksheet("How to use");
  help.getColumn(1).width = 110;
  const lines = [
    "HOW TO ADD COURSES IN BULK",
    "",
    "1. Go to the 'Courses' sheet. Each row is one course. Delete the grey EXAMPLE row.",
    "2. Department and Course name and Level are required. Pick Department and Level from the drop-down lists.",
    "3. Level: 4 = Artisan, 5 = Craft, 6 = Diploma, 3 = Level 3 / Grades I-III / short course.",
    "4. Duration, Entry requirement, Examined by, Short summary and Full description are optional.",
    "5. Published: Yes shows the course on the website, No keeps it as a hidden draft. Empty means Yes.",
    "6. Save the file, then in the admin go to Courses > Import from Excel and upload it. You see a preview before anything is saved.",
    "",
    "Tip: you can also download all current courses from the admin, edit them here, and upload again with 'Update existing' ticked.",
    "A .csv file with the same column headings also works.",
  ];
  lines.forEach((t, i) => {
    const c = help.getCell(`A${i + 1}`);
    c.value = t;
    c.alignment = { wrapText: true };
    if (i === 0) c.font = { bold: true, size: 14, color: { argb: "FF8F3540" } };
  });
  return Buffer.from(await wb.xlsx.writeBuffer());
}

// ---- reading an uploaded sheet ----------------------------------------------

function cellText(v: ExcelJS.CellValue): string {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const o = v as unknown as Record<string, unknown>;
  if (Array.isArray(o.richText)) return (o.richText as { text: string }[]).map((t) => t.text).join("").trim();
  if (o.result !== undefined) return cellText(o.result as ExcelJS.CellValue);
  if (typeof o.text === "string") return o.text.trim();
  if (typeof o.hyperlink === "string") return o.hyperlink;
  return "";
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

function headerKey(h: string): keyof SheetCourse | null {
  const t = norm(h);
  if (t.startsWith("department")) return "department";
  if (t.startsWith("course") || t === "name" || t === "programme" || t === "program") return "name";
  if (t.startsWith("level")) return "level";
  if (t.startsWith("duration")) return "duration";
  if (t.startsWith("entry")) return "entry";
  if (t.startsWith("exam")) return "examBody";
  if (t.startsWith("short") || t.startsWith("summary")) return "summary";
  if (t.startsWith("full") || t.startsWith("detail") || t.startsWith("description")) return "details";
  if (t.startsWith("published") || t.startsWith("publish")) return "published";
  return null;
}

export type RawRow = { row: number; cells: Partial<Record<keyof SheetCourse, string>> };

export async function readRows(buf: Buffer, filename: string): Promise<RawRow[]> {
  const wb = new ExcelJS.Workbook();
  let ws: ExcelJS.Worksheet | undefined;
  if (/\.csv$/i.test(filename)) {
    const { Readable } = await import("node:stream");
    ws = await wb.csv.read(Readable.from(buf));
  } else {
    try {
      await wb.xlsx.load(buf as never);
    } catch {
      throw new Error("That does not look like an Excel (.xlsx) file. Download the template, fill it in and upload that file.");
    }
    ws = wb.getWorksheet("Courses") || wb.worksheets[0];
  }
  if (!ws) throw new Error("The file has no sheet.");
  const headers: (keyof SheetCourse | null)[] = [];
  ws.getRow(1).eachCell({ includeEmpty: true }, (cell, col) => (headers[col] = headerKey(cellText(cell.value))));
  if (!headers.includes("name") || !headers.includes("department")) {
    throw new Error("Could not find the 'Department' and 'Course name' columns. Please use the template from the admin.");
  }
  const out: RawRow[] = [];
  for (let r = 2; r <= ws.rowCount && out.length < MAX_ROWS; r++) {
    const row = ws.getRow(r);
    const cells: RawRow["cells"] = {};
    let any = false;
    headers.forEach((k, col) => {
      if (!k) return;
      const t = cellText(row.getCell(col).value);
      if (t) any = true;
      cells[k] = t;
    });
    if (any) out.push({ row: r, cells });
  }
  return out;
}

// ---- checking the rows --------------------------------------------------------

const DEPT_ALIASES: [RegExp, (typeof COURSE_DEPARTMENTS)[number]][] = [
  [/applied|science|laborator|biolog/, "Applied Sciences"],
  [/agri/, "Agriculture"],
  [/business|entrepren|accounting|commerce|management(?!.*hospital)/, "Business & Entrepreneurship"],
  [/build|civil|construction/, "Building & Civil"],
  [/electric|electron/, "Electrical & Electronics"],
  [/hospital|catering|food|tourism|hair|beauty|fashion/, "Hospitality Management"],
  [/\bict\b|informat|computer|technology/, "ICT & Informatics"],
  [/mechanic|automotive|engineering/, "Mechanical Engineering"],
];

export function resolveDepartment(v: string): string | null {
  const t = norm(v);
  if (!t) return null;
  const exact = COURSE_DEPARTMENTS.find((d) => norm(d) === t);
  if (exact) return exact;
  for (const [re, d] of DEPT_ALIASES) if (re.test(t)) return d;
  return null;
}

export function resolveLevel(v: string): number | null {
  const t = norm(v);
  if (!t) return null;
  const m = /([3456])/.exec(t);
  if (m && /^(level )?[3456]\b/.test(t)) return Number(m[1]);
  if (/artisan/.test(t)) return 4;
  if (/craft/.test(t)) return 5;
  if (/diploma/.test(t)) return 6;
  if (/short|module|modular/.test(t)) return 3;
  if (m) return Number(m[1]);
  return null;
}

export type CheckedRow = {
  row: number;
  ok: boolean;
  error?: string;
  data?: SheetCourse;
};

export function checkRows(raw: RawRow[]): CheckedRow[] {
  return raw
    .filter((r) => !/^example\b/i.test(r.cells.name || ""))
    .map((r) => {
      const c = r.cells;
      if (!c.name) return { row: r.row, ok: false, error: "Course name is empty" };
      const department = resolveDepartment(c.department || "");
      if (!department) return { row: r.row, ok: false, error: `Department “${c.department || ""}” not recognised. Pick one from the list.` };
      const level = resolveLevel(c.level || "");
      if (!level) return { row: r.row, ok: false, error: `Level “${c.level || ""}” not recognised. Use 3, 4, 5 or 6.` };
      const pub = norm(c.published || "");
      return {
        row: r.row,
        ok: true,
        data: {
          department,
          name: c.name.slice(0, 200),
          level,
          duration: (c.duration || "").slice(0, 80),
          entry: (c.entry || "").slice(0, 300),
          examBody: (c.examBody || "").slice(0, 80),
          summary: (c.summary || "").slice(0, 500),
          details: (c.details || "").slice(0, 8000),
          published: !(pub === "no" || pub === "n" || pub === "false" || pub === "0" || pub === "draft"),
        },
      };
    });
}

export const courseKey = (name: string, department: string, level: number) => `${norm(name)}|${department}|${level}`;
