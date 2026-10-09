import { createHash, randomBytes } from "node:crypto";
import { SITE_URL } from "@/lib/site";
import { passwordResets } from "@/lib/repo";
import { sendMail } from "@/lib/mail";

export const RESET_MINUTES = 60;
export const MAX_REQUESTS_PER_HOUR = 3;

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));

/** Creates a one-time link for this user and emails it. Never throws. */
export async function issueResetEmail(user: { id: string; email: string; name?: string | null }) {
  try {
    if ((await passwordResets.recentCount(user.id, 60)) >= MAX_REQUESTS_PER_HOUR) return;
    const token = randomBytes(32).toString("base64url");
    await passwordResets.create(user.id, hashToken(token), RESET_MINUTES);
    // The link host comes from NEXT_PUBLIC_SITE_URL, never from the request, so it cannot be spoofed.
    const link = `${SITE_URL}/admin/reset-password?token=${token}`;
    const who = (user.name || "").trim() || "there";
    await sendMail({
      to: user.email,
      subject: "Reset your Murang'a TTI admin password",
      text: `Hello ${who},\n\nSomeone asked to reset the password for your Murang'a TTI website admin account.\n\nOpen this link to choose a new password (valid for ${RESET_MINUTES} minutes, works once):\n${link}\n\nIf you did not ask for this, ignore this email and your password stays the same.\n`,
      html: `<p>Hello ${esc(who)},</p><p>Someone asked to reset the password for your Murang'a TTI website admin account.</p><p><a href="${link}" style="display:inline-block;background:#8F3540;color:#fff;padding:12px 20px;text-decoration:none;font-weight:600">Choose a new password</a></p><p>This link is valid for ${RESET_MINUTES} minutes and works once. If the button does not work, copy this address into your browser:<br>${link}</p><p>If you did not ask for this, ignore this email and your password stays the same.</p>`,
    });
  } catch (e) {
    console.error("Password reset email failed:", e instanceof Error ? e.message : e);
  }
}
