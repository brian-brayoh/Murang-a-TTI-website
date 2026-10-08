import { requireAdmin } from "@/lib/guard";
import { adminUsers } from "@/lib/repo";
import { saveAccountAction } from "./actions";

export const dynamic = "force-dynamic";
const input = "mt-1 w-full border border-paper-line px-3 py-2 bg-white focus:outline-none focus:border-brand-700";

export default async function Account({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const actor = await requireAdmin();
  const sp = await searchParams;
  const me = await adminUsers.findByEmail(actor.email);
  return (
    <div>
      <h1 className="font-display font-semibold text-2xl">My account</h1>
      <p className="mt-1 text-sm text-steel">{actor.email} &middot; {actor.role === "admin" ? "Administrator" : "Editor"}</p>
      {sp.error && <p className="mt-4 border border-accent bg-accent/10 text-sm px-3 py-2 max-w-md">{sp.error}</p>}
      {sp.ok && <p className="mt-4 border border-brand-200 bg-brand-200/30 text-sm px-3 py-2 max-w-md">{sp.ok}</p>}
      <form action={saveAccountAction} className="mt-6 border border-paper-line bg-white p-6 max-w-md space-y-4">
        <div>
          <label className="text-sm text-steel">Your name (shown publicly as &ldquo;updated by&rdquo;)</label>
          <input name="name" defaultValue={me?.name || ""} className={input} />
        </div>
        <hr className="border-paper-line" />
        <p className="text-sm font-medium">Change password</p>
        <div>
          <label className="text-sm text-steel">Current password</label>
          <input name="current" type="password" autoComplete="current-password" className={input} />
        </div>
        <div>
          <label className="text-sm text-steel">New password (10+ characters)</label>
          <input name="password" type="password" autoComplete="new-password" className={input} />
        </div>
        <button className="bg-brand-700 text-white font-semibold px-5 py-2.5 hover:bg-brand-900">Save</button>
      </form>
    </div>
  );
}
