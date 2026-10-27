import { EnquiryForm } from "@/components/EnquiryForm";
import { Breadcrumbs, ButtonAnchor, JsonLd, SectionLabel, Sheet } from "@/components/ui";
import { business } from "@/content/site";
import { formatPhone, mailHref, telHref, whatsappHref } from "@/lib/contact";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact Us — Request a Site Inspection",
  description:
    "Send RenewBrick an enquiry about renovation, maintenance or rental-ready work on your property in Hyderabad or Warangal. We will call or message you back.",
  path: "/contact",
});

const steps = [
  { title: "You send the enquiry", text: "A few details about the property and what you would like done." },
  { title: "We contact you", text: "By your preferred method, to understand the requirement." },
  { title: "We agree next steps", text: "If an inspection makes sense, we agree the date, time and any charges with you first." },
];

export default function ContactPage() {
  const tel = telHref();
  const wa = whatsappHref("Hello RenewBrick, I'd like to discuss my property.");
  const mail = mailHref();

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
                Tell us about your property in Hyderabad or Warangal. This is an enquiry, not a booking — we will contact you
                to talk it through before anything is arranged.
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
          <div id="enquiry" className="scroll-mt-32 lg:col-span-8">
            <SectionLabel number="01">Enquiry</SectionLabel>
            <h2 id="enquiry-title" className="display mb-10 mt-5 text-display-md">
              About you and the property.
            </h2>
            <EnquiryForm />
          </div>

          <aside aria-labelledby="direct-title" className="lg:col-span-4">
            <div className="border-t-2 border-gold bg-grey p-6 lg:sticky lg:top-32">
              <h2 id="direct-title" className="label text-gold-ink">
                Prefer to talk?
              </h2>
              {tel || wa || mail ? (
                <>
                  <div className="mt-5 flex flex-col gap-3">
                    {wa && (
                      <ButtonAnchor variant="navy" href={wa} target="_blank" rel="noopener noreferrer">
                        WhatsApp {business.name}
                      </ButtonAnchor>
                    )}
                    {tel && (
                      <ButtonAnchor variant="outline-dark" href={tel}>
                        Call {formatPhone(business.phone!)}
                      </ButtonAnchor>
                    )}
                    {mail && (
                      <a href={mail} className="draw-link mt-2 self-start font-semibold text-navy">
                        {business.email}
                      </a>
                    )}
                  </div>
                  <p className="mt-5 text-sm text-slate">
                    Phone and WhatsApp open a conversation with us directly. They do not submit the enquiry form, so please
                    mention your locality and the work you need.
                  </p>
                </>
              ) : (
                <p className="mt-4 text-slate">
                  Direct phone and WhatsApp details will be listed here. For now, please use the enquiry form and we will
                  contact you.
                </p>
              )}
              <div className="mt-8 border-t border-grey-line pt-6">
                <h3 className="font-semibold">Service areas</h3>
                <p className="mt-1 text-slate">{business.serviceAreas.join(" and ")}, Telangana</p>
              </div>
            </div>
          </aside>
        </Sheet>
      </section>
    </>
  );
}
