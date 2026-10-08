import type { Activity } from "@/lib/repo";

export default function ActivityList({ items }: { items: Activity[] }) {
  if (items.length === 0) return <p className="py-6 text-sm text-steel">Nothing yet. Changes made in the admin will appear here.</p>;
  return (
    <ul className="divide-y divide-paper-line border-t border-b border-paper-line bg-white">
      {items.map((a) => (
        <li key={a.id} className="px-4 py-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-sm">
            <b>{a.user_name || a.user_email}</b> {a.action} <span className="text-steel">{a.entity.toLowerCase()}</span>
            {a.title && <> &ldquo;{a.title}&rdquo;</>}
          </p>
          <time className="font-mono text-xs text-steel" dateTime={new Date(a.created_at).toISOString()}>
            {new Date(a.created_at).toLocaleString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Nairobi" })}
          </time>
        </li>
      ))}
    </ul>
  );
}

