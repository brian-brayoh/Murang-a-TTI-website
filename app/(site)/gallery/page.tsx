import type { Metadata } from "next";
import HeroBackdrop from "@/components/HeroBackdrop";
import { galleryPhotos } from "@/lib/repo";
import GalleryGrid from "@/components/GalleryGrid";

export const metadata: Metadata = {
  title: "Gallery | Murang'a TTI",
};

export const dynamic = "force-dynamic";

const placeholderCategories = [
  "Workshops & labs",
  "Graduation",
  "Sports & clubs",
  "Campus life",
  "Community outreach",
  "Partner visits",
];

export default async function Gallery() {
  const photos = await galleryPhotos.listAll();

  return (
    <>
      <section className="relative bg-brand-900 text-white overflow-hidden">
        <HeroBackdrop id="gallery" />
        <div className="relative max-w-6xl mx-auto px-6 lg:px-10 py-16">
          <p className="tick text-accent font-mono text-sm">Gallery</p>
          <h1 className="mt-3 font-display font-semibold text-4xl max-w-2xl">
            Life at the institute
          </h1>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-16">
        {photos.length > 0 ? (
          <GalleryGrid photos={photos.map((p) => ({ id: p.id, url: p.url, caption: p.caption, category: p.category }))} />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {placeholderCategories.map((c) => (
                <div
                  key={c}
                  className="aspect-[4/3] border border-paper-line bg-brand-200/30 flex items-end p-5 relative overflow-hidden"
                >
                  <div className="absolute inset-0 blueprint-grid-dark" aria-hidden />
                  <p className="relative font-display font-semibold text-brand-700">{c}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm text-steel">
              Photos haven&apos;t been added yet. Add them in{" "}
              <code className="font-mono text-xs bg-paper-line px-1.5 py-0.5">/admin/gallery</code>.
            </p>
          </>
        )}
      </section>
    </>
  );
}
