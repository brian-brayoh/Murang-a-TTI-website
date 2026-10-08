// Postgres (Neon) data layer via @neondatabase/serverless. Works over HTTP,
// so it's safe on serverless/edge hosts like Vercel (no persistent TCP
// connection to manage). Every table uses our own client-generated TEXT
// ids (see newId in repo.ts), so the schema needs no SERIAL/identity columns.
import { neon, neonConfig } from "@neondatabase/serverless";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Put your Postgres connection string in .env as " +
      "DATABASE_URL (Neon for development, your host's Postgres in production), " +
      "then run `npm run seed`."
  );
}

// Two drivers behind one `sql` tagged template:
//  - Neon (host contains "neon.tech"): HTTP driver, works on serverless hosts.
//  - Any other Postgres (HostPinnacle, a VPS, local): standard TCP via `postgres`.
// Switching is just a matter of changing DATABASE_URL — no code change.
export type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<any[]>; // eslint-disable-line @typescript-eslint/no-explicit-any
export type RawQuery = (text: string, params?: unknown[]) => Promise<any[]>; // eslint-disable-line @typescript-eslint/no-explicit-any

const isNeon = /neon\.tech/i.test(url);

let sqlImpl: Sql;
let rawImpl: RawQuery;

if (isNeon) {
  // Retry transient network failures ("fetch failed") — Neon wakes from idle
  // on the first request and connections drop now and then.
  neonConfig.fetchFunction = async (input: unknown, init?: unknown) => {
    let lastErr: unknown;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await fetch(input as RequestInfo, init as RequestInit);
      } catch (e) {
        lastErr = e;
        await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
      }
    }
    throw lastErr;
  };
  const n = neon(url);
  sqlImpl = n as unknown as Sql;
  rawImpl = (text, params = []) => n.query(text, params as unknown[]) as Promise<any[]>; // eslint-disable-line @typescript-eslint/no-explicit-any
} else {
  // One pool per server process (survives dev hot reloads).
  const g = globalThis as unknown as { __mttiPg?: ReturnType<typeof postgres> };
  const pg = (g.__mttiPg ??= postgres(url, { max: 10, idle_timeout: 20, connect_timeout: 15, onnotice: () => {} }));
  sqlImpl = pg as unknown as Sql;
  rawImpl = (text, params = []) => pg.unsafe(text, params as never[]) as unknown as Promise<any[]>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export const sql: Sql = sqlImpl;
export const rawQuery: RawQuery = rawImpl;
export async function closeDb() {
  const g = globalThis as unknown as { __mttiPg?: ReturnType<typeof postgres> };
  if (g.__mttiPg) await g.__mttiPg.end({ timeout: 2 });
}

let schemaReady: Promise<void> | null = null;

async function applySchema() {
  await sql`CREATE TABLE IF NOT EXISTS admin_user (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS post (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT NOT NULL,
    body TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT 'The Registrar',
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS notice (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS exam_timetable (
    id TEXT PRIMARY KEY,
    department TEXT NOT NULL,
    level TEXT NOT NULL,
    date_range TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS tender (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS job_posting (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS site_setting (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`;

  await sql`CREATE TABLE IF NOT EXISTS gallery_photo (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    caption TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'Campus life',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS document (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS inquiry (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS application (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    department TEXT NOT NULL,
    level INTEGER NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'New',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    photo_url TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS task (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    done BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS course (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    level INTEGER NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  // Columns used by the WordPress migration (idempotent, safe on old DBs).
  await sql`ALTER TABLE course ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE course ADD COLUMN IF NOT EXISTS details TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE course ADD COLUMN IF NOT EXISTS duration TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE course ADD COLUMN IF NOT EXISTS entry TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE course ADD COLUMN IF NOT EXISTS exam_body TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE post ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE post ADD COLUMN IF NOT EXISTS images TEXT NOT NULL DEFAULT '[]'`;
  await sql`ALTER TABLE post ADD COLUMN IF NOT EXISTS attachments TEXT NOT NULL DEFAULT '[]'`;
  await sql`ALTER TABLE post ADD COLUMN IF NOT EXISTS legacy_url TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE notice ADD COLUMN IF NOT EXISTS attachment_url TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE notice ADD COLUMN IF NOT EXISTS legacy_url TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE tender ADD COLUMN IF NOT EXISTS attachment_url TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE tender ADD COLUMN IF NOT EXISTS legacy_url TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE job_posting ADD COLUMN IF NOT EXISTS attachment_url TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE job_posting ADD COLUMN IF NOT EXISTS legacy_url TEXT NOT NULL DEFAULT ''`;

  await sql`ALTER TABLE notice ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE notice ADD COLUMN IF NOT EXISTS attachments TEXT NOT NULL DEFAULT '[]'`;

  // accounts, authorship and activity log
  await sql`ALTER TABLE admin_user ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE admin_user ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'admin'`;
  await sql`ALTER TABLE post ADD COLUMN IF NOT EXISTS updated_by TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE post ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ`;
  await sql`CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL DEFAULT '',
    user_name TEXT NOT NULL DEFAULT '',
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS audit_log_created ON audit_log (created_at DESC)`;

  // CMS: media library and editable pages
  await sql`CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,
    filename TEXT NOT NULL,
    mime TEXT NOT NULL DEFAULT '',
    size INTEGER NOT NULL DEFAULT 0,
    alt TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS page_content (
    key TEXT PRIMARY KEY,
    title TEXT NOT NULL DEFAULT '',
    tagline TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    images TEXT NOT NULL DEFAULT '[]',
    published BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
  await sql`ALTER TABLE page_content ADD COLUMN IF NOT EXISTS updated_by TEXT NOT NULL DEFAULT ''`;
}

// Runs once per server instance (cached by module scope), and is re-awaited
// (not re-run) on every subsequent call — cheap, and safe to call at the
// top of every repo function since CREATE TABLE IF NOT EXISTS is idempotent.
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = applySchema().catch((e) => {
      schemaReady = null; // allow a retry after a transient failure
      throw e;
    });
  }
  return schemaReady;
}

export function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
