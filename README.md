# Murang'a TTI — website rebuild (v1 scaffold)

Next.js 16 (App Router) + TypeScript + Tailwind v4. Built to match GTVC's
structural layout (intake banner, split hero, mission/vision/values,
stats bar, service grid, charter/commitment section, news feed, CTA) but
themed to a blueprint-blue + safety-orange palette suited to a technical
training institute, with mono numerals used for stats and course levels.

## What's here
- `app/page.tsx` — homepage (hero, mission/vision/values, stats, department
  grid, service-charter section, news, CTA)
- `app/about`, `app/academics`, `app/admissions`, `app/contact` — inner pages
- `components/Header.tsx` — sticky nav with Academics dropdown, WhatsApp CTA
- `components/Footer.tsx`
- `app/globals.css` — design tokens (colors, fonts, blueprint-grid pattern)

## Fonts
Space Grotesk (display), Inter (body), JetBrains Mono (stats/labels) are
loaded via a Google Fonts <link> in app/layout.tsx. This sandbox's network
doesn't allow fetching fonts.googleapis.com, so next/font/google was
swapped for a plain stylesheet link with system-font fallbacks — this
works normally once deployed (Vercel, or any host with outbound internet).

## Content
Department names, CEO, BOG chair, partner bodies (KNEC/TVETA/HELB/KUCCPS/
TVET CDACC/Safaricom) and location are pulled from the live murangatech.ac.ke
site. Stats, news items, WhatsApp number and the contact form are
placeholders — swap in real numbers/copy and wire the form to a backend
before launch.

