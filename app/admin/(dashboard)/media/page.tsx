import MediaBrowser from "@/components/MediaBrowser";

export default function AdminMedia() {
  return (
    <div>
      <h1 className="font-display font-semibold text-2xl">Media library</h1>
      <p className="mt-1 text-sm text-steel max-w-2xl">
        Every photo and document for the site lives here. Upload once, then pick the file from any news post, page or
        department. Click a file for its link, a description for Google and screen readers, or to delete it.
      </p>
      <div className="mt-6">
        <MediaBrowser mode="manage" />
      </div>
    </div>
  );
}
