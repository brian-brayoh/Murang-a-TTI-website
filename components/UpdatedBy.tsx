// "Last updated 7 October 2026 by Jane Wanjiru" — shown on pages the admin has edited.
export default function UpdatedBy({ at, by, className = "" }: { at?: string | Date | null; by?: string | null; className?: string }) {
  if (!at || !by) return null;
  const d = new Date(at);
  if (Number.isNaN(d.getTime())) return null;
  return (
    <p className={`font-mono text-xs text-steel ${className}`}>
      Last updated{" "}
      <time dateTime={d.toISOString()}>{d.toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric", timeZone: "Africa/Nairobi" })}</time> by {by}
    </p>
  );
}
