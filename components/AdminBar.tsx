import { auth } from "@/auth";
import AdminBarClient from "./AdminBarClient";

// Slim bar at the very top of the public site, only for signed-in admins/editors.
export default async function AdminBar() {
  const session = await auth().catch(() => null);
  const u = session?.user as { email?: string | null; name?: string | null; role?: string } | undefined;
  if (!u?.email) return null;
  const name = (u.name || "").trim() || u.email.split("@")[0];
  return <AdminBarClient name={name} role={u.role === "editor" ? "editor" : "admin"} />;
}
