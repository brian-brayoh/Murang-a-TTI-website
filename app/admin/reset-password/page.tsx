import Link from "next/link";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { activity, adminUsers, passwordResets } from "@/lib/repo";
import { hashToken } from "@/lib/password-reset";

async function resetPassword(formData: FormData) {
  "use server";
  const token = String(formData.get("token") || "");
  const pw = String(formData.get("password") || "");
  const again = String(formData.get("confirm") || "");
  const back = (msg: string) => redirect(`/admin/reset-password?token=${encodeURIComponent(token)}&error=${encodeURIComponent(msg)}`);

  const row = token ? await passwordResets.findValid(hashToken(token)) : undefined;
  if (!row) redirect("/admin/reset-password?token=invalid");
  if (pw.length < 10) back("Use a password of at least 10 characters.");
  if (pw !== again) back("The two passwords do not match.");

  const user = await adminUsers.findById(row!.user_id);
  if (!user) redirect("/admin/reset-password?token=invalid");
  await adminUsers.setPasswordById(user!.id, await bcrypt.hash(pw, 10));
  await passwordResets.closeAllFor(user!.id);
  try {
    await activity.add({ email: user!.email, name: user!.name || user!.email, action: "reset their password", entity: "Account", title: "via email link" });
  } catch {
    /* logging must never block the reset */
  }
  redirect("/admin/login?reset=1");
}

export default async function ResetPassword({ searchParams }: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const { token, error } = await searchParams;
  const valid = token && token !== "invalid" ? await passwordResets.findValid(hashToken(token)) : undefined;

  return (
    <div className="min-h-screen bg-brand-900 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="tick text-accent font-mono text-sm">Murang&apos;a TTI</p>
        <h1 className="mt-3 font-display font-semibold text-2xl">Choose a new password</h1>

        {!valid ? (
          <div className="mt-8 space-y-4 text-sm">
            <p className="bg-accent/10 border border-accent text-accent px-4 py-3 leading-relaxed">
              This link has expired or was already used. Request a new one.
            </p>
            <Link href="/admin/forgot-password" className="inline-block text-accent hover:text-white">Request a new link →</Link>
          </div>
        ) : (
          <form action={resetPassword} className="mt-8 space-y-5">
            <input type="hidden" name="token" value={token} />
            {error && <p className="text-sm bg-accent/10 border border-accent text-accent px-4 py-2.5">{error}</p>}
            <div>
              <label className="text-sm text-brand-200" htmlFor="password">New password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={10}
                autoComplete="new-password"
                className="mt-1.5 w-full border border-white/20 bg-transparent px-4 py-2.5 focus:outline-none focus:border-accent"
              />
              <p className="mt-1 text-xs text-brand-200">At least 10 characters.</p>
            </div>
            <div>
              <label className="text-sm text-brand-200" htmlFor="confirm">Type it again</label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                required
                minLength={10}
                autoComplete="new-password"
                className="mt-1.5 w-full border border-white/20 bg-transparent px-4 py-2.5 focus:outline-none focus:border-accent"
              />
            </div>
            <button type="submit" className="w-full bg-accent text-brand-900 font-semibold px-6 py-3 hover:bg-white transition-colors">
              Save new password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
