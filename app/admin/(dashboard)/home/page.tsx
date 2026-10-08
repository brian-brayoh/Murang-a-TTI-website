import Link from "next/link";
import { getHome } from "@/lib/home";
import UpdatedBy from "@/components/UpdatedBy";
import HomeForm from "./HomeForm";
import { resetHomeAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const home = await getHome();
  return (
    <div>
      <h1 className="font-display font-semibold text-2xl">Home page</h1>
      <p className="text-sm text-steel">
        The pop-up, banner, slideshow and main sections of the <Link className="text-brand-700 underline" target="_blank" href="/">home page</Link>.
        Slides rotate in the order shown here.
      </p>
      {saved && <p className="mt-4 max-w-3xl border border-brand-200 bg-brand-200/30 text-sm px-3 py-2">Saved. The home page is updated.</p>}
      {error && <p className="mt-4 max-w-3xl border border-accent bg-accent/10 text-sm px-3 py-2">Add at least one slide with a photo.</p>}
      {home.updatedBy && <UpdatedBy at={home.updatedAt} by={home.updatedBy} className="mt-3" />}
      <HomeForm slides={home.slides} banner={home.banner} popup={home.popup} sections={home.sections} />
      {(home.customSlides || home.customBanner || home.customPopup || home.customSections) && (
        <form action={resetHomeAction} className="mt-6">
          <button className="text-xs text-steel hover:text-accent underline">Discard my changes and use the original slideshow</button>
        </form>
      )}
    </div>
  );
}
