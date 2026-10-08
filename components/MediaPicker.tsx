"use client";

import { useEffect, useRef, useState } from "react";
import MediaBrowser, { type MediaItem } from "./MediaBrowser";

// A modal wrapper around MediaBrowser. Call `open` from a button.
export function MediaModal({
  open,
  onClose,
  onPick,
  accept = "all",
  multiple = false,
  title = "Media library",
}: {
  open: boolean;
  onClose: () => void;
  onPick: (items: MediaItem[]) => void;
  accept?: "all" | "image";
  multiple?: boolean;
  title?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[min(60rem,calc(100vw-1.5rem))] max-h-[90vh] p-0 border border-paper-line bg-paper backdrop:bg-brand-900/70 overflow-hidden"
    >
      {open && (
        <div className="max-h-[90vh] overflow-y-auto p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-xl text-brand-900">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="text-2xl leading-none text-steel hover:text-brand-900">&times;</button>
          </div>
          <MediaBrowser mode="pick" accept={accept} multiple={multiple} onPick={(items) => { onPick(items); onClose(); }} />
        </div>
      )}
    </dialog>
  );
}

// Single image field: shows a preview, a Choose button and a hidden input for the form.
export function ImageField({ name, defaultValue = "", label = "Image", onChange }: { name: string; defaultValue?: string; label?: string; onChange?: (url: string) => void }) {
  const [url, setUrl0] = useState(defaultValue);
  const setUrl = (v: string) => {
    setUrl0(v);
    onChange?.(v);
  };
  const [open, setOpen] = useState(false);
  return (
    <div>
      <label className="text-sm text-steel">{label}</label>
      <input type="hidden" name={name} value={url} />
      <div className="mt-1 flex items-center gap-3">
        <div className="h-20 w-32 bg-brand-900/5 border border-paper-line grid place-items-center overflow-hidden">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-steel">No image</span>
          )}
        </div>
        <div className="flex flex-col gap-1 items-start">
          <button type="button" onClick={() => setOpen(true)} className="text-sm border border-paper-line px-3 py-1.5 bg-white hover:border-brand-700">
            {url ? "Change" : "Choose from library"}
          </button>
          {url && (
            <button type="button" onClick={() => setUrl("")} className="text-xs text-steel hover:text-accent">Remove</button>
          )}
        </div>
      </div>
      <MediaModal open={open} onClose={() => setOpen(false)} accept="image" title="Choose an image" onPick={(l) => l[0] && setUrl(l[0].url)} />
    </div>
  );
}

// Multiple image field (for page photo strips). Stores a JSON array.
export function ImagesField({ name, defaultValue = [], label = "Photos" }: { name: string; defaultValue?: string[]; label?: string }) {
  const [urls, setUrls] = useState<string[]>(defaultValue);
  const [open, setOpen] = useState(false);
  return (
    <div>
      <label className="text-sm text-steel">{label}</label>
      <input type="hidden" name={name} value={JSON.stringify(urls)} />
      <ul className="mt-1 flex flex-wrap gap-2">
        {urls.map((u, i) => (
          <li key={u + i} className="relative h-20 w-28 border border-paper-line overflow-hidden group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="h-full w-full object-cover" />
            <button type="button" aria-label="Remove photo" onClick={() => setUrls((l) => l.filter((_, j) => j !== i))} className="absolute top-0 right-0 bg-brand-900/80 text-white text-xs px-1.5 py-0.5 opacity-0 group-hover:opacity-100 focus:opacity-100">&times;</button>
          </li>
        ))}
        <li>
          <button type="button" onClick={() => setOpen(true)} className="h-20 w-28 border-2 border-dashed border-paper-line text-sm text-steel hover:border-brand-700 hover:text-brand-700">+ Add photos</button>
        </li>
      </ul>
      <MediaModal open={open} onClose={() => setOpen(false)} accept="image" multiple title="Add photos" onPick={(l) => setUrls((cur) => [...cur, ...l.map((m) => m.url).filter((u) => !cur.includes(u))])} />
    </div>
  );
}

type Att = { label: string; url: string };
// Downloadable files (PDFs, Word...). Stores a JSON array of {label,url}.
export function FilesField({ name, defaultValue = [], label = "Attached files" }: { name: string; defaultValue?: Att[]; label?: string }) {
  const [files, setFiles] = useState<Att[]>(defaultValue);
  const [open, setOpen] = useState(false);
  return (
    <div>
      <label className="text-sm text-steel">{label}</label>
      <input type="hidden" name={name} value={JSON.stringify(files)} />
      <ul className="mt-1 space-y-2">
        {files.map((f, i) => (
          <li key={f.url + i} className="flex items-center gap-2">
            <input
              value={f.label}
              onChange={(e) => setFiles((l) => l.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
              aria-label="Link text"
              className="flex-1 min-w-0 border border-paper-line px-3 py-1.5 bg-paper text-sm focus:outline-none focus:border-brand-700"
            />
            <button type="button" onClick={() => setFiles((l) => l.filter((_, j) => j !== i))} className="text-xs text-steel hover:text-accent">Remove</button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setOpen(true)} className="mt-2 text-sm border border-paper-line px-3 py-1.5 bg-white hover:border-brand-700">+ Attach file</button>
      <MediaModal
        open={open}
        onClose={() => setOpen(false)}
        multiple
        title="Attach files"
        onPick={(l) =>
          setFiles((cur) => [
            ...cur,
            ...l.filter((m) => !cur.some((c) => c.url === m.url)).map((m) => ({ label: m.filename.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " "), url: m.url })),
          ])
        }
      />
    </div>
  );
}

// Single file (PDF, Word...). Stores the file's address in a hidden input.
export function FileField({ name, defaultValue = "", label = "File" }: { name: string; defaultValue?: string; label?: string }) {
  const [url, setUrl] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const fileName = url ? decodeURIComponent(url.split("?")[0].split("/").pop() || url) : "";
  return (
    <div>
      <label className="text-sm text-steel">{label}</label>
      <input type="hidden" name={name} value={url} />
      <div className="mt-1 flex flex-wrap items-center gap-3">
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-700 underline break-all max-w-xs">{fileName}</a>
        ) : (
          <span className="text-sm text-steel">No file attached</span>
        )}
        <button type="button" onClick={() => setOpen(true)} className="text-sm border border-paper-line px-3 py-1.5 bg-white hover:border-brand-700">
          {url ? "Change" : "Choose from library"}
        </button>
        {url && (
          <button type="button" onClick={() => setUrl("")} className="text-xs text-steel hover:text-accent">Remove</button>
        )}
      </div>
      <MediaModal open={open} onClose={() => setOpen(false)} title="Choose a file" onPick={(l) => l[0] && setUrl(l[0].url)} />
    </div>
  );
}
