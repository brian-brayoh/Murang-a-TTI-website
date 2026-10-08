import type { Metadata } from "next";
import HeroBackdrop from "@/components/HeroBackdrop";
import { inquiries } from "@/lib/repo";
import { redirect } from "next/navigation";
import { getSite } from "@/lib/site-details";
import { telHref, waHref } from "@/lib/contact-links";

export const metadata: Metadata = {
  title: "Contact | Murang'a TTI",
};

async function sendInquiry(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();
  if (!name || !email || !message) {
    redirect("/contact?error=1");
  }
  await inquiries.create({ name, email, message });
  redirect("/contact?sent=1");
}

export default async function Contact({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;
  const site = await getSite();

  return (
    <>
      <section className="relative bg-brand-900 text-white overflow-hidden">
        <HeroBackdrop id="contact" />
        <div className="relative max-w-6xl mx-auto px-6 lg:px-10 py-16">
          <p className="tick text-accent font-mono text-sm">Contact</p>
          <h1 className="mt-3 font-display font-semibold text-4xl max-w-2xl">
            Get in touch
          </h1>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-16 grid lg:grid-cols-[1fr_1.2fr] gap-14">
        <div className="space-y-8">
          <div>
            <p className="tick text-accent font-mono text-sm">Location</p>
            <p className="mt-2 text-lg">{site.address}</p>
          </div>
          <div>
            <p className="tick text-accent font-mono text-sm">Phone</p>
            <a href={`tel:${telHref(site.phone)}`} className="mt-2 text-lg block hover:text-accent">
              {site.phone}
            </a>
          </div>
          <div>
            <p className="tick text-accent font-mono text-sm">Email</p>
            <a href={`mailto:${site.email}`} className="mt-2 text-lg block hover:text-accent">
              {site.email}
            </a>
          </div>
          <div>
            <p className="tick text-accent font-mono text-sm">Office hours</p>
            <p className="mt-2 text-lg">{site.hours}</p>
          </div>
          <div>
            <p className="tick text-accent font-mono text-sm">WhatsApp</p>
            <a
              href={waHref(site.whatsapp)}
              className="mt-2 text-lg block hover:text-accent"
            >
              Message the admissions desk
            </a>
          </div>
        </div>

        <form action={sendInquiry} className="space-y-5 border border-paper-line p-8">
          {sent && (
            <p className="text-sm bg-brand-700/10 border border-brand-700 text-brand-700 px-4 py-2.5">
              Message sent. We&apos;ll get back to you soon.
            </p>
          )}
          {error && (
            <p className="text-sm bg-accent/10 border border-accent text-accent-dark px-4 py-2.5">
              Please fill in your name, email and message.
            </p>
          )}
          <div>
            <label className="text-sm font-medium text-steel" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              name="name"
              required
              className="mt-1.5 w-full border border-paper-line px-4 py-2.5 bg-paper focus:outline-none focus:border-brand-700"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-steel" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1.5 w-full border border-paper-line px-4 py-2.5 bg-paper focus:outline-none focus:border-brand-700"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-steel" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              className="mt-1.5 w-full border border-paper-line px-4 py-2.5 bg-paper focus:outline-none focus:border-brand-700"
            />
          </div>
          <button
            type="submit"
            className="bg-brand-700 text-white font-semibold px-6 py-3 hover:bg-brand-900 transition-colors"
          >
            Send message
          </button>
        </form>
      </section>
    </>
  );
}
