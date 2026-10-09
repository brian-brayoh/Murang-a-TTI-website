import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

async function login(formData: FormData) {
  "use server";
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      redirect("/admin/login?error=1");
    }
    throw err;
  }
}

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string }>;
}) {
  const { error, reset } = await searchParams;

  return (
    <div className="min-h-screen bg-brand-900 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="tick text-accent font-mono text-sm">Murang&apos;a TTI</p>
        <h1 className="mt-3 font-display font-semibold text-2xl">Admin sign in</h1>

        <form action={login} className="mt-8 space-y-5">
          {reset && (
            <p className="text-sm bg-white/10 border border-white/30 text-white px-4 py-2.5">
              Password changed. Sign in with your new password.
            </p>
          )}
          {error && (
            <p className="text-sm bg-accent/10 border border-accent text-accent px-4 py-2.5">
              Invalid email or password.
            </p>
          )}
          <div>
            <label className="text-sm text-brand-200" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1.5 w-full border border-white/20 bg-transparent px-4 py-2.5 focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-sm text-brand-200" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1.5 w-full border border-white/20 bg-transparent px-4 py-2.5 focus:outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-accent text-brand-900 font-semibold px-6 py-3 hover:bg-white transition-colors"
          >
            Sign in
          </button>
          <Link href="/admin/forgot-password" className="block text-center text-sm text-brand-200 hover:text-accent">
            Forgot your password?
          </Link>
        </form>
      </div>
    </div>
  );
}
