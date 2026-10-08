import Link from "next/link";
import CustomForm from "../../CustomForm";

export default async function NewPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div>
      <Link href="/admin/pages" className="text-sm text-steel hover:text-brand-700">&larr; Pages</Link>
      <h1 className="mt-2 font-display font-semibold text-2xl">New page</h1>
      <CustomForm error={error} />
    </div>
  );
}
