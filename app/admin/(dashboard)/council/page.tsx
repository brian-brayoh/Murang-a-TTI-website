import Link from "next/link";
import { getCouncil } from "@/lib/council";
import UpdatedBy from "@/components/UpdatedBy";
import CouncilForm from "./CouncilForm";
import { resetCouncilAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminCouncil({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const c = await getCouncil();
  return (
    <div>
      <h1 className="font-display font-semibold text-2xl">Students&apos; Council</h1>
      <p className="text-sm text-steel max-w-2xl">
        The office bearers shown on <Link className="text-brand-700 underline" target="_blank" href="/students-council">/students-council</Link>.
        Until the names are confirmed, each position shows <em>Coming soon</em>. Type a name against a position when you have it. The page heading and introduction are under{" "}
        <Link className="text-brand-700 underline" href="/admin/pages/builtin/students-council">Pages &rarr; Students&apos; Council</Link>.
      </p>
      {saved && <p className="mt-4 max-w-3xl border border-brand-200 bg-brand-200/30 text-sm px-3 py-2">Saved. The website is updated.</p>}
      {c.updatedBy && <UpdatedBy at={c.updatedAt} by={c.updatedBy} className="mt-3" />}
      <CouncilForm officials={c.officials} />
      {c.saved && (
        <form action={resetCouncilAction} className="mt-6">
          <button className="text-xs text-steel hover:text-accent underline">Clear everything and go back to the placeholder positions</button>
        </form>
      )}
    </div>
  );
}
