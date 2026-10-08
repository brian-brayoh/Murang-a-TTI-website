import type { Metadata } from "next";
import HeroBackdrop from "@/components/HeroBackdrop";
import { documents } from "@/lib/repo";

export const metadata: Metadata = {
  title: "Downloads | Murang'a TTI",
};

export const dynamic = "force-dynamic";

export default async function Downloads() {
  const files = await documents.listAll();

  return (
    <>
      <section className="relative bg-brand-900 text-white overflow-hidden">
        <HeroBackdrop id="downloads" />
        <div className="relative max-w-6xl mx-auto px-6 lg:px-10 py-16">
          <p className="tick text-accent font-mono text-sm">Downloads</p>
          <h1 className="mt-3 font-display font-semibold text-4xl max-w-2xl">
            Forms &amp; documents
          </h1>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-16">
        {files.length > 0 ? (
          <div className="divide-y divide-paper-line border-t border-b border-paper-line">
            {files.map((f) => (
              <a
                key={f.id}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-4 hover:bg-white transition-colors -mx-2 px-2"
              >
                <div>
                  <span className="font-medium">{f.title}</span>
                  <span className="block font-mono text-xs text-steel mt-0.5">{f.category}</span>
                </div>
                <span className="font-mono text-xs text-accent-dark border border-paper-line px-2.5 py-1">
                  Open &rarr;
                </span>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-steel">
            No documents have been added yet. Add them in{" "}
            <code className="font-mono text-xs bg-paper-line px-1.5 py-0.5">/admin/downloads</code>.
          </p>
        )}
      </section>
    </>
  );
}
