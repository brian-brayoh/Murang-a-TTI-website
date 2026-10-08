// Sets (or creates) the admin login from ADMIN_EMAIL / ADMIN_PASSWORD in .env.
// The seed script only sets the password the first time, so use this after
// you change ADMIN_PASSWORD:   npm run admin:password
import "./env";
import bcrypt from "bcryptjs";
import { adminUsers } from "../lib/repo";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.startsWith("set-a-real") || password === "ChangeMe123!") {
    throw new Error("Set a real ADMIN_EMAIL and ADMIN_PASSWORD in .env first.");
  }
  if (password.length < 12) throw new Error("Use at least 12 characters for ADMIN_PASSWORD.");
  const hash = await bcrypt.hash(password, 10);
  if (await adminUsers.setPassword(email, hash)) console.log(`Password updated for ${email}`);
  else {
    await adminUsers.create({ email, passwordHash: hash, name: process.env.ADMIN_NAME || "", role: "admin" });
    console.log(`Admin created: ${email}`);
  }
}
main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
