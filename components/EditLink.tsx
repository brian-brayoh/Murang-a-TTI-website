import Link from "next/link";
import { auth } from "@/auth";

// A small "Edit" button that only signed-in admins ever see, placed next to the content it edits.
export default async function EditLink({ href, label = "Edit", className = "" }: { href: string; label?: string; className?: string }) {
  const session = await auth().catch(() => null);
  if (!session?.user) return null;
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 bg-accent text-brand-900 text-xs font-semibold px-3 py-1.5 hover:bg-accent-dark ${className}`}
    >
      ✎ {label}
    </Link>
  );
}
