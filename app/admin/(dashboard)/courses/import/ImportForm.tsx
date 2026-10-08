"use client";

import Link from "next/link";
import { useRef, useState } from "react";

type Row = { row: number; status: "new" | "update" | "skip" | "error"; message?: string; name: string; department: string; level: number };
type Result = { committed: boolean; summary: { total: number; new: number; update: number; skip: number; error: number }; rows: Row[] };

const BADGE: Record<Row["status"], string> = {
  new: "bg-accent text-brand-900",
  update: "bg-brand-200 text-brand-900",
  skip: "bg-paper-line text-steel",
  error: "bg-red-100 text-red-800",
};
const LABEL: Record<Row["status"], string> = { new: "New", update: "Update", skip: "Skip", error: "Problem" };

export default function ImportForm() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"skip" | "update">("skip");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [fileName, setFileName] = useState("");

  async function send(commit: boolean) {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choose a file first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("mode", mode);
      fd.set("commit", commit ? "1" : "0");
      const res = await fetch("/api/admin/courses/import", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Something went wrong.");
        if (!commit) setResult(null);
      } else {
        setResult(json);
      }
    } catch {
      setError("Could not upload the file. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const s = result?.summary;
  const todo = s ? s.new + s.update : 0;

  return (
    <div className="mt-8 max-w-4xl space-y-8">
      <section className="border border-paper-line bg-white p-6">
        <h2 className="font-display font-semibold text-lg"><span className="font-mono text-accent-dark text-sm mr-2">1</span>Get the Excel template</h2>
        <p className="mt-1 text-sm text-steel">Fill one row per course. Department and Level have drop-down lists, so there is little room for mistakes.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="/api/admin/courses/template" className="bg-brand-700 text-white font-semibold px-5 py-2.5 hover:bg-brand-900">&darr; Download blank template</a>
          <a href="/api/admin/courses/template?export=1" className="border border-brand-700 text-brand-700 font-medium px-5 py-2.5 hover:bg-brand-700 hover:text-white">&darr; Download current courses</a>
        </div>
        <p className="mt-3 text-xs text-steel">&ldquo;Current courses&rdquo; is handy for fixing many courses at once: edit in Excel, then upload with <em>Update existing</em> ticked below.</p>
      </section>

      <section className="border border-paper-line bg-white p-6">
        <h2 className="font-display font-semibold text-lg"><span className="font-mono text-accent-dark text-sm mr-2">2</span>Upload the filled file</h2>
        <div className="mt-4 space-y-4">
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.csv"
            onChange={(e) => {
              setFileName(e.target.files?.[0]?.name || "");
              setResult(null);
              setError("");
            }}
            className="block text-sm file:mr-3 file:border file:border-paper-line file:bg-white file:px-4 file:py-2 file:text-sm hover:file:border-brand-700"
          />
          <fieldset className="text-sm space-y-1">
            <legend className="text-steel mb-1">If a course already exists (same name, department and level)</legend>
            <label className="flex items-center gap-2"><input type="radio" checked={mode === "skip"} onChange={() => { setMode("skip"); setResult(null); }} /> Skip it (safe)</label>
            <label className="flex items-center gap-2"><input type="radio" checked={mode === "update"} onChange={() => { setMode("update"); setResult(null); }} /> Update existing with the values in the file</label>
          </fieldset>
          <button onClick={() => send(false)} disabled={busy || !fileName} className="bg-brand-700 text-white font-semibold px-5 py-2.5 hover:bg-brand-900 disabled:opacity-40">
            {busy && !result ? "Checking…" : "Check the file"}
          </button>
          <p className="text-xs text-steel">Nothing is saved yet. You see a preview first.</p>
        </div>
        {error && <p role="alert" className="mt-4 text-sm text-red-700 border border-red-300 bg-red-50 p-3">{error}</p>}
      </section>

      {result && s && (
        <section className="border border-paper-line bg-white p-6">
          <h2 className="font-display font-semibold text-lg"><span className="font-mono text-accent-dark text-sm mr-2">3</span>{result.committed ? "Done" : "Preview and confirm"}</h2>
          <p className="mt-2 text-sm">
            {result.committed ? "Imported: " : "Found "}
            <strong>{s.new}</strong> new{s.update > 0 && <>, <strong>{s.update}</strong> to update</>}
            {s.skip > 0 && <>, <strong>{s.skip}</strong> skipped</>}
            {s.error > 0 && <>, <strong className="text-red-700">{s.error}</strong> with a problem</>}.
          </p>
          {s.error > 0 && !result.committed && <p className="mt-1 text-xs text-steel">Rows with a problem are left out. Fix them in the file and check again, or import the rest now.</p>}

          <div className="mt-4 max-h-96 overflow-auto border border-paper-line">
            <table className="w-full text-sm">
              <thead className="bg-paper sticky top-0 text-left text-xs text-steel">
                <tr><th className="px-3 py-2">Row</th><th className="px-3 py-2">Result</th><th className="px-3 py-2">Course</th><th className="px-3 py-2">Department</th><th className="px-3 py-2">Level</th></tr>
              </thead>
              <tbody className="divide-y divide-paper-line">
                {result.rows.map((r) => (
                  <tr key={r.row}>
                    <td className="px-3 py-2 font-mono text-xs text-steel">{r.row}</td>
                    <td className="px-3 py-2"><span className={`px-2 py-0.5 text-[11px] font-semibold ${BADGE[r.status]}`}>{LABEL[r.status]}</span>{r.message && <span className="ml-2 text-xs text-steel">{r.message}</span>}</td>
                    <td className="px-3 py-2">{r.name || "—"}</td>
                    <td className="px-3 py-2 text-steel">{r.department || "—"}</td>
                    <td className="px-3 py-2 text-steel">{r.level || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!result.committed ? (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button onClick={() => send(true)} disabled={busy || todo === 0} className="bg-accent text-brand-900 font-semibold px-6 py-2.5 hover:bg-accent-dark disabled:opacity-40">
                {busy ? "Importing…" : `Import ${todo} course${todo === 1 ? "" : "s"}`}
              </button>
              {todo === 0 && <span className="text-xs text-steel">There is nothing new to import.</span>}
            </div>
          ) : (
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/admin/courses" className="bg-brand-700 text-white font-semibold px-5 py-2.5 hover:bg-brand-900">See the courses</Link>
              <Link href="/courses" target="_blank" className="border border-brand-700 text-brand-700 font-medium px-5 py-2.5 hover:bg-brand-700 hover:text-white">View on the website &nearr;</Link>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
