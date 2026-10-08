import Link from "next/link";
import PostForm from "../PostForm";
import { createPostAction } from "../actions";

export default async function NewPost({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div>
      <Link href="/admin/posts" className="text-sm text-steel hover:text-brand-700">&larr; All news</Link>
      <h1 className="mt-2 font-display font-semibold text-2xl">New post</h1>
      <PostForm action={createPostAction} error={error} />
    </div>
  );
}
