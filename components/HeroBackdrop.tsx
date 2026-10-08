import { getSite } from "@/lib/site-details";
import type { BannerKey } from "@/lib/banners";

// Photo + dark gradient behind a page heading. Put it first inside a `relative overflow-hidden` hero section.
export default async function HeroBackdrop({ id }: { id: BannerKey }) {
  const site = await getSite();
  const src = site.banners[id];
  if (!src) return null;
  return (
    <>
      <div aria-hidden className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${src.replace(/"/g, "%22")}")` }} />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-brand-900/95 via-brand-900/75 to-brand-900/20" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-brand-900/60 to-transparent" />
    </>
  );
}
