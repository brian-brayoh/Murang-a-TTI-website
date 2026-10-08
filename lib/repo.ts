import { sql, ensureSchema, newId } from "./db";

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ---- Posts ----
export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  author: string;
  published: boolean;
  created_at: string;
  image_url: string;
  images: string; // JSON string[]
  attachments: string; // JSON {label,url}[]
  legacy_url: string;
  updated_by: string;
  updated_at: string | null;
};

export type Attachment = { label: string; url: string };

export function parseJsonList<T>(value: string | null | undefined): T[] {
  try {
    const v = JSON.parse(value || "[]");
    return Array.isArray(v) ? (v as T[]) : [];
  } catch {
    return [];
  }
}

export const posts = {
  async getBySlug(slug: string): Promise<Post | undefined> {
    await ensureSchema();
    const rows = (await sql`SELECT * FROM post WHERE slug = ${slug} AND published = TRUE`) as Post[];
    return rows[0];
  },
  async listPublished(): Promise<Post[]> {
    await ensureSchema();
    return (await sql`SELECT * FROM post WHERE published = TRUE ORDER BY created_at DESC`) as Post[];
  },
  async listAll(): Promise<Post[]> {
    await ensureSchema();
    return (await sql`SELECT * FROM post ORDER BY created_at DESC`) as Post[];
  },
  async create(input: {
    title: string;
    excerpt: string;
    body: string;
    author?: string;
    slug?: string;
    imageUrl?: string;
    images?: string[];
    attachments?: Attachment[];
    legacyUrl?: string;
    createdAt?: string;
  }) {
    await ensureSchema();
    const id = newId("post");
    let slug = slugify(input.slug || input.title) || id;
    const exists = await sql`SELECT id FROM post WHERE slug = ${slug}`;
    if (exists.length) slug = `${slug}-${id.slice(-4)}`;
    const createdAt = input.createdAt || new Date().toISOString();
    await sql`INSERT INTO post (id, title, slug, excerpt, body, author, image_url, images, attachments, legacy_url, created_at)
              VALUES (${id}, ${input.title}, ${slug}, ${input.excerpt}, ${input.body}, ${input.author || "The Registrar"},
                      ${input.imageUrl || ""}, ${JSON.stringify(input.images || [])}, ${JSON.stringify(input.attachments || [])},
                      ${input.legacyUrl || ""}, ${createdAt})`;
    return id;
  },
  async remove(id: string) {
    await ensureSchema();
    await sql`DELETE FROM post WHERE id = ${id}`;
  },
  async togglePublished(id: string, published: boolean) {
    await ensureSchema();
    await sql`UPDATE post SET published = ${published} WHERE id = ${id}`;
  },
};

// ---- Notices ----
export type Notice = {
  id: string;
  title: string;
  body: string;
  published: boolean;
  created_at: string;
  attachment_url: string;
  legacy_url: string;
  image_url: string;
  attachments: string; // JSON {label,url}[]
};

/** Every file on a notice: the single legacy link plus the attachment list, de-duplicated. */
export function noticeFiles(n: Pick<Notice, "attachment_url" | "attachments">): Attachment[] {
  const list = parseJsonList<Attachment>(n.attachments).filter((a) => a && a.url);
  if (n.attachment_url && !list.some((a) => a.url === n.attachment_url)) {
    list.unshift({ label: "", url: n.attachment_url });
  }
  return list;
}

