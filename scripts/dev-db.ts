// Runs a real PostgreSQL on your own computer — no installer needed.
//   npm run db:local      (leave this window open while you work)
// Data lives in ./.pgdata. Use this in .env:
//   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mtti"
// Stop it with Ctrl+C. Next time, it starts with your data intact.
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), ".pgdata");
const port = Number(process.env.LOCAL_PG_PORT || 5432);

async function main() {
  const pg = new EmbeddedPostgres({
    databaseDir: dir,
    user: "postgres",
    password: "postgres",
    port,
    persistent: true,
    onLog: () => {},
    onError: (e) => console.error(String(e)),
  });
  const fresh = !existsSync(path.join(dir, "PG_VERSION"));
  if (fresh) await pg.initialise();
  await pg.start();
  if (fresh) await pg.createDatabase("mtti");
  console.log(`\nPostgres is running on port ${port}.`);
  console.log(`DATABASE_URL="postgresql://postgres:postgres@localhost:${port}/mtti"`);
  console.log("Leave this window open. Press Ctrl+C to stop.\n");
  const stop = async () => {
    console.log("\nStopping...");
    await pg.stop();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  setInterval(() => {}, 1 << 30);
}
main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
