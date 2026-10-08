"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type MediaItem = { id: string; url: string; filename: string; mime: string; size: number; alt: string; created_at: string };

const isImage = (m: MediaItem) => m.mime.startsWith("image/");
const kb = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const kindOf = (m: MediaItem) => (isImage(m) ? "image" : "file");
const ext = (m: MediaItem) => (m.filename.split(".").pop() || "file").toUpperCase().slice(0, 4);

// mode "manage": the library page (details, rename alt text, delete).
// mode "pick": choose files for an editor field. `accept` limits what can be chosen.
function AltField({ initial, onSave }: { initial: string; onSave: (alt: string) => void }) {
  const [alt, setAlt] = useState(initial);
  return (
    <div>
      <label className="text-xs text-steel">Description (alt text, helps accessibility and Google)</label>
      <input value={alt} onChange={(e) => setAlt(e.target.value)} className="mt-1 w-full border border-paper-line px-2 py-1.5 bg-paper focus:outline-none focus:border-brand-700" />
      <button type="button" onClick={() => onSave(alt)} className="mt-2 text-xs bg-brand-700 text-white px-3 py-1.5 hover:bg-brand-900">Save description</button>
    </div>
  );
}

export default function MediaBrowser({
  mode = "manage",
  accept = "all",
  multiple = false,
  onPick,
}: {
  mode?: "manage" | "pick";
  accept?: "all" | "image";
  multiple?: boolean;
  onPick?: (items: MediaItem[]) => void;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"all" | "image" | "file">(accept === "image" ? "image" : "all");
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [drag, setDrag] = useState(false);
  const [limit, setLimit] = useState(48);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/media", { cache: "no-store" });
      const j = await r.json();
      setItems(j.items || []);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return items.filter((m) => (kind === "all" || kindOf(m) === kind) && (!t || `${m.filename} ${m.alt}`.toLowerCase().includes(t)));
  }, [items, q, kind]);

  async function upload(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    setBusy(true);
    setMsg("");
    const fd = new FormData();
    list.forEach((f) => fd.append("files", f));
    try {
      const r = await fetch("/api/admin/media", { method: "POST", body: fd });
      const j = await r.json();
      if (j.items) setItems(j.items);
      const problems = (j.errors || []) as string[];
      setMsg(
        `${(j.added || []).length ? `${j.added.length} uploaded. ` : ""}${problems.join(" ")}`.trim() || (r.ok ? "" : "Upload failed.")
      );
      if (mode === "pick" && j.added?.length) setSelected(multiple ? (s) => [...s, ...j.items.filter((m: MediaItem) => j.added.includes(m.url)).map((m: MediaItem) => m.id)] : j.items.filter((m: MediaItem) => j.added.includes(m.url)).map((m: MediaItem) => m.id).slice(0, 1));
    } catch {
      setMsg("Upload failed. Check your connection and try again.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function toggle(id: string) {
    setSelected((s) => (multiple || mode === "manage" ? (s.includes(id) ? s.filter((x) => x !== id) : mode === "manage" ? [id] : [...s, id]) : [id]));
  }

  const current = mode === "manage" && selected.length === 1 ? items.find((m) => m.id === selected[0]) : undefined;
  async function saveAlt(alt: string) {
    if (!current) return;
    await fetch(`/api/admin/media/${current.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ alt }) });
    setItems((l) => l.map((m) => (m.id === current.id ? { ...m, alt } : m)));
    setMsg("Saved.");
  }
  async function remove() {
    if (!current) return;
    if (!confirm(`Delete ${current.filename}? Pages that use it will show a broken image.`)) return;
    await fetch(`/api/admin/media/${current.id}`, { method: "DELETE" });
    setItems((l) => l.filter((m) => m.id !== current.id));
    setSelected([]);
  }
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMsg("Link copied.");
    } catch {
      setMsg(text);
    }
  }

  const chip = (a: boolean) => `px-3 py-1.5 text-sm border ${a ? "bg-brand-700 border-brand-700 text-white" : "border-paper-line bg-white hover:border-brand-700"}`;

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }}
        className={`border-2 border-dashed p-5 text-center text-sm transition-colors ${drag ? "border-accent bg-accent/10" : "border-paper-line bg-white"}`}
      >
        <input ref={fileRef} type="file" multiple accept={accept === "image" ? "image/*" : undefined} className="hidden" onChange={(e) => e.target.files && upload(e.target.files)} />
        <p className="text-steel">
          Drag files here or{" "}
          <button type="button" onClick={() => fileRef.current?.click()} className="font-semibold text-brand-700 hover:text-accent-dark">
            choose files
          </button>
          . Photos, PDF, Word, Excel, PowerPoint (25 MB each).
        </p>
        {busy && <p className="mt-2 font-mono text-xs text-accent-dark">Uploading…</p>}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by file name" aria-label="Search media" className="border border-paper-line bg-white px-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:border-brand-700" />
        {accept !== "image" && (
          <div className="flex gap-2">
            <button type="button" className={chip(kind === "all")} onClick={() => setKind("all")}>All</button>
            <button type="button" className={chip(kind === "image")} onClick={() => setKind("image")}>Images</button>
            <button type="button" className={chip(kind === "file")} onClick={() => setKind("file")}>Documents</button>
          </div>
        )}
        <span className="font-mono text-xs text-steel ml-auto">{shown.length} files</span>
      </div>
      {msg && <p className="text-sm text-brand-700" role="status">{msg}</p>}

      <div className={mode === "manage" ? "grid lg:grid-cols-[minmax(0,1fr)_18rem] gap-6" : ""}>
        <div>
          {loading ? (
            <p className="text-sm text-steel">Loading…</p>
          ) : shown.length === 0 ? (
            <p className="text-sm text-steel border border-dashed border-paper-line p-6 text-center">
              No files yet. Upload above{items.length === 0 ? ", or run `npm run media:index` to add the files already on your server." : "."}
            </p>
          ) : (
            <ul className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
              {shown.slice(0, limit).map((m) => {
                const on = selected.includes(m.id);
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => toggle(m.id)}
                      title={m.filename}
                      className={`group relative block w-full aspect-square bg-brand-900/5 border-2 overflow-hidden text-left ${on ? "border-accent" : "border-paper-line hover:border-brand-700"}`}
                    >
                      {isImage(m) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.url} alt={m.alt || m.filename} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                      ) : (
                        <span className="absolute inset-0 grid place-items-center">
                          <span className="text-center px-1">
                            <span className="block font-display font-semibold text-brand-700 text-lg">{ext(m)}</span>
                            <span className="block text-[10px] text-steel break-all line-clamp-2">{m.filename}</span>
                          </span>
                        </span>
                      )}
                      {on && <span className="absolute top-1 right-1 bg-accent text-brand-900 text-xs font-bold px-1.5">✓</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {shown.length > limit && (
            <button type="button" onClick={() => setLimit((l) => l + 48)} className="mt-4 text-sm font-medium text-brand-700 hover:text-accent-dark">
              Show more ({shown.length - limit} left)
            </button>
          )}
        </div>

        {mode === "manage" && (
          <aside className="border border-paper-line bg-white p-4 self-start lg:sticky lg:top-4 text-sm">
            {current ? (
              <div className="space-y-3">
                {isImage(current) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={current.url} alt="" className="w-full max-h-48 object-contain bg-brand-900/5" />
                ) : (
                  <p className="font-display font-semibold text-brand-700 text-2xl">{ext(current)}</p>
                )}
                <p className="font-medium break-all">{current.filename}</p>
                <p className="font-mono text-xs text-steel">{kb(current.size)} · {new Date(current.created_at).toLocaleDateString()}</p>
                <div>
                  <label className="text-xs text-steel">Link</label>
                  <div className="flex gap-2 mt-1">
                    <input readOnly value={current.url} className="flex-1 min-w-0 border border-paper-line px-2 py-1 text-xs bg-paper" />
                    <button type="button" onClick={() => copy(current.url)} className="text-xs border border-paper-line px-2 hover:border-brand-700">Copy</button>
                  </div>
                </div>
                {isImage(current) && <AltField key={current.id} initial={current.alt} onSave={saveAlt} />}
                <button type="button" onClick={remove} className="text-xs border border-paper-line px-3 py-1.5 hover:border-accent hover:text-accent">Delete file</button>
              </div>
            ) : (
              <p className="text-steel">Select a file to see its link and details.</p>
            )}
          </aside>
        )}
      </div>

      {mode === "pick" && (
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-paper-line">
          <span className="text-sm text-steel mr-auto">{selected.length} selected</span>
          <button
            type="button"
            disabled={selected.length === 0}
            onClick={() => onPick?.(items.filter((m) => selected.includes(m.id)))}
            className="bg-accent text-brand-900 font-semibold px-5 py-2 disabled:opacity-40 hover:bg-accent-dark"
          >
            Use selected
          </button>
        </div>
      )}
    </div>
  );
}
