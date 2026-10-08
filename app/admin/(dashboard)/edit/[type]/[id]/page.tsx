import Link from "next/link";
import { notFound } from "next/navigation";
import { EDIT_TYPES, type Field } from "@/lib/edit-config";
import { tenders, jobs, timetables, documents, galleryPhotos, staff, courses } from "@/lib/repo";
import { ImageField, FileField } from "@/components/MediaPicker";
import { saveEditAction } from "../../actions";

export const dynamic = "force-dynamic";
const input = "mt-1 w-full border border-paper-line px-3 py-2 bg-white focus:outline-none focus:border-brand-700";

async function load(type: string, id: string): Promise<Record<string, unknown> | undefined> {
  switch (type) {
    case "tender": return tenders.get(id);
    case "job": return jobs.get(id);
    case "timetable": return timetables.get(id);
    case "document": return documents.get(id);
    case "gallery": return galleryPhotos.get(id);
    case "staff": return staff.get(id);
    case "course": return courses.get(id);
  }
}

function FieldInput({ f, value }: { f: Field; value: string }) {
  const opts = (f.options || []).map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  switch (f.kind) {
    case "image": return <ImageField name={f.name} label={f.label} defaultValue={value} />;
    case "file": return <FileField name={f.name} label={f.label} defaultValue={value} />;
    case "textarea": return (<div><label className="text-sm text-steel">{f.label}</label><textarea name={f.name} rows={4} defaultValue={value} className={input} /></div>);
    case "date": return (<div><label className="text-sm text-steel">{f.label}</label><input type="date" name={f.name} defaultValue={value ? new Date(value).toISOString().slice(0, 10) : ""} className={input} /></div>);
    case "select": return (
      <div><label className="text-sm text-steel">{f.label}</label>
        <select name={f.name} defaultValue={value} className={input}>
          {!opts.some((o) => o.value === value) && value && <option value={value}>{value}</option>}
          {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select></div>);
    case "datalist": return (
      <div><label className="text-sm text-steel">{f.label}</label>
        <input name={f.name} list={`dl-${f.name}`} defaultValue={value} className={input} />
        <datalist id={`dl-${f.name}`}>{opts.map((o) => <option key={o.value} value={o.value} />)}</datalist>
        {f.hint && <p className="mt-1 text-xs text-steel">{f.hint}</p>}</div>);
    default: return (
      <div><label className="text-sm text-steel">{f.label}</label>
        <input name={f.name} required={f.required} defaultValue={value} className={input} />
        {f.hint && <p className="mt-1 text-xs text-steel">{f.hint}</p>}</div>);
  }
}

export default async function EditRecord({ params, searchParams }: { params: Promise<{ type: string; id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { type, id } = await params;
  const sp = await searchParams;
  const cfg = EDIT_TYPES[type];
  if (!cfg) notFound();
  const row = await load(type, id);
  if (!row) notFound();
  return (
    <div>
      <Link href={cfg.list} className="text-sm text-steel hover:text-brand-700">&larr; Back to list</Link>
      <h1 className="mt-2 font-display font-semibold text-2xl">Edit {cfg.label.toLowerCase()}</h1>
      <form action={saveEditAction} className="mt-6 border border-paper-line bg-white p-6 max-w-xl space-y-5">
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="id" value={id} />
        {sp.error && <p className="border border-accent bg-accent/10 text-sm px-3 py-2">{sp.error}</p>}
        {sp.saved && <p className="border border-brand-200 bg-brand-200/30 text-sm px-3 py-2">Saved. <Link href={cfg.list} className="underline">Back to the list</Link></p>}
        {cfg.fields.map((f) => (
          <FieldInput key={f.name} f={f} value={row[f.col] == null ? "" : String(row[f.col])} />
        ))}
        <button className="bg-brand-700 text-white font-semibold px-6 py-2.5 hover:bg-brand-900">Save changes</button>
      </form>
    </div>
  );
}
