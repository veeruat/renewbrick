import { InspectionPlanDrawing } from "@/components/drawings";
import { EnquiryBand, FaqList } from "@/components/sections";
import { AudienceList, DependencyNotes, SectionIntro, ServiceHero, ServiceJsonLd, TickList } from "@/components/service";
import { SectionLabel, Sheet } from "@/components/ui";
import { faqsFor } from "@/content/faqs";
import { maintenance as page } from "@/content/service-pages";
import { getService, servicePath } from "@/content/services";
import { pageMetadata } from "@/lib/seo";

const service = getService("property-maintenance");

export const metadata = pageMetadata({
  title: service.metaTitle,
  description: service.metaDescription,
  path: servicePath(service.slug),
});

export default function MaintenancePage() {
  return (
    <>
      <ServiceJsonLd service={service} />
      <ServiceHero service={service} drawing={<InspectionPlanDrawing className="w-full" />} figure="Fig. 02" />

      {/* The visit cycle, set as a log */}
      <section aria-labelledby="cycle-title" className="bg-white py-20 md:py-24">
        <Sheet className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionIntro number="01" label="How it works" title="A cycle, not a one-off visit." id="cycle-title">
              <p>Each visit produces a report, each report leads to decisions you make, and each repair is recorded.</p>
            </SectionIntro>
          </div>
          <ol className="lg:col-span-8">
            {page.cycle.map((c, i) => (
              <li key={c.step} className="grid grid-cols-[4rem_1fr] items-start gap-6 border-t border-grey-line py-7 last:border-b md:grid-cols-[5rem_14rem_1fr]">
                <span
                  aria-hidden="true"
                  className={`display flex h-14 w-14 items-center justify-center text-[1.75rem] ${
                    i === 3 ? "bg-gold text-navy" : "border border-navy text-navy"
                  }`}
                >
                  {c.step}
                </span>
                <h3 className="pt-3 text-xl font-semibold md:pt-3.5">{c.title}</h3>
                <p className="col-start-2 text-slate md:col-start-3 md:pt-3.5">{c.text}</p>
              </li>
            ))}
          </ol>
        </Sheet>
      </section>

      {/* What an inspection covers — like an inspection sheet */}
      <section aria-labelledby="checks-title" className="bg-grey py-20 md:py-24">
        <Sheet>
          <SectionIntro number="02" label="Scope" title="What an inspection looks at." id="checks-title">
            <p>The checklist is agreed with you and adjusted to the property. These are the areas it usually covers.</p>
          </SectionIntro>
          <div className="mt-12 grid gap-px border border-grey-line bg-grey-line sm:grid-cols-2 lg:grid-cols-4">
            {page.checks.map((c) => (
              <div key={c.area} className="bg-white p-6">
                <h3 className="label text-gold-ink">{c.area}</h3>
                <ul className="mt-5 space-y-3">
                  {c.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 border border-navy/50" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-slate">
            Also included where relevant: preventive maintenance coordination, painting and minor repairs, and support across
            multiple properties.
          </p>
        </Sheet>
      </section>

      {/* Who + problems */}
      <section aria-labelledby="for-title" className="bg-white py-20 md:py-24">
        <Sheet className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionIntro number="03" label="Who it is for" title="Owners who want fewer surprises." id="for-title" />
            <div className="mt-10">
              <AudienceList items={page.audiences} />
            </div>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <h2 className="label text-gold-ink">What it helps prevent</h2>
            <div className="mt-6">
              <TickList items={page.problems} />
            </div>
          </div>
        </Sheet>
      </section>

      {/* Charges */}
      <section aria-labelledby="fees-title" className="bg-navy py-16 text-white md:py-20">
        <Sheet className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionLabel number="04" tone="light">
              Charges
            </SectionLabel>
            <h2 id="fees-title" className="display mt-5 text-display-sm">
              How maintenance charges are separated.
            </h2>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <p className="text-lead text-mist">{page.feeNote}</p>
            <dl className="mt-8 grid gap-px border border-navy-line bg-navy-line sm:grid-cols-2">
              <div className="bg-navy p-5">
                <dt className="label text-gold">Plan or visit fee</dt>
                <dd className="mt-2 text-white">Agreed inspections, reports and coordination</dd>
              </div>
              <div className="bg-navy p-5">
                <dt className="label text-gold">Estimated separately</dt>
                <dd className="mt-2 text-white">Labour, materials and specialist work for each repair</dd>
              </div>
            </dl>
          </div>
        </Sheet>
      </section>

      <section aria-labelledby="deliver-title" className="bg-white py-20 md:py-24">
        <Sheet className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionIntro number="05" label="Deliverables" title="What you receive." id="deliver-title" />
            <div className="mt-8">
              <TickList items={page.deliverables} marker="number" />
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <h2 className="label text-gold-ink">Things to know</h2>
            <div className="mt-6">
              <DependencyNotes items={page.dependencies} single surface="grey" />
            </div>
          </div>
        </Sheet>
      </section>

      <section aria-labelledby="faq-title" className="bg-grey py-20 md:py-24">
        <Sheet className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionIntro number="06" label="Questions" title="Maintenance questions." id="faq-title" />
          </div>
          <div className="lg:col-span-8">
            <FaqList items={faqsFor({ ids: page.faqIds })} />
          </div>
        </Sheet>
      </section>

      <EnquiryBand
        service={service.slug}
        title="Want your property looked after?"
        body="Tell us about the property, where it is and how often you would like it checked. We will contact you to discuss an arrangement."
        whatsappMessage={service.whatsappMessage}
      />
    </>
  );
}