export const notices = {
  async listPublished(): Promise<Notice[]> {
    await ensureSchema();
    return (await sql`SELECT * FROM notice WHERE published = TRUE ORDER BY created_at DESC`) as Notice[];
  },
  async listAll(): Promise<Notice[]> {
    await ensureSchema();
    return (await sql`SELECT * FROM notice ORDER BY created_at DESC`) as Notice[];
  },
  async getById(id: string): Promise<Notice | undefined> {
    await ensureSchema();
    return ((await sql`SELECT * FROM notice WHERE id = ${id}`) as Notice[])[0];
  },
  async create(input: { title: string; body: string; attachmentUrl?: string; imageUrl?: string; attachments?: Attachment[]; legacyUrl?: string; createdAt?: string; published?: boolean }) {
    await ensureSchema();
    const id = newId("notice");
    await sql`INSERT INTO notice (id, title, body, attachment_url, image_url, attachments, legacy_url, published, created_at)
              VALUES (${id}, ${input.title}, ${input.body}, ${input.attachmentUrl || ""}, ${input.imageUrl || ""},
                      ${JSON.stringify(input.attachments || [])}, ${input.legacyUrl || ""}, ${input.published ?? true},
                      ${input.createdAt || new Date().toISOString()})`;
    return id;
  },
  async update(id: string, input: { title: string; body: string; imageUrl: string; attachments: Attachment[]; createdAt?: string; published: boolean }) {
    await ensureSchema();
    const createdAt = input.createdAt || null;
    // the single legacy link is folded into the list, so the form is the one source of truth
    await sql`UPDATE notice SET title = ${input.title}, body = ${input.body}, image_url = ${input.imageUrl},
              attachments = ${JSON.stringify(input.attachments)}, attachment_url = '', published = ${input.published},
              created_at = COALESCE(${createdAt}::timestamptz, created_at) WHERE id = ${id}`;
  },
  async remove(id: string) {
    await ensureSchema();
    await sql`DELETE FROM notice WHERE id = ${id}`;
  },
};

/** Used by `npm run migrate -- --backfill`: fills missing media on already-imported items. */
export async function backfillMedia(
  table: "notice" | "tender" | "job_posting",
  legacyUrl: string,
  media: { imageUrl: string; files: Attachment[] }
): Promise<"updated" | "unchanged" | "missing"> {
  await ensureSchema();
  const q = table === "notice" ? sql`SELECT * FROM notice WHERE legacy_url = ${legacyUrl}`
    : table === "tender" ? sql`SELECT * FROM tender WHERE legacy_url = ${legacyUrl}`
    : sql`SELECT * FROM job_posting WHERE legacy_url = ${legacyUrl}`;
  const row = ((await q) as (Notice & { id: string })[])[0];
  if (!row) return "missing";
  if (table === "notice") {
    const have = noticeFiles(row);
    const merged = [...have];
    for (const f of media.files) if (!merged.some((m) => m.url === f.url)) merged.push(f);
    const image = row.image_url || media.imageUrl;
    if (merged.length === have.length && image === row.image_url) return "unchanged";
    await sql`UPDATE notice SET image_url = ${image}, attachments = ${JSON.stringify(merged)} WHERE id = ${row.id}`;
    return "updated";
  }
  if (row.attachment_url || !media.files[0]) return "unchanged";
  if (table === "tender") await sql`UPDATE tender SET attachment_url = ${media.files[0].url} WHERE id = ${row.id}`;
  else await sql`UPDATE job_posting SET attachment_url = ${media.files[0].url} WHERE id = ${row.id}`;
  return "updated";
}

// ---- Exam timetables ----
export type ExamTimetable = {
  id: string;
  department: string;
  level: string;
  date_range: string;
  created_at: string;
};

export const timetables = {
  async get(id: string): Promise<ExamTimetable | undefined> {
    await ensureSchema();
    return ((await sql`SELECT * FROM exam_timetable WHERE id = ${id}`) as ExamTimetable[])[0];
  },
  async update(id: string, v: { department: string; level: string; dateRange: string }) {
    await ensureSchema();
    await sql`UPDATE exam_timetable SET department = ${v.department}, level = ${v.level}, date_range = ${v.dateRange} WHERE id = ${id}`;
  },
  async listAll(): Promise<ExamTimetable[]> {
    await ensureSchema();
    return (await sql`SELECT * FROM exam_timetable ORDER BY created_at DESC`) as ExamTimetable[];
  },
  async create(input: { department: string; level: string; dateRange: string }) {
    await ensureSchema();
    const id = newId("tt");
    await sql`INSERT INTO exam_timetable (id, department, level, date_range)
              VALUES (${id}, ${input.department}, ${input.level}, ${input.dateRange})`;
    return id;
  },
  async remove(id: string) {
    await ensureSchema();
    await sql`DELETE FROM exam_timetable WHERE id = ${id}`;
  },
};

