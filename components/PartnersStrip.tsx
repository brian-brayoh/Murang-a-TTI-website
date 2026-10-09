import { getPartners, type Partner } from "@/lib/partners";

function Tile({ p }: { p: Partner }) {
  const inner = (
    <>
      <span className="flex h-20 w-44 items-center justify-center border border-paper-line bg-white p-3 transition-shadow group-hover:shadow-md">
        {p.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.logo} alt={p.name} loading="lazy" className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="text-center font-display text-base font-semibold text-brand-900">{p.name}</span>
        )}
      </span>
      {p.logo && p.name && <span className="mt-2 block text-center font-mono text-[11px] text-steel">{p.name}</span>}
    </>
  );
  return p.url ? (
    <a href={p.url} target="_blank" rel="noopener noreferrer" className="group mx-3 block shrink-0" aria-label={p.name}>
      {inner}
    </a>
  ) : (
    <div className="group mx-3 shrink-0">{inner}</div>
  );
}

export default async function PartnersStrip() {
  const { partners } = await getPartners();
  if (partners.length === 0) return null;
  // Repeat the list so one half of the track is always wider than a big screen,
  // then show it twice: the loop restarts with no visible jump.
  const reps = Math.max(1, Math.ceil(10 / partners.length));
  const half = Array.from({ length: reps }, () => partners).flat();

  return (
    <section className="border-t border-paper-line bg-paper py-10" aria-label="Our partners">
      <p className="tick text-center font-mono text-sm text-accent-dark">Our partners</p>
      <div className="partners-viewport mt-6 overflow-hidden">
        <div className="partners-track">
          {half.map((p, i) => <Tile key={`a${i}`} p={p} />)}
          <div className="flex" aria-hidden="true">
            {half.map((p, i) => <Tile key={`b${i}`} p={{ ...p, url: "" }} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
