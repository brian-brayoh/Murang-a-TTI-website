import { requireAdminRole } from "@/lib/guard";
import { adminUsers } from "@/lib/repo";
import { addUserAction, updateUserAction, deleteUserAction } from "./actions";

export const dynamic = "force-dynamic";
const input = "mt-1 w-full border border-paper-line px-3 py-2 bg-white focus:outline-none focus:border-brand-700";

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const me = await requireAdminRole();
  const sp = await searchParams;
  const users = await adminUsers.list();
  return (
    <div>
      <h1 className="font-display font-semibold text-2xl">Users</h1>
      <p className="mt-1 text-sm text-steel max-w-2xl">
        Give each person their own login so every change shows who made it. <b>Administrators</b> can do everything, including managing users and settings.
        <b> Editors</b> can write and edit content but cannot manage users or settings.
      </p>
      {sp.error && <p className="mt-4 border border-accent bg-accent/10 text-sm px-3 py-2 max-w-2xl">{sp.error}</p>}
      {sp.ok && <p className="mt-4 border border-brand-200 bg-brand-200/30 text-sm px-3 py-2 max-w-2xl">{sp.ok}</p>}

      <ul className="mt-6 divide-y divide-paper-line border-t border-b border-paper-line">
        {users.map((u) => (
          <li key={u.id} className="py-4">
            <form action={updateUserAction} className="grid sm:grid-cols-[1.2fr_1.4fr_9rem_1.2fr_auto] gap-3 items-end">
              <input type="hidden" name="id" value={u.id} />
              <div>
                <label className="text-xs text-steel">Name</label>
                <input name="name" defaultValue={u.name} placeholder="Full name" className={input} />
              </div>
              <div>
                <label className="text-xs text-steel">Email (sign-in)</label>
                <p className="mt-1 py-2 text-sm break-all">{u.email}{u.id === me.id && <span className="ml-2 text-xs text-accent-dark">(you)</span>}</p>
              </div>
              <div>
                <label className="text-xs text-steel">Role</label>
                <select name="role" defaultValue={u.role} className={input}>
                  <option value="admin">Administrator</option>
                  <option value="editor">Editor</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-steel">New password (optional)</label>
                <input name="password" type="password" autoComplete="new-password" placeholder="leave empty to keep" className={input} />
              </div>
              <button className="bg-brand-700 text-white text-sm font-semibold px-4 py-2 hover:bg-brand-900">Save</button>
            </form>
            {u.id !== me.id && (
              <form action={deleteUserAction} className="mt-2">
                <input type="hidden" name="id" value={u.id} />
                <button className="text-xs text-steel hover:text-accent underline">Remove this user</button>
              </form>
            )}
          </li>
        ))}
      </ul>

      <form action={addUserAction} className="mt-10 border border-paper-line bg-white p-6 grid sm:grid-cols-2 gap-4 max-w-3xl">
        <h2 className="sm:col-span-2 font-display font-semibold text-lg">Add a user</h2>
        <div>
          <label className="text-sm text-steel">Full name (shown on the website as the editor)</label>
          <input name="name" required className={input} />
        </div>
        <div>
          <label className="text-sm text-steel">Email</label>
          <input name="email" type="email" required className={input} />
        </div>
        <div>
          <label className="text-sm text-steel">Role</label>
          <select name="role" defaultValue="editor" className={input}>
            <option value="editor">Editor</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-steel">Temporary password (10+ characters)</label>
          <input name="password" type="password" required minLength={10} autoComplete="new-password" className={input} />
        </div>
        <button className="sm:col-span-2 justify-self-start bg-brand-700 text-white font-semibold px-5 py-2.5 hover:bg-brand-900">Add user</button>
      </form>
    </div>
  );
}