// ---- Tenders ----
export type Tender = { id: string; title: string; status: string; created_at: string; attachment_url: string; legacy_url: string };

export const tenders = {
  async get(id: string): Promise<Tender | undefined> {
    await ensureSchema();
    return ((await sql`SELECT * FROM tender WHERE id = ${id}`) as Tender[])[0];
  },
  async update(id: string, v: { title: string; status: string; attachmentUrl: string; createdAt?: string }) {
    await ensureSchema();
    const createdAt = v.createdAt || null;
    await sql`UPDATE tender SET title = ${v.title}, status = ${v.status}, attachment_url = ${v.attachmentUrl},
              created_at = COALESCE(${createdAt}::timestamptz, created_at) WHERE id = ${id}`;
  },
  async listAll(): Promise<Tender[]> {
    await ensureSchema();
    return (await sql`SELECT * FROM tender ORDER BY created_at DESC`) as Tender[];
  },
  async create(input: { title: string; status?: string; attachmentUrl?: string; legacyUrl?: string; createdAt?: string }) {
    await ensureSchema();
    const id = newId("tender");
    await sql`INSERT INTO tender (id, title, status, attachment_url, legacy_url, created_at)
              VALUES (${id}, ${input.title}, ${input.status || "Open"}, ${input.attachmentUrl || ""}, ${input.legacyUrl || ""},
                      ${input.createdAt || new Date().toISOString()})`;
    return id;
  },
  async remove(id: string) {
    await ensureSchema();
    await sql`DELETE FROM tender WHERE id = ${id}`;
  },
};

// ---- Job postings ----
export type JobPosting = { id: string; title: string; status: string; created_at: string; attachment_url: string; legacy_url: string };

export const jobs = {
  async get(id: string): Promise<JobPosting | undefined> {
    await ensureSchema();
    return ((await sql`SELECT * FROM job_posting WHERE id = ${id}`) as JobPosting[])[0];
  },
  async update(id: string, v: { title: string; status: string; attachmentUrl: string; createdAt?: string }) {
    await ensureSchema();
    const createdAt = v.createdAt || null;
    await sql`UPDATE job_posting SET title = ${v.title}, status = ${v.status}, attachment_url = ${v.attachmentUrl},
              created_at = COALESCE(${createdAt}::timestamptz, created_at) WHERE id = ${id}`;
  },
  async listAll(): Promise<JobPosting[]> {
    await ensureSchema();
    return (await sql`SELECT * FROM job_posting ORDER BY created_at DESC`) as JobPosting[];
  },
  async create(input: { title: string; status?: string; attachmentUrl?: string; legacyUrl?: string; createdAt?: string }) {
    await ensureSchema();
    const id = newId("job");
    await sql`INSERT INTO job_posting (id, title, status, attachment_url, legacy_url, created_at)
              VALUES (${id}, ${input.title}, ${input.status || "Open"}, ${input.attachmentUrl || ""}, ${input.legacyUrl || ""},
                      ${input.createdAt || new Date().toISOString()})`;
    return id;
  },
  async remove(id: string) {
    await ensureSchema();
    await sql`DELETE FROM job_posting WHERE id = ${id}`;
  },
};

// ---- Admin users ----
export type AdminUser = { id: string; email: string; name: string; role: "admin" | "editor"; password_hash: string; created_at: string };

