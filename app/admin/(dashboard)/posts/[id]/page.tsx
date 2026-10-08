import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostById } from "@/lib/repo";
import PostForm from "../PostForm";
import { savePostAction, deletePostAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditPost({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const post = await getPostById(id);
  if (!post) notFound();
  return (
    <div>
      <Link href="/admin/posts" className="text-sm text-steel hover:text-brand-700">&larr; All news</Link>
      <div className="mt-2 flex items-center justify-between gap-4">
        <h1 className="font-display font-semibold text-2xl">Edit post</h1>
        <form action={deletePostAction}>
          <input type="hidden" name="id" value={post.id} />
          <button className="text-xs border border-paper-line px-3 py-1.5 hover:border-accent hover:text-accent">Delete post</button>
        </form>
      </div>
      <PostForm post={post} action={savePostAction} error={sp.error} saved={sp.saved === "1"} />
    </div>
  );
}
