import Link from "next/link";
import { notFound } from "next/navigation";
import { notices } from "@/lib/repo";
import NoticeForm from "../NoticeForm";
import { saveNoticeAction, deleteNoticeAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditNotice({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const notice = await notices.getById(id);
  if (!notice) notFound();
  return (
    <div>
      <Link href="/admin/notices" className="text-sm text-steel hover:text-brand-700">&larr; All notices</Link>
      <div className="mt-2 flex items-center justify-between gap-4">
        <h1 className="font-display font-semibold text-2xl">Edit notice</h1>
        <form action={deleteNoticeAction}>
          <input type="hidden" name="id" value={notice.id} />
          <button className="text-xs border border-paper-line px-3 py-1.5 hover:border-accent hover:text-accent">Delete notice</button>
        </form>
      </div>
      <NoticeForm notice={notice} action={saveNoticeAction} error={sp.error} saved={sp.saved === "1"} />
    </div>
  );
}
