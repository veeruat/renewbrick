import { SectionDrawing } from "@/components/drawings";
import { EnquiryBand, FaqList, ProcessSequence } from "@/components/sections";
import { AudienceList, DependencyNotes, SectionIntro, ServiceHero, ServiceJsonLd, TickList } from "@/components/service";
import { Sheet } from "@/components/ui";
import { faqsFor } from "@/content/faqs";
import { renovation as page } from "@/content/service-pages";
import { getService, servicePath } from "@/content/services";
import { pageMetadata } from "@/lib/seo";

const service = getService("renovation-civil-works");

export const metadata = pageMetadata({
  title: service.metaTitle,
  description: service.metaDescription,
  path: servicePath(service.slug),
});

export default function RenovationPage() {
  return (
    <>
      <ServiceJsonLd service={service} />
      <ServiceHero service={service} drawing={<SectionDrawing className="w-full" />} figure="Fig. 01" />

      {/* Who it is for + typical problems, set as a defects schedule */}
      <section aria-labelledby="for-title" className="bg-white py-20 md:py-24">
        <Sheet className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionIntro number="01" label="Who it is for" title="For owners who want it done properly, once." id="for-title" />
            <div className="mt-10">
              <AudienceList items={page.audiences} />
            </div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <h2 className="label text-gold-ink">Problems we are typically asked to solve</h2>
            <ol className="mt-6 border-t border-navy">
              {page.problems.map((p, i) => (
                <li key={p} className="grid grid-cols-[3rem_1fr] border-b border-grey-line py-4">
                  <span className="label pt-1 tabular-nums text-slate">D{i + 1}</span>
                  <span>{p}</span>
                </li>
              ))}
            </ol>
          </div>
        </Sheet>
      </section>

      {/* Scope: the work packages, as a drawing schedule */}
      <section aria-labelledby="scope-title" className="bg-grey py-20 md:py-24">
        <Sheet>
          <SectionIntro number="02" label="Scope" title="What renovation and civil works can include." id="scope-title">
            <p>
              Your written scope is built from these packages, selected and detailed for your property after the inspection.
            </p>
          </SectionIntro>
          <ol className="mt-14 border-t border-navy">
            {page.packages.map((pkg) => (
              <li key={pkg.code} className="grid gap-4 border-b border-grey-line py-8 md:grid-cols-[6rem_1fr_1fr] md:gap-8">
                <span aria-hidden="true" className="display text-display-sm text-gold-ink">
                  {pkg.code}
                </span>
                <div>
                  <h3 className="text-xl font-semibold">{pkg.title}</h3>
                  <p className="mt-2 text-slate">{pkg.text}</p>
                </div>
                <ul className="flex flex-wrap content-start gap-2">
                  {pkg.items.map((item) => (
                    <li key={item} className="border border-navy/20 bg-white px-3 py-1.5 text-sm">
                      {item}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </Sheet>
      </section>

      {/* Deliverables and process */}
      <section aria-labelledby="deliver-title" className="bg-white py-20 md:py-24">
        <Sheet className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionIntro number="03" label="Deliverables" title="What you receive." id="deliver-title" />
            <div className="mt-8">
              <TickList items={page.deliverables} marker="number" />
            </div>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <h2 className="label text-gold-ink">Process</h2>
            <div className="mt-8">
              <ProcessSequence tone="dark" vertical />
            </div>
          </div>
        </Sheet>
      </section>

      {/* Dependencies */}
      <section aria-labelledby="deps-title" className="bg-grey py-20 md:py-24">
        <Sheet>
          <SectionIntro number="04" label="Before work starts" title="Approvals, conditions and timing." id="deps-title" />
          <div className="mt-12">
            <DependencyNotes items={page.dependencies} />
          </div>
        </Sheet>
      </section>

      <section aria-labelledby="faq-title" className="bg-white py-20 md:py-24">
        <Sheet className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionIntro number="05" label="Questions" title="Renovation questions." id="faq-title" />
          </div>
          <div className="lg:col-span-8">
            <FaqList items={faqsFor({ ids: page.faqIds })} />
          </div>
        </Sheet>
      </section>

      <EnquiryBand
        service={service.slug}
        title="Planning a renovation?"
        body="Tell us about the property and the work you have in mind. We will call or message you, and arrange an inspection if it makes sense."
      />
    </>
  );
}
