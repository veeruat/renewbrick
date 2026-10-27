import { SnagPlanDrawing } from "@/components/drawings";
import { EnquiryBand, FaqList } from "@/components/sections";
import { AudienceList, SectionIntro, ServiceHero, ServiceJsonLd, TickList } from "@/components/service";
import { Arrow, Sheet } from "@/components/ui";
import { faqsFor } from "@/content/faqs";
import { rentalReady as page } from "@/content/service-pages";
import { getService, servicePath } from "@/content/services";
import { pageMetadata } from "@/lib/seo";

const service = getService("rental-ready");

export const metadata = pageMetadata({
  title: service.metaTitle,
  description: service.metaDescription,
  path: servicePath(service.slug),
});

export default function RentalReadyPage() {
  const [notIncluded, ...otherDeps] = page.dependencies;
  return (
    <>
      <ServiceJsonLd service={service} />
      <ServiceHero service={service} drawing={<SnagPlanDrawing className="w-full" />} figure="Fig. 03" />

      {/* Turnover: four phases between occupants */}
      <section aria-labelledby="turnover-title" className="bg-white py-20 md:py-24">
        <Sheet>
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <SectionIntro number="01" label="The turnover" title="From one occupant to the next, in four steps." id="turnover-title" />
            </div>
            <p className="self-end text-slate lg:col-span-5 lg:col-start-8">
              Each step produces something you can keep: a record of condition, a list of what needs doing, the work itself,
              and a final check.
            </p>
          </div>
          <ol className="mt-14 grid border-y border-navy md:grid-cols-4">
            {page.turnover.map((t, i) => (
              <li key={t.phase} className="relative border-b border-grey-line py-8 last:border-b-0 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0">
                <p className="label text-gold-ink">
                  {String(i + 1).padStart(2, "0")} · {t.phase}
                </p>
                <h3 className="display mt-3 text-display-sm">{t.title}</h3>
                <ul className="mt-5 space-y-2 text-[0.95rem] text-slate">
                  {t.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span aria-hidden="true" className="mt-[0.75em] h-px w-3 shrink-0 bg-gold-ink" />
                      {item}
                    </li>
                  ))}
                </ul>
                {i < page.turnover.length - 1 && (
                  <span aria-hidden="true" className="absolute -right-3 top-9 z-10 hidden bg-white px-1 text-gold-ink md:block">
                    <Arrow />
                  </span>
                )}
              </li>
            ))}
          </ol>
        </Sheet>
      </section>

      {/* Not included — stated plainly */}
      <section aria-labelledby="excl-title" className="bg-navy py-14 text-white">
        <Sheet className="grid items-center gap-6 md:grid-cols-12">
          <h2 id="excl-title" className="label text-gold md:col-span-3">
            {notIncluded.title}
          </h2>
          <p className="display text-display-sm md:col-span-9">{notIncluded.text}</p>
        </Sheet>
      </section>

      {/* Report contents + audiences + problems */}
      <section aria-labelledby="report-title" className="bg-grey py-20 md:py-24">
        <Sheet className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionIntro number="02" label="Condition reports" title="What a condition report records." id="report-title" />
            <ul className="mt-8 border-t border-navy bg-white">
              {page.report.map((r, i) => (
                <li key={r} className="flex items-center justify-between border-b border-grey-line px-5 py-4">
                  <span>{r}</span>
                  <span className="label tabular-nums text-slate">{String(i + 1).padStart(2, "0")}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <h2 className="label text-gold-ink">Who it is for</h2>
            <div className="mt-6">
              <AudienceList items={page.audiences} />
            </div>
            <h2 className="label mt-12 text-gold-ink">Problems it addresses</h2>
            <div className="mt-6">
              <TickList items={page.problems} />
            </div>
          </div>
        </Sheet>
      </section>

      <section aria-labelledby="deliver-title" className="bg-white py-20 md:py-24">
        <Sheet className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionIntro number="03" label="Deliverables" title="What you receive." id="deliver-title" />
            <div className="mt-8">
              <TickList items={page.deliverables} marker="number" />
            </div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <h2 className="label text-gold-ink">Things to know</h2>
            <dl className="mt-6 space-y-6">
              {otherDeps.map((d) => (
                <div key={d.title} className="border-l-2 border-gold pl-5">
                  <dt className="font-semibold">{d.title}</dt>
                  <dd className="mt-1 text-slate">{d.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Sheet>
      </section>

      <section aria-labelledby="faq-title" className="bg-grey py-20 md:py-24">
        <Sheet className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionIntro number="04" label="Questions" title="Rental preparation questions." id="faq-title" />
          </div>
          <div className="lg:col-span-8">
            <FaqList items={faqsFor({ ids: page.faqIds })} />
          </div>
        </Sheet>
      </section>

      <EnquiryBand
        service={service.slug}
        title="Property between occupants?"
        body="Tell us when the property will be vacant and what you know needs attention. We will contact you to plan the inspection."
      />
    </>
  );
}
