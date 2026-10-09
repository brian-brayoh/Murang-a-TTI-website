import Link from "next/link";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { adminUsers } from "@/lib/repo";
import { mailConfigured } from "@/lib/mail";
import { issueResetEmail } from "@/lib/password-reset";

async function requestReset(formData: FormData) {
  "use server";
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (mailConfigured() && /^\S+@\S+\.\S+$/.test(email)) {
    const user = await adminUsers.findByEmail(email);
    // Sent after the response so the page looks the same whether or not the account exists.
    if (user) after(() => issueResetEmail(user));
  }
  redirect("/admin/forgot-password?sent=1");
}

export default async function ForgotPassword({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const { sent } = await searchParams;
  const canEmail = mailConfigured();

  return (
    <div className="min-h-screen bg-brand-900 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="tick text-accent font-mono text-sm">Murang&apos;a TTI</p>
        <h1 className="mt-3 font-display font-semibold text-2xl">Forgot your password?</h1>

        {sent ? (
          <div className="mt-8 space-y-4 text-sm">
            <p className="bg-white/10 border border-white/20 px-4 py-3 leading-relaxed">
              If that email belongs to an admin account, a reset link is on its way. It is valid for 1 hour and works once. Check your spam folder too.
            </p>
            <Link href="/admin/login" className="inline-block text-accent hover:text-white">← Back to sign in</Link>
          </div>
        ) : !canEmail ? (
          <div className="mt-8 space-y-4 text-sm">
            <p className="bg-accent/10 border border-accent text-accent px-4 py-3 leading-relaxed">
              Email is not set up on this site yet, so a link cannot be sent. Ask the main administrator to set a new password for you
              (Admin → Users → open your name → New password).
            </p>
            <Link href="/admin/login" className="inline-block text-accent hover:text-white">← Back to sign in</Link>
          </div>
        ) : (
          <form action={requestReset} className="mt-8 space-y-5">
            <p className="text-sm text-brand-200 leading-relaxed">
              Enter the email you sign in with. We will send you a link to choose a new password.
            </p>
            <div>
              <label className="text-sm text-brand-200" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1.5 w-full border border-white/20 bg-transparent px-4 py-2.5 focus:outline-none focus:border-accent"
              />
            </div>
            <button type="submit" className="w-full bg-accent text-brand-900 font-semibold px-6 py-3 hover:bg-white transition-colors">
              Send reset link
            </button>
            <Link href="/admin/login" className="block text-center text-sm text-brand-200 hover:text-accent">← Back to sign in</Link>
          </form>
        )}
      </div>
    </div>
  );
}
