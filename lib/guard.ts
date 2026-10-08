import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { activity, adminUsers } from "@/lib/repo";

export type Actor = { id: string; email: string; name: string; role: "admin" | "editor" };

// Display name for a person: their name, else the part of the email before @.
export function displayName(u: { name?: string | null; email?: string | null }) {
  const n = (u.name || "").trim();
  if (n) return n;
  const e = (u.email || "").split("@")[0];
  return e ? e.charAt(0).toUpperCase() + e.slice(1) : "MTTI admin";
}

// Server actions can be invoked directly, so every mutation re-checks the
// session instead of relying on the dashboard layout alone.
export async function requireAdmin(): Promise<Actor> {
  const session = await auth();
  const u = session?.user as { id?: string; email?: string | null; name?: string | null; role?: string } | undefined;
  if (!u?.email) redirect("/admin/login");
  // Name and role come from the database, so renames and role changes apply at once
  // and a removed user is locked out immediately.
  const row = await adminUsers.findByEmail(u.email);
  if (!row) redirect("/admin/login");
  return { id: row.id, email: row.email, name: displayName(row), role: row.role === "editor" ? "editor" : "admin" };
}

// Users, site settings: administrators only.
export async function requireAdminRole(): Promise<Actor> {
  const a = await requireAdmin();
  if (a.role !== "admin") redirect("/admin?denied=1");
  return a;
}

// Records "who did what" for the Activity page. Never blocks the action itself.
export async function logActivity(actor: Actor, action: string, entity: string, title = "") {
  try {
    await activity.add({ email: actor.email, name: actor.name, action, entity, title });
  } catch {
    /* logging must never break an edit */
  }
}