## Database: Neon (Postgres)
This runs on Postgres via Neon (https://neon.tech), using
`@neondatabase/serverless` — a plain HTTP-based driver with no connection
pooling to manage, so it works equally well locally, on a VPS, or on
serverless hosts like Vercel. `lib/db.ts` creates every table on first use
(`CREATE TABLE IF NOT EXISTS`), so there's no separate migration step.

**Setup:**
1. Create a free project at neon.tech.
2. Open the project, click "Connect", copy the connection string.
3. `cp .env.example .env`, paste it into `DATABASE_URL`, and set a real
   `ADMIN_PASSWORD` and `AUTH_SECRET` (`openssl rand -base64 33`).
4. `npm install && npm run seed` — creates the tables, the admin user, and
   the starter content (news, notices, courses, etc).
5. `npm run dev`, then sign in at `/admin/login`.

I could not test this against a real Neon database — this sandbox's
network can't reach neon.tech. I've type-checked the whole project
(`npx tsc --noEmit`) and run a full `next build`, both clean, and the SQL
in `lib/db.ts` is plain, standard Postgres. But the actual query path
(insert, select, the admin forms) has not been run against a live
database. Test it locally before trusting it with real content.

## Not yet built (next steps)
- Real content for all department subpages, staff directory beyond the two
  seeded names, gallery photos, downloadable documents beyond the one PDF
- Real photography (hero and gallery currently have no local images)
- File uploads for gallery/downloads (currently URL-only — paste a link to
  an already-hosted image/PDF, or add an upload flow, e.g. Vercel Blob or
  UploadThing)

## Run it
npm install
npm run dev

## Update log
  WhatsApp + Apply buttons, and a Listen control with English (US/UK) and
  Swahili voices (browser speech synthesis). See `components/WelcomeModal.tsx`.
- Hero is now a full-bleed background slideshow (5 cross-fading photos with
  slow zoom, per-slide headline/CTA, dots + arrows, autoplay pauses on hover)
  plus a scrolling department ticker: `components/HeroSlider.tsx`. Photos
  currently load from murangatech.ac.ke; download them into
  `public/images/hero/` and update `src` before launch.
- Added Our Staff (`/staff`): department filter chips + name/role search,
  initials avatar when no photo. Staff live in the database and are managed
  at `/admin/staff` (photo = URL or `/images/staff/<file>`). Seed only loads
  the two people named on MTTI's own site; add the rest in the admin.
- DB schema now re-applies on every module load, so new tables (like `staff`)
  appear automatically on an existing `data/mtti.db` without deleting it.
- Academics redesigned: hero facts, Level 4/5/6 staircase, sticky
  department jump-nav (scroll-spy), per-department sections with photo
  fallback. Content in `lib/academics.ts`. Electrical & Electronics carries
  MTTI's real Level 4/5/6 programme text; the other six departments need
  their real programme lists added to `levels` there (until then they show
  a "ask admissions" note instead of invented course names).
- Courses (`/courses`): programmes shown as three columns (Level 4 Artisan,
  Level 5 Craft, Level 6 Diploma) with department chips, level filter and
  search. Managed at `/admin/courses`. Only MTTI's confirmed Electrical &
  Electronics programmes are published; 21 more (drawn from a third-party
  KUCCPS listing) are seeded as DRAFTS and stay hidden until confirmed with
  the registrar and published in the admin. `npm run seed:demo` publishes
  them all for local preview only.
- Fixes: seed script now reads `.env` (admin password was being ignored);
  Auth.js `trustHost` enabled so sign-in works when self-hosted.
- WhatsApp/phone now use 0748 108 000 (from MTTI's published fee structure).
  Confirm the line has WhatsApp before launch.

## Update log — backend for everything
(Note: this and earlier "Update log" entries above describe the app when it
ran on local SQLite. It now runs on Neon Postgres — see "Database: Neon"
above. The features described below are unchanged; only the storage layer is.)

Every remaining page is now backed by the database, not hardcoded arrays:
- **Contact** (`/contact`) — real form, saves to `inquiry` table. Admin inbox
  at `/admin/inquiries` (mark read / delete), with an unread badge in the
  admin nav and dashboard.
- **Admissions** (`/admissions`) — real application form (name, email,
  phone, department, level, message) alongside the existing steps, saves to
  `application` table. Admin list at `/admin/applications` with status
  (New/Contacted/Admitted/Declined) and a "new" badge.
- **Gallery** (`/gallery`) — photos now come from `gallery_photo`, managed
  at `/admin/gallery` (URL + caption + category). Falls back to the old
  placeholder tiles only when no photos have been added yet.
- **Downloads** (`/downloads`) — documents come from `document`, managed at
  `/admin/downloads` (title + URL + category). One real file (the fee
  structure PDF) is seeded; the rest are placeholders to add.
- **Administration** and **Students' Council** — both now read from the
  `staff` table (filtered by department) instead of separate hardcoded
  lists, so adding a BOG member, HOD, or council officer in `/admin/staff`
  updates both pages automatically. Added "Students' Council" to the
  department list in `/admin/staff`.
- **Homepage stats bar** (courses on offer / trainees / trainers /
  departments) now reads from a `site_setting` table, editable at
  `/admin/settings`.

Tested end-to-end against a running build: both public forms (via the real
no-JS Server Actions protocol, not a plain POST) write to the database and
redirect correctly; admin sign-in, mark-read, status-update, settings save,
and gallery/downloads create all confirmed against the SQLite file directly.

## Update log — migrated to Neon (Postgres)
- Replaced the local SQLite file (`node:sqlite`) with Postgres via Neon,
  using `@neondatabase/serverless`. This also makes the site deployable to
  Vercel, which the SQLite version was not (serverless hosts don't have a
  writable persistent disk).
- Every repo function in `lib/repo.ts` is now async; every page and admin
  action that reads or writes the database was updated to `async`/`await`
  to match (confirmed with `npx tsc --noEmit`, zero errors).
- Two real bugs from the old code were caught and fixed in the process:
  several admin actions (delete/publish/mark-read/status-update) and the
  two public form submissions were calling the database without `await`.
  Under SQLite that was harmless because those calls were synchronous; under
  Postgres they would have fired `revalidatePath()`/`redirect()` before the
  write finished, silently dropping some updates.
- `data/` and `lib/guard.ts`'s SQLite-specific comments are no longer used;
  `.gitignore`'s SQLite entries are harmless left-over but no longer apply.

## Update log — launch checklist
- Added a Tasks page at `/admin/tasks`: a running to-do list for the site
  itself (not for trainees). Grouped by category (Content, Photos, Courses,
  Launch), with an open-count badge in the admin nav and on the dashboard.
- Seeded with the real outstanding items flagged throughout this build:
  confirming the WhatsApp number, downloading hero/gallery photos locally,
  adding real staff and council names, confirming course lists for the six
  unconfirmed departments, and setting real production secrets. Check items
  off as you complete them, or add your own.

## Update log — real photo/file uploads
- Gallery, Staff, and Downloads in the admin now accept a real uploaded
  file (drag/browse in the form), not just a pasted URL. Files save to
  `storage/uploads/<gallery|staff|documents>/` (or `UPLOAD_DIR`) and are served
  by the `/uploads/...` route handler, so they work right away in production.
  (An earlier version wrote to `public/`, which `next start` does not serve.) The URL field still works as a fallback for linking an
  already-hosted image instead of uploading.
- This needs a persistent, writable filesystem — it works on a VPS
  (Hostinger VPS, or any host running `next start` continuously), but NOT
  on serverless hosts like Vercel, where the filesystem is read-only at
  runtime. If you deploy there instead, swap `lib/upload.ts` for a blob
  store (Vercel Blob, S3, Cloudinary); every upload goes through that one
  file, so it's a contained change.
- Limits: 8MB max, JPG/PNG/WEBP/GIF for photos, those plus PDF for
  documents. Tested directly (valid upload, rejected bad file type, no-file
  case) — all three correct. The full form-to-database flow is untested
  since this sandbox can't reach Neon.


## Update log — real content migration (old WordPress site)
Run these on your own machine (the old site and Neon are not reachable from
the build sandbox, so the live import has not been run here):

1. `npm run migrate:dry` — fetches posts via the WordPress REST API, shows how
   each one is classified (news / notice / tender / job / document), the images
   and file links found, and writes nothing.
2. If it says it got HTML instead of JSON, the old site's bot check blocked the
   script. Open `https://murangatech.ac.ke/wp-json/wp/v2/posts?per_page=100&_embed=1`
   in your browser, save the JSON, and run
   `npm run migrate:dry -- --from-file=posts.json`.
3. `npm run migrate -- --replace-placeholders` — removes the sample content the
   seed script added (exact titles only), imports everything, and downloads the
   images/PDFs into `storage/uploads/migrated/`. Safe to re-run: items already
   imported (matched by their old URL) are skipped.
4. Review in /admin and delete or edit anything misclassified.

`npm run seed` no longer adds sample news/notices/tenders/jobs/timetables; use
`npm run seed:demo` for those on a throwaway database only.
Back up `storage/` (or set `UPLOAD_DIR` to a persistent folder) in production.
`npm run test:migrate` runs the mapper tests.


## Moving the database to HostPinnacle (or any Postgres)
The app now works with any Postgres: Neon URLs use Neon's HTTP driver, every
other URL uses a normal connection. Nothing in the code changes — only
`DATABASE_URL`.

1. On your PC (pointing at Neon): `npm run db:export` creates
   `mtti-backup-YYYY-MM-DD.zip` (all tables + uploaded/migrated files). It holds
   admin password hashes and applicant data — keep it private, delete it after.
2. In HostPinnacle's panel, create a PostgreSQL database + user and note the
   host, port, name, user and password.
3. Put that connection string in the server's `.env` as `DATABASE_URL`
   (URL-encode special characters in the password, e.g. `@` -> `%40`).
4. Copy the zip and the project to the server, then run
   `npm run db:import -- mtti-backup-YYYY-MM-DD.zip`. It creates the tables,
   loads the data and restores the files. Re-running it is safe.
5. Run `npm run build` and `npm start`, then sign in at /admin.