export const adminUsers = {
  async findByEmail(email: string) {
    await ensureSchema();
    const rows = (await sql`SELECT * FROM admin_user WHERE lower(email) = lower(${email})`) as AdminUser[];
    return rows[0];
  },
  async findById(id: string) {
    await ensureSchema();
    return ((await sql`SELECT * FROM admin_user WHERE id = ${id}`) as AdminUser[])[0];
  },
  async list(): Promise<AdminUser[]> {
    await ensureSchema();
    return (await sql`SELECT * FROM admin_user ORDER BY created_at`) as AdminUser[];
  },
  async setPassword(email: string, passwordHash: string) {
    await ensureSchema();
    const rows = await sql`UPDATE admin_user SET password_hash = ${passwordHash} WHERE lower(email) = lower(${email}) RETURNING id`;
    return rows.length > 0;
  },
  async setPasswordById(id: string, passwordHash: string) {
    await ensureSchema();
    await sql`UPDATE admin_user SET password_hash = ${passwordHash} WHERE id = ${id}`;
  },
  async create(input: { email: string; passwordHash: string; name?: string; role?: "admin" | "editor" }) {
    await ensureSchema();
    const id = newId("admin");
    await sql`INSERT INTO admin_user (id, email, password_hash, name, role)
              VALUES (${id}, ${input.email}, ${input.passwordHash}, ${input.name || ""}, ${input.role || "admin"})`;
    return id;
  },
  async update(id: string, input: { name?: string; role?: "admin" | "editor" }) {
    await ensureSchema();
    if (input.name !== undefined) await sql`UPDATE admin_user SET name = ${input.name} WHERE id = ${id}`;
    if (input.role !== undefined) await sql`UPDATE admin_user SET role = ${input.role} WHERE id = ${id}`;
  },
  async remove(id: string) {
    await ensureSchema();
    await sql`DELETE FROM admin_user WHERE id = ${id}`;
  },
  async adminCount() {
    await ensureSchema();
    return Number(((await sql`SELECT COUNT(*)::int AS n FROM admin_user WHERE role = 'admin'`) as { n: number }[])[0].n);
  },
};

// ---- Activity log ----
export type Activity = { id: string; user_email: string; user_name: string; action: string; entity: string; title: string; created_at: string };

export const activity = {
  async add(a: { email: string; name: string; action: string; entity: string; title?: string }) {
    await ensureSchema();
    await sql`INSERT INTO audit_log (id, user_email, user_name, action, entity, title)
              VALUES (${newId("log")}, ${a.email}, ${a.name}, ${a.action}, ${a.entity}, ${(a.title || "").slice(0, 200)})`;
  },
  async recent(limit = 100): Promise<Activity[]> {
    await ensureSchema();
    return (await sql`SELECT * FROM audit_log ORDER BY created_at DESC LIMIT ${limit}`) as Activity[];
  },
};

// ---- Site settings ----
export type SiteSettings = {
  courses_on_offer: string;
  trainees: string;
  trainers: string;
  departments: string;
};

const DEFAULT_SETTINGS: SiteSettings = {
  courses_on_offer: "30+",
  trainees: "1200+",
  trainers: "60+",
  departments: "7",
};

export const settings = {
  async getAll(): Promise<SiteSettings> {
    await ensureSchema();
    const rows = (await sql`SELECT key, value FROM site_setting`) as { key: string; value: string }[];
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return { ...DEFAULT_SETTINGS, ...map };
  },
  async set(values: Partial<SiteSettings>) {
    await ensureSchema();
    for (const [k, v] of Object.entries(values)) {
      await sql`INSERT INTO site_setting (key, value) VALUES (${k}, ${String(v)})
                ON CONFLICT (key) DO UPDATE SET value = excluded.value`;
    }
  },
};

// ---- Gallery photos ----
export type GalleryPhoto = { id: string; url: string; caption: string; category: string; created_at: string };

