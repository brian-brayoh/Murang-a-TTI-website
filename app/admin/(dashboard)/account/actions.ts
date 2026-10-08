"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { requireAdmin, logActivity } from "@/lib/guard";
import { adminUsers } from "@/lib/repo";

export async function saveAccountAction(formData: FormData) {
  const actor = await requireAdmin();
  const me = await adminUsers.findByEmail(actor.email);
  if (!me) redirect("/admin/account?error=Account+not+found");
  const name = String(formData.get("name") || "").trim();
  if (name) await adminUsers.update(me.id, { name });
  const current = String(formData.get("current") || "");
  const next = String(formData.get("password") || "");
  if (next) {
    if (!(await bcrypt.compare(current, me.password_hash))) redirect("/admin/account?error=Your+current+password+is+not+correct");
    if (next.length < 10) redirect("/admin/account?error=Use+a+new+password+of+at+least+10+characters");
    await adminUsers.setPasswordById(me.id, await bcrypt.hash(next, 10));
    await logActivity(actor, "changed their password", "Account", "");
  }
  redirect("/admin/account?ok=Saved");
}
