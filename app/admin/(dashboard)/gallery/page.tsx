import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, logActivity } from "@/lib/guard";
import { galleryPhotos } from "@/lib/repo";
import { saveUpload } from "@/lib/upload";

const CATEGORIES = ["Workshops & labs", "Graduation", "Sports & clubs", "Campus life", "Community outreach", "Partner visits"];

async function create(formData: FormData) {
  "use server";
  const actor = await requireAdmin();
  await logActivity(actor, "added", "Gallery photo", String(formData.get("title") || formData.get("name") || ""));

  let url: string;
  try {
    const uploaded = await saveUpload(formData.get("photo") as File | null, "gallery");
    url = uploaded || String(formData.get("url") || "").trim();
  } catch (e) {
    redirect(`/admin/gallery?error=${encodeURIComponent((e as Error).message)}`);
  }
  if (!url) {
    redirect("/admin/gallery?error=" + encodeURIComponent("Upload a photo or paste a URL."));
  }

  await galleryPhotos.create({
    url,
    caption: String(formData.get("caption") || "").trim(),
    category: String(formData.get("category") || "Campus life"),
  });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

async function remove(formData: FormData) {
  "use server";
  const actor = await requireAdmin();
  await logActivity(actor, "deleted", "Gallery photo", String(formData.get("title") || formData.get("name") || ""));
  await galleryPhotos.remove(String(formData.get("id")));
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

const input = "mt-1 w-full border border-paper-line px-3 py-2 bg-paper focus:outline-none focus:border-brand-700";

export default async function AdminGallery({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const all = await galleryPhotos.listAll();

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl">Gallery</h1>

      <form action={create} className="mt-8 border border-paper-line p-6 grid sm:grid-cols-2 gap-4 max-w-2xl">
        {error && (
          <p className="sm:col-span-2 text-sm bg-accent/10 border border-accent text-accent-dark px-4 py-2.5">
            {error}
          </p>
        )}
        <div className="sm:col-span-2">
          <label className="text-sm text-steel">Upload a photo</label>
          <input type="file" name="photo" accept="image/*" className={input} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm text-steel">
            Or paste an image URL <span className="text-steel/70">(used only if no file is uploaded)</span>
          </label>
          <input name="url" placeholder="https://..." className={input} />
        </div>
        <div>
          <label className="text-sm text-steel">Caption (optional)</label>
          <input name="caption" className={input} />
        </div>
        <div>
          <label className="text-sm text-steel">Category</label>
          <select name="category" className={input}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <button className="sm:col-span-2 bg-brand-700 text-white font-semibold px-5 py-2.5 hover:bg-brand-900">
          Add photo
        </button>
      </form>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {all.map((p) => (
          <div key={p.id} className="border border-paper-line p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt={p.caption} className="aspect-[4/3] w-full object-cover bg-paper" />
            <p className="mt-2 text-sm font-medium">{p.caption || <span className="text-steel italic">No caption</span>}</p>
            <p className="font-mono text-xs text-accent-dark">{p.category}</p>
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/admin/edit/gallery/${p.id}`} className="text-xs border border-paper-line px-2.5 py-1.5 hover:border-brand-700">Edit</Link>
            <form action={remove} className="mt-2">
              <input type="hidden" name="id" value={p.id} />
              <button className="text-xs border border-paper-line px-2.5 py-1.5 hover:border-accent hover:text-accent">Delete</button>
            </form>
            </div>
          </div>
        ))}
        {all.length === 0 && <p className="text-sm text-steel">No photos yet.</p>}
      </div>
    </div>
  );
}