export const galleryPhotos = {
  async get(id: string): Promise<GalleryPhoto | undefined> {
    await ensureSchema();
    return ((await sql`SELECT * FROM gallery_photo WHERE id = ${id}`) as GalleryPhoto[])[0];
  },
  async update(id: string, v: { url: string; caption: string; category: string }) {
    await ensureSchema();
    await sql`UPDATE gallery_photo SET url = ${v.url}, caption = ${v.caption}, category = ${v.category} WHERE id = ${id}`;
  },
  async listAll(): Promise<GalleryPhoto[]> {
    await ensureSchema();
    return (await sql`SELECT * FROM gallery_photo ORDER BY created_at DESC`) as GalleryPhoto[];
  },
  async create(input: { url: string; caption?: string; category?: string }) {
    await ensureSchema();
    const id = newId("photo");
    await sql`INSERT INTO gallery_photo (id, url, caption, category)
              VALUES (${id}, ${input.url}, ${input.caption || ""}, ${input.category || "Campus life"})`;
    return id;
  },
  async remove(id: string) {
    await ensureSchema();
    await sql`DELETE FROM gallery_photo WHERE id = ${id}`;
  },
};

// ---- Documents ----
export type Doc = { id: string; title: string; url: string; category: string; created_at: string };

export const documents = {
  async get(id: string): Promise<Doc | undefined> {
    await ensureSchema();
    return ((await sql`SELECT * FROM document WHERE id = ${id}`) as Doc[])[0];
  },
  async update(id: string, v: { title: string; url: string; category: string }) {
    await ensureSchema();
    await sql`UPDATE document SET title = ${v.title}, url = ${v.url}, category = ${v.category} WHERE id = ${id}`;
  },
  async listAll(): Promise<Doc[]> {
    await ensureSchema();
    return (await sql`SELECT * FROM document ORDER BY category, title`) as Doc[];
  },
  async create(input: { title: string; url: string; category?: string }) {
    await ensureSchema();
    const id = newId("doc");
    await sql`INSERT INTO document (id, title, url, category)
              VALUES (${id}, ${input.title}, ${input.url}, ${input.category || "General"})`;
    return id;
  },
  async remove(id: string) {
    await ensureSchema();
    await sql`DELETE FROM document WHERE id = ${id}`;
  },
};

// ---- Contact form inquiries ----
export type Inquiry = { id: string; name: string; email: string; message: string; is_read: boolean; created_at: string };

export const inquiries = {
  async listAll(): Promise<Inquiry[]> {
    await ensureSchema();
    return (await sql`SELECT * FROM inquiry ORDER BY created_at DESC`) as Inquiry[];
  },
  async create(input: { name: string; email: string; message: string }) {
    await ensureSchema();
    const id = newId("inq");
    await sql`INSERT INTO inquiry (id, name, email, message) VALUES (${id}, ${input.name}, ${input.email}, ${input.message})`;
    return id;
  },
  async markRead(id: string) {
    await ensureSchema();
    await sql`UPDATE inquiry SET is_read = TRUE WHERE id = ${id}`;
  },
  async remove(id: string) {
    await ensureSchema();
    await sql`DELETE FROM inquiry WHERE id = ${id}`;
  },
  async unreadCount(): Promise<number> {
    await ensureSchema();
    const rows = (await sql`SELECT COUNT(*)::int as n FROM inquiry WHERE is_read = FALSE`) as { n: number }[];
    return rows[0].n;
  },
};

// ---- Admissions applications ----
export type Application = {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  level: number;
  message: string;
  status: string;
  created_at: string;
};

export const applications = {
  async listAll(): Promise<Application[]> {
    await ensureSchema();
    return (await sql`SELECT * FROM application ORDER BY created_at DESC`) as Application[];
  },
  async create(input: {
    name: string;
    email: string;
    phone?: string;
    department: string;
    level: number;
    message?: string;
  }) {
    await ensureSchema();
    const id = newId("app");
    await sql`INSERT INTO application (id, name, email, phone, department, level, message)
              VALUES (${id}, ${input.name}, ${input.email}, ${input.phone || ""}, ${input.department}, ${input.level}, ${input.message || ""})`;
    return id;
  },
  async setStatus(id: string, status: string) {
    await ensureSchema();
    await sql`UPDATE application SET status = ${status} WHERE id = ${id}`;
  },
  async remove(id: string) {
    await ensureSchema();
    await sql`DELETE FROM application WHERE id = ${id}`;
  },
  async newCount(): Promise<number> {
    await ensureSchema();
    const rows = (await sql`SELECT COUNT(*)::int as n FROM application WHERE status = 'New'`) as { n: number }[];
    return rows[0].n;
  },
};

