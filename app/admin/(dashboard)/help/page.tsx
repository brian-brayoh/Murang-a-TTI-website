import { HELP, HELP_INTRO } from "@/lib/help-content";

export default function AdminHelp() {
  return (
    <div className="max-w-3xl">
      <h1 className="font-display font-semibold text-2xl">Help and training guide</h1>
      <p className="mt-2 text-steel">{HELP_INTRO}</p>

      <nav aria-label="Guide contents" className="mt-6 border border-paper-line bg-white p-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-steel">In this guide</p>
        <ul className="mt-2 grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
          {HELP.map((s) => (
            <li key={s.id}><a href={`#${s.id}`} className="text-brand-700 hover:text-accent-dark">{s.title}</a></li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 space-y-10">
        {HELP.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-20">
            <h2 className="font-display font-semibold text-xl text-brand-900 border-b-2 border-brand-700 pb-2">{s.title}</h2>
            {s.intro && <p className="mt-3 text-steel">{s.intro}</p>}
            {s.steps && (
              <ol className="mt-4 space-y-2.5 list-decimal pl-5 marker:text-accent-dark marker:font-semibold">
                {s.steps.map((t, i) => (
                  <li key={i} className="pl-1 leading-relaxed">{t}</li>
                ))}
              </ol>
            )}
            {s.tips && s.tips.map((t, i) => (
              <p key={i} className="mt-4 border-l-4 border-accent bg-accent/10 px-4 py-2 text-sm">{t}</p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
