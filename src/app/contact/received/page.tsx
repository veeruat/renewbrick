import { Suspense } from "react";
import { ButtonLink, Sheet } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";
import { Reference } from "./reference";

/** Confirmation page for the no-JavaScript form fallback. Not indexed. */
export const metadata = pageMetadata({
  title: "Enquiry received",
  description: "Your enquiry has been received.",
  path: "/contact/received",
  noindex: true,
});

export default function ReceivedPage() {
  return (
    <section className="bg-white py-24">
      <Sheet className="max-w-3xl">
        <p className="label text-gold-ink">Enquiry received</p>
        <h1 className="display mt-4 text-display-lg">Thank you. We have your details.</h1>
        <Suspense fallback={null}>
          <Reference />
        </Suspense>
        <p className="mt-4 text-lead text-slate">
          We will contact you to talk through your requirement. This is an enquiry, not a booking: if a site inspection makes
          sense, we will agree the date, time and any applicable charges with you first.
        </p>
        <div className="mt-10">
          <ButtonLink href="/">Back to the homepage</ButtonLink>
        </div>
      </Sheet>
    </section>
  );
}