// ---- Staff ----
export type Staff = { id: string; name: string; title: string; department: string; photo_url: string; created_at: string };

export const staff = {
  async get(id: string): Promise<Staff | undefined> {
    await ensureSchema();
    return ((await sql`SELECT * FROM staff WHERE id = ${id}`) as Staff[])[0];
  },
  async update(id: string, v: { name: string; title: string; department: string; photoUrl: string }) {
    await ensureSchema();
    await sql`UPDATE staff SET name = ${v.name}, title = ${v.title}, department = ${v.department}, photo_url = ${v.photoUrl} WHERE id = ${id}`;
  },
  async listAll(): Promise<Staff[]> {
    await ensureSchema();
    return (await sql`SELECT * FROM staff ORDER BY department, created_at`) as Staff[];
  },
  async create(input: { name: string; title: string; department: string; photoUrl?: string }) {
    await ensureSchema();
    const id = newId("staff");
    await sql`INSERT INTO staff (id, name, title, department, photo_url)
              VALUES (${id}, ${input.name}, ${input.title}, ${input.department}, ${input.photoUrl || ""})`;
    return id;
  },
  async remove(id: string) {
    await ensureSchema();
    await sql`DELETE FROM staff WHERE id = ${id}`;
  },
};

// ---- Courses ----
export type Course = {
  id: string;
  name: string;
  department: string;
  level: number;
  summary: string;
  published: boolean;
  created_at: string;
  duration: string;
  entry: string;
  exam_body: string;
  image_url: string;
  details: string;
};

export const courses = {
  async get(id: string): Promise<Course | undefined> {
    await ensureSchema();
    return ((await sql`SELECT * FROM course WHERE id = ${id}`) as Course[])[0];
  },
  async updateAll(id: string, v: { name: string; department: string; level: number; summary: string; duration: string; entry: string; examBody: string }) {
    await ensureSchema();
    await sql`UPDATE course SET name = ${v.name}, department = ${v.department}, level = ${v.level}, summary = ${v.summary},
              duration = ${v.duration}, entry = ${v.entry}, exam_body = ${v.examBody} WHERE id = ${id}`;
  },
  async listPublished(): Promise<Course[]> {
    await ensureSchema();
    return (await sql`SELECT * FROM course WHERE published = TRUE ORDER BY level, name`) as Course[];
  },
  async listAll(): Promise<Course[]> {
    await ensureSchema();
    return (await sql`SELECT * FROM course ORDER BY published DESC, department, level, name`) as Course[];
  },
  async create(input: {
    name: string;
    department: string;
    level: number;
    summary?: string;
    published?: boolean;
    duration?: string;
    entry?: string;
    examBody?: string;
    imageUrl?: string;
    details?: string;
  }) {
    await ensureSchema();
    const id = newId("course");
    await sql`INSERT INTO course (id, name, department, level, summary, published, duration, entry, exam_body, image_url, details)
              VALUES (${id}, ${input.name}, ${input.department}, ${input.level}, ${input.summary || ""}, ${!!input.published},
                      ${input.duration || ""}, ${input.entry || ""}, ${input.examBody || ""}, ${input.imageUrl || ""}, ${input.details || ""})`;
    return id;
  },
  /** Used by the Excel import: updates every sheet column. Empty details keep the current text. */
  async updateFromSheet(id: string, v: { name: string; department: string; level: number; summary: string; duration: string; entry: string; examBody: string; details: string; published: boolean }) {
    await ensureSchema();
    await sql`UPDATE course SET name = ${v.name}, department = ${v.department}, level = ${v.level}, summary = ${v.summary},
              duration = ${v.duration}, entry = ${v.entry}, exam_body = ${v.examBody}, published = ${v.published},
              details = CASE WHEN ${v.details}::text <> '' THEN ${v.details}::text ELSE details END WHERE id = ${id}`;
  },
  async updateContent(id: string, input: { details: string; imageUrl?: string }) {
    await ensureSchema();
    await sql`UPDATE course SET details = ${input.details},
              image_url = CASE WHEN ${input.imageUrl || ""}::text <> '' THEN ${input.imageUrl || ""}::text ELSE image_url END
              WHERE id = ${id}`;
  },
  async setPublished(id: string, published: boolean) {
    await ensureSchema();
    await sql`UPDATE course SET published = ${published} WHERE id = ${id}`;
  },
  async publishAllDrafts() {
    await ensureSchema();
    await sql`UPDATE course SET published = TRUE WHERE published = FALSE`;
  },
  async remove(id: string) {
    await ensureSchema();
    await sql`DELETE FROM course WHERE id = ${id}`;
  },
};

