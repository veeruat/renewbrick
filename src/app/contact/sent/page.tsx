import { ButtonLink, Sheet } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

// Where the contact form API redirects a browser without JavaScript after a
// successful enquiry. With JavaScript, the confirmation appears in the form.
export const metadata = pageMetadata({
  title: "Enquiry Sent",
  description: "Thank you for contacting RenewBrick. We have your details and will be in touch to talk through your requirement.",
  path: "/contact/sent",
  noindex: true,
});

export default function EnquirySentPage() {
  return (
    <section className="bg-white py-24 md:py-32">
      <Sheet>
        <div className="max-w-2xl border-t-2 border-gold bg-grey p-6 sm:p-10">
          <p className="label text-gold-ink">Enquiry sent</p>
          <h1 className="display mt-4 text-display-lg">Thank you. We have your details.</h1>
          <p className="mt-5 text-lead text-slate">We will contact you the way you asked, to talk through your requirement.</p>
          <p className="mt-3 text-slate">
            This is an enquiry, not a booking. If a site inspection makes sense, we will agree the date, time and any
            applicable charges with you before anything is arranged.
          </p>
          <div className="mt-10">
            <ButtonLink href="/">Back to the homepage</ButtonLink>
          </div>
        </div>
      </Sheet>
    </section>
  );
}
