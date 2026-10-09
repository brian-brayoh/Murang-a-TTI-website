import { getPartners } from "@/lib/partners";
import UpdatedBy from "@/components/UpdatedBy";
import PartnersForm from "./PartnersForm";
import { resetPartnersAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPartners({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const p = await getPartners();
  return (
    <div>
      <h1 className="font-display font-semibold text-2xl">Partners</h1>
      <p className="text-sm text-steel max-w-2xl">
        The logos that scroll across the bottom of every page, just above the footer. Add a partner&apos;s name and upload its logo (a wide
        logo on a white or transparent background looks best). A partner with no logo shows its name instead. Add a website to make the logo clickable.
      </p>
      {saved && <p className="mt-4 max-w-3xl border border-brand-200 bg-brand-200/30 text-sm px-3 py-2">Saved. The website is updated.</p>}
      {p.saved && p.updatedBy && <UpdatedBy at={p.updatedAt} by={p.updatedBy} className="mt-3" />}
      <PartnersForm partners={p.partners} />
      {p.saved && (
        <form action={resetPartnersAction} className="mt-6">
          <button className="text-xs text-steel hover:text-accent underline">Go back to the starting list of partners</button>
        </form>
      )}
    </div>
  );
}
