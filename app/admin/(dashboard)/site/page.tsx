import { getSite } from "@/lib/site-details";
import { pageContent } from "@/lib/repo";
import UpdatedBy from "@/components/UpdatedBy";
import { ImageField } from "@/components/MediaPicker";
import { BANNER_PAGES, DEFAULT_BANNERS } from "@/lib/banners";
import { saveSiteAction } from "./actions";

export const dynamic = "force-dynamic";
const input = "mt-1 w-full border border-paper-line px-3 py-2 bg-white focus:outline-none focus:border-brand-700";

function F({ label, name, value, hint, rows }: { label: string; name: string; value: string; hint?: string; rows?: number }) {
  return (
    <div>
      <label className="text-sm text-steel">{label}</label>
      {rows ? <textarea name={name} defaultValue={value} rows={rows} className={input} /> : <input name={name} defaultValue={value} className={input} />}
      {hint && <p className="mt-1 text-xs text-steel">{hint}</p>}
    </div>
  );
}

export default async function SiteDetailsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const s = await getSite();
  const row = await pageContent.get("site:details");
  return (
    <div>
      <h1 className="font-display font-semibold text-2xl">Site details</h1>
      <p className="text-sm text-steel">
        Contact details, footer and social links. Change them once here and they update everywhere: header, footer, contact page, admissions, course pages and the WhatsApp buttons.
      </p>
      {saved && <p className="mt-4 max-w-2xl border border-brand-200 bg-brand-200/30 text-sm px-3 py-2">Saved. The whole site is updated.</p>}
      {row && <UpdatedBy at={row.updated_at} by={row.updated_by} className="mt-3" />}
      <form action={saveSiteAction} className="mt-6 space-y-8 max-w-2xl">
        <section className="border border-paper-line bg-white p-5 space-y-3">
          <h2 className="font-display font-semibold text-lg">Contact</h2>
          <F label="Address" name="address" value={s.address} />
          <div className="grid sm:grid-cols-2 gap-3">
            <F label="Phone" name="phone" value={s.phone} />
            <F label="WhatsApp number" name="whatsapp" value={s.whatsapp} hint="With country code, no + or spaces, e.g. 254748108000" />
          </div>
          <F label="Email" name="email" value={s.email} />
          <F label="Office hours" name="hours" value={s.hours} />
        </section>
        <section className="border border-paper-line bg-white p-5 space-y-3">
          <h2 className="font-display font-semibold text-lg">Footer</h2>
          <F label="Short description" name="footerBlurb" value={s.footerBlurb} rows={3} />
          <F label="Partners" name="partners" value={s.partners.join(", ")} hint="Separate with commas. Shown in the footer." />
        </section>
        <section className="border border-paper-line bg-white p-5 space-y-3">
          <h2 className="font-display font-semibold text-lg">Social media</h2>
          <p className="text-xs text-steel">Leave blank to hide. Only the ones you fill in appear in the footer.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <F label="Facebook" name="facebook" value={s.facebook} />
            <F label="Instagram" name="instagram" value={s.instagram} />
            <F label="X (Twitter)" name="x" value={s.x} />
            <F label="YouTube" name="youtube" value={s.youtube} />
            <F label="TikTok" name="tiktok" value={s.tiktok} />
          </div>
        </section>
        <section className="border border-paper-line bg-white p-5 space-y-3">
          <h2 className="font-display font-semibold text-lg">Admissions page</h2>
          <F label="Headline" name="admissionsHeadline" value={s.admissionsHeadline} hint="Update each intake, e.g. “January intake is open.”" />
          <F label="Intro" name="admissionsIntro" value={s.admissionsIntro} rows={3} />
        </section>
        <section className="border border-paper-line bg-white p-5 space-y-3">
          <h2 className="font-display font-semibold text-lg">About page cards</h2>
          <F label="Governance" name="governance" value={s.governance} />
          <F label="Leadership" name="leadership" value={s.leadership} />
        </section>
        <section className="border border-paper-line bg-white p-5 space-y-4">
          <h2 className="font-display font-semibold text-lg">Page banner photos</h2>
          <p className="text-xs text-steel">The photo behind the heading at the top of each page. Wide, bright photos of workshops and trainees work best. Use <em>Remove</em> to go back to the standard photo.</p>
          <div className="grid sm:grid-cols-2 gap-5">
            {BANNER_PAGES.map((b) => (
              <ImageField key={b.key} name={`banner_${b.key}`} label={b.label} defaultValue={s.banners[b.key] || DEFAULT_BANNERS[b.key]} />
            ))}
          </div>
        </section>
        <div className="sticky bottom-0 py-3 bg-paper/95 backdrop-blur border-t border-paper-line">
          <button className="bg-brand-700 text-white font-semibold px-6 py-2.5 hover:bg-brand-900">Save site details</button>
        </div>
      </form>
    </div>
  );
}
