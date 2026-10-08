"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminRole, logActivity } from "@/lib/guard";
import { adminUsers } from "@/lib/repo";

const back = (q: string) => redirect(`/admin/users?${q}`);
const role = (v: FormDataEntryValue | null) => (v === "editor" ? "editor" : "admin");

export async function addUserAction(formData: FormData) {
  const actor = await requireAdminRole();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) back("error=Enter+a+name+and+a+valid+email");
  if (password.length < 10) back("error=Use+a+password+of+at+least+10+characters");
  if (await adminUsers.findByEmail(email)) back("error=That+email+already+has+an+account");
  await adminUsers.create({ email, name, role: role(formData.get("role")), passwordHash: await bcrypt.hash(password, 10) });
  await logActivity(actor, "added user", "User", `${name} (${role(formData.get("role"))})`);
  revalidatePath("/admin/users");
  back("ok=User+added");
}

export async function updateUserAction(formData: FormData) {
  const actor = await requireAdminRole();
  const id = String(formData.get("id") || "");
  const target = await adminUsers.findById(id);
  if (!target) back("error=User+not+found");
  const newRole = role(formData.get("role"));
  if (target!.role === "admin" && newRole === "editor" && (await adminUsers.adminCount()) <= 1) back("error=There+must+be+at+least+one+administrator");
  await adminUsers.update(id, { name: String(formData.get("name") || "").trim(), role: newRole });
  const pw = String(formData.get("password") || "");
  if (pw) {
    if (pw.length < 10) back("error=Use+a+password+of+at+least+10+characters");
    await adminUsers.setPasswordById(id, await bcrypt.hash(pw, 10));
  }
  await logActivity(actor, pw ? "changed password for" : "updated user", "User", target!.name || target!.email);
  revalidatePath("/admin/users");
  back("ok=Saved");
}

export async function deleteUserAction(formData: FormData) {
  const actor = await requireAdminRole();
  const id = String(formData.get("id") || "");
  const target = await adminUsers.findById(id);
  if (!target) back("error=User+not+found");
  if (target!.id === actor.id || target!.email.toLowerCase() === actor.email.toLowerCase()) back("error=You+cannot+delete+your+own+account");
  if (target!.role === "admin" && (await adminUsers.adminCount()) <= 1) back("error=There+must+be+at+least+one+administrator");
  await adminUsers.remove(id);
  await logActivity(actor, "removed user", "User", target!.name || target!.email);
  revalidatePath("/admin/users");
  back("ok=User+removed");
}
