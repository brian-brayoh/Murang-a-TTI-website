import type { Metadata } from "next";
import HeroBackdrop from "@/components/HeroBackdrop";
import { staff } from "@/lib/repo";
import StaffDirectory from "@/components/StaffDirectory";

export const metadata: Metadata = {
  title: "Our Staff | Murang'a TTI",
};

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const people = await staff.listAll();

  return (
    <>
      <section className="relative bg-brand-900 text-white overflow-hidden">
        <HeroBackdrop id="staff" />
        <div className="relative max-w-6xl mx-auto px-6 lg:px-10 py-16">
          <p className="tick text-accent font-mono text-sm">Our staff</p>
          <h1 className="mt-3 font-display font-semibold text-4xl max-w-2xl">
            The people behind the training
          </h1>
          <p className="mt-4 text-brand-200 max-w-xl">
            Instructors, administrators and support staff who run the
            workshops, labs and offices at Murang&apos;a TTI.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-16">
        {people.length > 0 ? (
          <StaffDirectory people={people} />
        ) : (
          <p className="text-steel">Staff profiles are being added.</p>
        )}
      </section>
    </>
  );
}
