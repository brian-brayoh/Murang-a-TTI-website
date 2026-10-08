// Load .env before anything else runs (tsx does not do this for us, unlike
// Next.js). Imported first in seed.ts so ADMIN_EMAIL / ADMIN_PASSWORD /
// DATABASE_PATH from .env are honoured.
try {
  process.loadEnvFile(".env");
} catch {
  /* no .env file: fall back to defaults */
}
