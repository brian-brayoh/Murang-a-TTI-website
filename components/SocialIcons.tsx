// Round social icons. Only networks with a link are shown. Pure (no hooks) so the client Header can use it too.
type Links = { facebook?: string; instagram?: string; x?: string; youtube?: string; tiktok?: string };

const PATHS: Record<string, { label: string; d: string }> = {
  facebook: { label: "Facebook", d: "M13.5 22v-8h2.7l.5-3.2h-3.2V8.7c0-.9.4-1.7 1.8-1.7h1.5V4.2S15.5 4 14.3 4C11.9 4 10.3 5.4 10.3 8v2.8H7.6V14h2.7v8h3.2z" },
  instagram: { label: "Instagram", d: "M12 7.3A4.7 4.7 0 1016.7 12 4.7 4.7 0 0012 7.3zm0 7.7a3 3 0 113-3 3 3 0 01-3 3zm5-7.9a1.1 1.1 0 11-1.1-1.1A1.1 1.1 0 0117 7.1zM21 8.2a5.5 5.5 0 00-1.5-3.8A5.5 5.5 0 0015.8 3C14.300 2.900 9.700 2.900 8.200 3A5.500 5.500 0 004.400 4.400 5.500 5.500 0 003 8.200c-.100 1.500-.100 6.100 0 7.600a5.500 5.500 0 001.500 3.800A5.500 5.500 0 008.200 21c1.500.100 6.100.100 7.600 0a5.500 5.500 0 003.800-1.500 5.500 5.500 0 001.500-3.800c.100-1.500.100-6.100-.1-7.500zm-2 9.100a3.100 3.100 0 01-1.700 1.700c-1.200.5-4 .4-5.300.4s-4.100.1-5.300-.4A3.100 3.100 0 015 17.300c-.5-1.200-.4-4-.4-5.300s-.1-4.100.4-5.300A3.100 3.100 0 016.700 5c1.200-.5 4-.4 5.300-.4s4.100-.1 5.300.4A3.100 3.100 0 0119 6.700c.5 1.200.4 4 .4 5.300s.1 4.100-.4 5.300z" },
  x: { label: "X (Twitter)", d: "M17.7 3h3.100l-6.800 7.700L22 21h-6.200l-4.900-6.400L5.300 21H2.200l7.300-8.300L2 3h6.400l4.400 5.800L17.700 3zm-1.100 16.200h1.700L7.500 4.700H5.700l10.900 14.500z" },
  youtube: { label: "YouTube", d: "M21.600 7.200a2.500 2.500 0 00-1.800-1.800C18.200 5 12 5 12 5s-6.200 0-7.800.4A2.500 2.500 0 002.400 7.200C2 8.800 2 12 2 12s0 3.200.4 4.800a2.500 2.500 0 001.800 1.800C5.800 19 12 19 12 19s6.200 0 7.800-.4a2.500 2.500 0 001.800-1.800C22 15.200 22 12 22 12s0-3.200-.4-4.800zM10 15V9l5.200 3L10 15z" },
  tiktok: { label: "TikTok", d: "M16.600 3c.3 2.300 1.700 3.700 4 3.900v3a7 7 0 01-4-1.300v6.100a5.800 5.800 0 11-5.800-5.800c.3 0 .6 0 .9.100v3.100a2.800 2.800 0 102 2.700V3h2.900z" },
};

export default function SocialIcons({ links, className = "", size = 32 }: { links: Links; className?: string; size?: number }) {
  const items = (Object.keys(PATHS) as (keyof Links)[]).filter((k) => links[k]);
  if (items.length === 0) return null;
  return (
    <ul className={`flex items-center gap-2 ${className}`}>
      {items.map((k) => (
        <li key={k}>
          <a
            href={links[k]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Murang'a TTI on ${PATHS[k].label}`}
            title={PATHS[k].label}
            style={{ width: size, height: size }}
            className="grid place-items-center rounded-full border border-white/30 text-white hover:bg-accent hover:border-accent hover:text-brand-900 transition-colors"
          >
            <svg viewBox="0 0 24 24" width={size * 0.5} height={size * 0.5} fill="currentColor" aria-hidden>
              <path d={PATHS[k].d} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
