import Link from "next/link";
import NoticeForm from "../NoticeForm";
import { createNoticeAction } from "../actions";

export default async function NewNotice({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div>
      <Link href="/admin/notices" className="text-sm text-steel hover:text-brand-700">&larr; All notices</Link>
      <h1 className="mt-2 font-display font-semibold text-2xl">New notice</h1>
      <NoticeForm action={createNoticeAction} error={error} />
    </div>
  );
}
