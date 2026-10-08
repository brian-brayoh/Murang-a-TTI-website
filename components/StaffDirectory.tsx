"use client";

import { useMemo, useState } from "react";

type Person = { id: string; name: string; title: string; department: string; photo_url: string };

function initials(name: string) {
  return name
    .replace(/^(prof\.?|dr\.?|mr\.?|mrs\.?|ms\.?|madam)\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function StaffDirectory({ people }: { people: Person[] }) {
  const [dept, setDept] = useState("All");
  const [q, setQ] = useState("");

  const departments = useMemo(
    () => ["All", ...Array.from(new Set(people.map((p) => p.department)))],
    [people]
  );

  const shown = people.filter(
    (p) =>
      (dept === "All" || p.department === dept) &&
      (q.trim() === "" ||
        `${p.name} ${p.title}`.toLowerCase().includes(q.trim().toLowerCase()))
  );

  return (
    <div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {departments.map((d) => (
            <button
              key={d}
              onClick={() => setDept(d)}
              className={`px-3.5 py-1.5 text-sm border transition-colors ${
                dept === d
                  ? "bg-brand-700 border-brand-700 text-white"
                  : "border-paper-line hover:border-brand-700"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or role"
          aria-label="Search staff"
          className="w-full lg:w-64 border border-paper-line bg-white px-3.5 py-2 text-sm focus:outline-none focus:border-brand-700"
        />
      </div>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-paper-line border border-paper-line">
        {shown.map((p) => (
          <article key={p.id} className="group relative bg-paper p-6 hover:bg-white transition-colors">
            <span className="absolute top-0 left-0 h-0.5 w-0 bg-accent group-hover:w-full transition-all duration-300" />
            {p.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.photo_url}
                alt={p.name}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover object-top bg-brand-200"
              />
            ) : (
              <div className="aspect-[4/5] w-full bg-brand-700 text-white grid place-items-center font-display font-semibold text-4xl">
                {initials(p.name)}
              </div>
            )}
            <h3 className="mt-4 font-display font-semibold leading-snug">{p.name}</h3>
            <p className="mt-0.5 text-sm text-steel">{p.title}</p>
            <p className="mt-3 font-mono text-xs text-accent-dark">{p.department}</p>
          </article>
        ))}
      </div>

      {shown.length === 0 && (
        <p className="mt-8 text-sm text-steel">No staff match your search.</p>
      )}
    </div>
  );
}
