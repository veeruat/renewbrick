import Link from "next/link";
import { EnquiryForm } from "@/components/EnquiryForm";
import { Breadcrumbs, ButtonAnchor, JsonLd, SectionLabel, Sheet } from "@/components/ui";
import { business, serviceAreaList } from "@/content/site";
import { formatPhone, inspectionMessage, mailHref, telHref, whatsappHref } from "@/lib/contact";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact Us — Request a Site Inspection",
  description:
    "Send RenewBrick your details to discuss renovation, maintenance or rental-ready work on your property in Hyderabad, Bangalore or Warangal.",
  path: "/contact",
});

const include = [
  "The city and locality of the property",
  "The type of property — apartment, independent house, several units or commercial",
  "What you would like done, in a sentence or two",
  "A good time to call you, if that helps",
];

const steps = [
  { title: "You send your details", text: "Tell us about the property and what you have in mind." },
  { title: "We talk it through", text: "We ask a few questions to understand the requirement." },
  { title: "We agree next steps", text: "If an inspection makes sense, we agree the date, time and any charges with you first." },
];

export default function ContactPage() {
  const wa = whatsappHref(inspectionMessage());
  const tel = telHref();
  const mail = mailHref({ subject: "Site inspection request", body: inspectionMessage() });
  const channels = [wa, tel, mail].filter(Boolean).length;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />

      <section aria-labelledby="contact-title" className="bg-navy text-white">
        <Sheet className="pb-14 pt-10 md:pb-20">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Contact" }]} />
          <div className="mt-12 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="label text-gold">Contact</p>
              <h1 id="contact-title" className="display mt-5 text-display-lg">
                Request a site inspection.
              </h1>
              <p className="mt-6 max-w-xl text-lead text-mist">
                Tell us about your property in Hyderabad, Bangalore or Warangal and we will get back to you. Nothing is booked
                until you have confirmed it with us.
              </p>
            </div>
            <ol className="self-end border-t border-navy-line lg:col-span-5">
              {steps.map((s, i) => (
                <li key={s.title} className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-navy-line py-4">
                  <span className="label pt-1 tabular-nums text-gold">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="font-semibold">{s.title}</p>
                    <p className="text-[0.95rem] text-mist">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Sheet>
      </section>

      <section aria-labelledby="enquiry-title" className="bg-white py-16 md:py-24">
        <Sheet className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionLabel number="01">Send an enquiry</SectionLabel>
            <h2 id="enquiry-title" className="display mb-10 mt-5 scroll-mt-32 text-display-md">
              Tell us about your property.
            </h2>
            <div id="enquiry" className="scroll-mt-32">
              <EnquiryForm />
            </div>

            {(wa || tel || mail) && (
              <div className="mt-16 border-t border-grey-line pt-10">
                <h3 className="label text-gold-ink">{channels > 1 ? "Or contact us directly" : "Prefer email?"}</h3>
                <div className={`mt-5 grid gap-px border border-grey-line bg-grey-line ${channels > 1 ? "sm:grid-cols-2" : ""}`}>
                  {wa && (
                    <div className="flex flex-col justify-between gap-6 bg-white p-6">
                      <div>
                        <p className="text-lg font-semibold">WhatsApp</p>
                        <p className="mt-1 text-slate">Best for sending photographs. The message opens pre-filled.</p>
                      </div>
                      <ButtonAnchor href={wa} target="_blank" rel="noopener noreferrer">
                        Message on WhatsApp
                      </ButtonAnchor>
                    </div>
                  )}
                  {tel && (
                    <div className="flex flex-col justify-between gap-6 bg-white p-6">
                      <div>
                        <p className="text-lg font-semibold">Phone</p>
                        <p className="mt-1 text-slate">Prefer to speak to someone? Call us on {formatPhone(business.phone!)}.</p>
                      </div>
                      <ButtonAnchor variant="navy" href={tel}>
                        Call {formatPhone(business.phone!)}
                      </ButtonAnchor>
                    </div>
                  )}
                  {mail && (
                    <div
                      className={`flex flex-col justify-between gap-6 bg-white p-6 sm:flex-row sm:items-center ${channels === 3 ? "sm:col-span-2" : ""}`}
                    >
                      <p className="text-slate">
                        Write to <span className="font-semibold text-navy">{business.email}</span>. You can attach photographs.
                      </p>
                      <ButtonAnchor variant="outline-dark" href={mail}>
                        Email {business.name}
                      </ButtonAnchor>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <aside aria-labelledby="include-title" className="lg:col-span-5">
            <div className="border-t-2 border-gold bg-grey p-6 lg:sticky lg:top-32">
              <h2 id="include-title" className="label text-gold-ink">
                Helpful details to include
              </h2>
              <ol className="mt-5 space-y-3">
                {include.map((item, i) => (
                  <li key={item} className="flex gap-4">
                    <span className="label w-6 shrink-0 pt-1 tabular-nums text-gold-ink">{String(i + 1).padStart(2, "0")}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-8 border-t border-grey-line pt-6">
                <h3 className="font-semibold">Service areas</h3>
                <p className="mt-1 text-slate">{serviceAreaList()}</p>
              </div>
              <div className="mt-6 border-t border-grey-line pt-6">
                <h3 className="font-semibold">What happens to your details</h3>
                <p className="mt-1 text-slate">
                  Your enquiry is emailed to the RenewBrick team so we can reply. The website itself does not keep a copy. See the{" "}
                  <Link href="/privacy-policy" className="font-semibold text-navy underline decoration-gold underline-offset-4">
                    privacy policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </aside>
        </Sheet>
      </section>
    </>
  );
}