// ---- Launch tasks / checklist ----
export type Task = { id: string; title: string; category: string; done: boolean; created_at: string };

export const tasks = {
  async listAll(): Promise<Task[]> {
    await ensureSchema();
    return (await sql`SELECT * FROM task ORDER BY done, category, created_at`) as Task[];
  },
  async create(input: { title: string; category?: string }) {
    await ensureSchema();
    const id = newId("task");
    await sql`INSERT INTO task (id, title, category) VALUES (${id}, ${input.title}, ${input.category || "General"})`;
    return id;
  },
  async setDone(id: string, done: boolean) {
    await ensureSchema();
    await sql`UPDATE task SET done = ${done} WHERE id = ${id}`;
  },
  async remove(id: string) {
    await ensureSchema();
    await sql`DELETE FROM task WHERE id = ${id}`;
  },
  async openCount(): Promise<number> {
    await ensureSchema();
    const rows = (await sql`SELECT COUNT(*)::int as n FROM task WHERE done = FALSE`) as { n: number }[];
    return rows[0].n;
  },
};

// ---- Migration helpers ----
export async function legacyUrlExists(
  table: "post" | "notice" | "tender" | "job_posting" | "document",
  url: string
): Promise<boolean> {
  await ensureSchema();
  let rows: unknown[];
  switch (table) {
    case "post":
      rows = await sql`SELECT 1 FROM post WHERE legacy_url = ${url} LIMIT 1`;
      break;
    case "notice":
      rows = await sql`SELECT 1 FROM notice WHERE legacy_url = ${url} LIMIT 1`;
      break;
    case "tender":
      rows = await sql`SELECT 1 FROM tender WHERE legacy_url = ${url} LIMIT 1`;
      break;
    case "job_posting":
      rows = await sql`SELECT 1 FROM job_posting WHERE legacy_url = ${url} LIMIT 1`;
      break;
    case "document":
      rows = await sql`SELECT 1 FROM document WHERE url = ${url} LIMIT 1`;
      break;
  }
  return rows.length > 0;
}

// ---- Legacy URL redirects (old WordPress permalinks) ----
export async function findLegacyTarget(slug: string): Promise<string | null> {
  await ensureSchema();
  const urls = [`https://murangatech.ac.ke/${slug}/`, `https://www.murangatech.ac.ke/${slug}/`];
  const p = (await sql`SELECT slug FROM post WHERE legacy_url = ANY(${urls}) LIMIT 1`) as { slug: string }[];
  if (p[0]) return `/blog/${p[0].slug}`;
  if ((await sql`SELECT 1 FROM notice WHERE legacy_url = ANY(${urls}) LIMIT 1`).length) return "/e-notice";
  if ((await sql`SELECT 1 FROM tender WHERE legacy_url = ANY(${urls}) LIMIT 1`).length) return "/tenders-careers";
  if ((await sql`SELECT 1 FROM job_posting WHERE legacy_url = ANY(${urls}) LIMIT 1`).length) return "/tenders-careers";
  return null;
}


// ---- Media library ----
export type Media = { id: string; url: string; filename: string; mime: string; size: number; alt: string; created_at: string };

