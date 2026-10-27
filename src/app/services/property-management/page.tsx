import Link from "next/link";
import { PortfolioDrawing } from "@/components/drawings";
import { EnquiryBand, FaqList } from "@/components/sections";
import { AudienceList, SectionIntro, ServiceHero, ServiceJsonLd, TickList } from "@/components/service";
import { Arrow, Sheet } from "@/components/ui";
import { faqsFor } from "@/content/faqs";
import { management as page } from "@/content/service-pages";
import { getService, servicePath, services } from "@/content/services";
import { pageMetadata } from "@/lib/seo";

const service = getService("property-management");

export const metadata = pageMetadata({
  title: service.metaTitle,
  description: service.metaDescription,
  path: servicePath(service.slug),
});

export default function PropertyManagementPage() {
  const availableNow = services.filter((s) => s.availability === "available" && s.slug !== "renovation-civil-works");
  const [availability, ...otherDeps] = page.dependencies;

  return (
    <>
      <ServiceJsonLd service={service} />
      <ServiceHero service={service} drawing={<PortfolioDrawing className="w-full" />} figure="Fig. 04" />

      {/* Status first: this service is planned */}
      <section aria-labelledby="status-title" className="border-b border-grey-line bg-grey py-14">
        <Sheet className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="label text-gold-ink">Service status</p>
            <h2 id="status-title" className="display mt-3 text-display-sm">
              Planned — not yet accepting arrangements.
            </h2>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <p className="text-slate">{availability.text}</p>
            <p className="mt-4 text-slate">
              In the meantime, much of what owners need is available today:
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
              {availableNow.map((s) => (
                <li key={s.slug}>
                  <Link href={servicePath(s.slug)} className="inline-flex min-h-11 items-center gap-3 font-semibold text-navy">
                    <span className="draw-link">{s.name}</span>
                    <Arrow />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Sheet>
      </section>

      {/* Responsibilities matrix */}
      <section aria-labelledby="matrix-title" className="bg-white py-20 md:py-24">
        <Sheet>
          <SectionIntro number="01" label="Planned scope" title="Who does what." id="matrix-title">
            <p>The planned service keeps decisions with you and coordination with us.</p>
          </SectionIntro>
          {/* A table on wider screens; each row stacks into a labelled block on phones. */}
          <table className="mt-12 w-full border-collapse text-left">
            <caption className="sr-only">Planned division of responsibilities between the owner and RenewBrick</caption>
            <thead className="max-md:sr-only">
              <tr className="border-b-2 border-navy">
                <th scope="col" className="label py-4 pr-4 text-slate">Responsibility</th>
                <th scope="col" className="label px-4 py-4 text-slate">You</th>
                <th scope="col" className="label py-4 pl-4 text-gold-ink">RenewBrick</th>
              </tr>
            </thead>
            <tbody className="max-md:border-t-2 max-md:border-navy">
              {page.responsibilities.map((r) => (
                <tr key={r.task} className="border-b border-grey-line max-md:grid max-md:grid-cols-2 max-md:gap-x-4 max-md:py-5">
                  <th scope="row" className="py-5 pr-4 text-lg font-semibold max-md:col-span-2 max-md:py-0 max-md:pb-3">
                    {r.task}
                  </th>
                  <td className="px-4 py-5 text-slate max-md:p-0">
                    <span className="label block text-slate md:hidden">You</span>
                    {r.owner === "—" ? <span aria-label="Not required">—</span> : r.owner}
                  </td>
                  <td className="py-5 pl-4 max-md:p-0">
                    <span className="label block text-gold-ink md:hidden">RenewBrick</span>
                    {r.renewbrick}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Sheet>
      </section>

      <section aria-labelledby="for-title" className="bg-grey py-20 md:py-24">
        <Sheet className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionIntro number="02" label="Who it is for" title="Owners who need one accountable contact." id="for-title" />
            <div className="mt-10">
              <AudienceList items={page.audiences} />
            </div>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <h2 className="label text-gold-ink">Planned deliverables</h2>
            <div className="mt-6">
              <TickList items={page.deliverables} marker="number" />
            </div>
            {otherDeps.map((d) => (
              <div key={d.title} className="mt-10 border-l-2 border-gold pl-5">
                <h3 className="font-semibold">{d.title}</h3>
                <p className="mt-1 text-slate">{d.text}</p>
              </div>
            ))}
          </div>
        </Sheet>
      </section>

      <section aria-labelledby="faq-title" className="bg-white py-20 md:py-24">
        <Sheet className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionIntro number="03" label="Questions" title="Related questions." id="faq-title" />
          </div>
          <div className="lg:col-span-8">
            <FaqList items={faqsFor({ ids: page.faqIds })} />
          </div>
        </Sheet>
      </section>

      <EnquiryBand
        service={service.slug}
        title="Interested when it launches?"
        body="Register your interest with a few details about your property. We will contact you when the service opens. Registering creates no commitment."
        ctaLabel="Register Interest"
        whatsappMessage={service.whatsappMessage}
      />
    </>
  );
}
