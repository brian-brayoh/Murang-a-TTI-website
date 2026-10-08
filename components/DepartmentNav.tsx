"use client";

import { useEffect, useState } from "react";

type Item = { id: string; name: string };

// Jump list that follows the reader: highlights the department currently
// in view. Sticky sidebar on desktop, scrollable chip row on mobile.
export default function DepartmentNav({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items
      .map((i) => document.getElementById(i.id))
      .filter((e): e is HTMLElement => !!e);
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-25% 0px -60% 0px" }
    );
    els.forEach((e) => obs.observe(e));
    return () => obs.disconnect();
  }, [items]);

  return (
    <nav aria-label="Departments" className="lg:sticky lg:top-32 min-w-0">
      <p className="hidden lg:block tick text-accent-dark font-mono text-xs mb-4">Departments</p>
      <ul className="flex lg:flex-col gap-2 lg:gap-0 overflow-x-auto pb-2 lg:pb-0 -mx-6 px-6 lg:mx-0 lg:px-0">
        {items.map((i) => (
          <li key={i.id} className="shrink-0">
            <a
              href={`#${i.id}`}
              className={`block whitespace-nowrap lg:whitespace-normal px-3 py-2 lg:pl-4 text-sm border lg:border-0 lg:border-l-2 transition-colors ${
                active === i.id
                  ? "border-brand-700 bg-brand-700 text-white lg:bg-transparent lg:text-brand-700 lg:font-semibold"
                  : "border-paper-line lg:border-paper-line text-steel hover:text-brand-700 hover:border-brand-700"
              }`}
            >
              {i.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