export const media = {
  async list(): Promise<Media[]> {
    await ensureSchema();
    return (await sql`SELECT * FROM media ORDER BY created_at DESC`) as Media[];
  },
  async add(input: { url: string; filename: string; mime: string; size: number; alt?: string }) {
    await ensureSchema();
    const id = newId("media");
    await sql`INSERT INTO media (id, url, filename, mime, size, alt)
              VALUES (${id}, ${input.url}, ${input.filename}, ${input.mime}, ${input.size}, ${input.alt || ""})
              ON CONFLICT (url) DO UPDATE SET size = excluded.size`;
    return id;
  },
  async setAlt(id: string, alt: string) {
    await ensureSchema();
    await sql`UPDATE media SET alt = ${alt} WHERE id = ${id}`;
  },
  async get(id: string): Promise<Media | undefined> {
    await ensureSchema();
    return ((await sql`SELECT * FROM media WHERE id = ${id}`) as Media[])[0];
  },
  async remove(id: string) {
    await ensureSchema();
    await sql`DELETE FROM media WHERE id = ${id}`;
  },
};

// ---- Editable pages (department write-ups, custom pages) ----
export type PageContent = { key: string; title: string; tagline: string; body: string; images: string; published: boolean; updated_at: string; updated_by: string };

export const pageContent = {
  async get(key: string): Promise<PageContent | undefined> {
    await ensureSchema();
    return ((await sql`SELECT * FROM page_content WHERE key = ${key}`) as PageContent[])[0];
  },
  async listPrefix(prefix: string): Promise<PageContent[]> {
    await ensureSchema();
    return (await sql`SELECT * FROM page_content WHERE key LIKE ${prefix + "%"} ORDER BY updated_at DESC`) as PageContent[];
  },
  async save(input: { key: string; title?: string; tagline?: string; body: string; images?: string[]; published?: boolean; updatedBy?: string }) {
    await ensureSchema();
    await sql`INSERT INTO page_content (key, title, tagline, body, images, published, updated_at, updated_by)
              VALUES (${input.key}, ${input.title || ""}, ${input.tagline || ""}, ${input.body}, ${JSON.stringify(input.images || [])}, ${input.published ?? true}, now(), ${input.updatedBy || ""})
              ON CONFLICT (key) DO UPDATE SET title = excluded.title, tagline = excluded.tagline, body = excluded.body,
                images = excluded.images, published = excluded.published, updated_at = now(), updated_by = excluded.updated_by`;
  },
  async remove(key: string) {
    await ensureSchema();
    await sql`DELETE FROM page_content WHERE key = ${key}`;
  },
};

// post editing
export async function updatePost(
  id: string,
  input: { title: string; slug?: string; excerpt: string; body: string; author: string; imageUrl: string; attachments: Attachment[]; createdAt?: string; published: boolean; updatedBy?: string }
) {
  await ensureSchema();
  const cur = ((await sql`SELECT slug FROM post WHERE id = ${id}`) as { slug: string }[])[0];
  if (!cur) return;
  let slug = slugify(input.slug || "") || cur.slug;
  if (slug !== cur.slug) {
    const taken = await sql`SELECT id FROM post WHERE slug = ${slug} AND id <> ${id}`;
    if (taken.length) slug = `${slug}-${id.slice(-4)}`;
  }
  const createdAt = input.createdAt || null;
  await sql`UPDATE post SET title = ${input.title}, slug = ${slug}, excerpt = ${input.excerpt}, body = ${input.body},
            author = ${input.author}, image_url = ${input.imageUrl}, attachments = ${JSON.stringify(input.attachments)},
            published = ${input.published}, created_at = COALESCE(${createdAt}::timestamptz, created_at),
            updated_by = ${input.updatedBy || ''}, updated_at = now() WHERE id = ${id}`;
}

export async function getPostById(id: string): Promise<Post | undefined> {
  await ensureSchema();
  return ((await sql`SELECT * FROM post WHERE id = ${id}`) as Post[])[0];
}
