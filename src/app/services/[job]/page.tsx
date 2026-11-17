import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionDrawing } from "@/components/drawings";
import { EnquiryBand, FaqList, ProcessSequence } from "@/components/sections";
import { DependencyNotes, SectionIntro, TickList } from "@/components/service";
import { Arrow, Breadcrumbs, Caption, InspectionButton, JsonLd, Sheet, WhatsAppButton } from "@/components/ui";
import { getJob, jobPath, jobs } from "@/content/jobs";
import { locations } from "@/content/locations";
import { servicePath } from "@/content/services";
import { absoluteUrl, business, serviceAreaList } from "@/content/site";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

// Renovation job pages (bathroom, kitchen, waterproofing, painting, flooring).
// The four main services have their own folders; only the slugs in
// src/content/jobs.ts are exported here, anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return jobs.map((j) => ({ job: j.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[job]">) {
  const job = getJob((await params).job);
  if (!job) return {};
  return pageMetadata({ title: job.metaTitle, description: job.metaDescription, path: jobPath(job.slug) });
}

const renovationPath = servicePath("renovation-civil-works");

export default async function JobPage({ params }: PageProps<"/services/[job]">) {
  const job = getJob((await params).job);
  if (!job) notFound();
  const related = job.related.map((slug) => jobs.find((j) => j.slug === slug)!);
  const areas = serviceAreaList().replace(" and ", " & ");

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: job.name,
          serviceType: job.name,
          description: job.metaDescription,
          url: absoluteUrl(jobPath(job.slug)),
          provider: { "@id": `${absoluteUrl("/")}#organization`, name: business.name },
          areaServed: business.serviceAreas.map((city) => ({ "@type": "City", name: city })),
          isRelatedTo: { "@type": "Service", name: "Renovation & Civil Works", url: absoluteUrl(renovationPath) },
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Renovation & Civil Works", path: renovationPath },
          { name: job.name, path: jobPath(job.slug) },
        ])}
      />

      <section aria-labelledby="job-title" className="relative overflow-hidden bg-navy text-white">
        <Sheet className="grid gap-12 pb-16 pt-10 md:pb-20 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Breadcrumbs
              items={[{ name: "Home", path: "/" }, { name: "Renovation & Civil Works", path: renovationPath }, { name: job.name }]}
            />
            <h1 id="job-title" className="mt-10">
              <span className="label block text-gold">
                {job.name} in {areas}
              </span>
              <span className="display mt-5 block text-display-lg">{job.headline}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lead text-mist">{job.intro}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <InspectionButton service="renovation-civil-works">Request a Site Inspection</InspectionButton>
              <WhatsAppButton service="renovation-civil-works" />
            </div>
          </div>
          <figure className="self-end lg:col-span-5">
            <div className="border border-navy-line p-4 text-white/80 sm:p-6">
              <SectionDrawing className="w-full" />
            </div>
            <figcaption>
              <Caption tone="light">
                <span className="text-gold">{job.packageCode}</span> Illustration — not a record of RenewBrick work.
              </Caption>
            </figcaption>
          </figure>
        </Sheet>
      </section>

      {/* Signs + scope */}
      <section aria-labelledby="signs-title" className="bg-white py-20 md:py-24">
        <Sheet className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionIntro number="01" label="Signs" title={`When ${job.phrase} is worth looking at.`} id="signs-title" />
            <div className="mt-10">
              <TickList items={job.signs} />
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <h2 className="label text-gold-ink">What the work can include</h2>
            <dl className="mt-6 border-t border-navy">
              {job.scope.map((s) => (
                <div key={s.title} className="grid gap-1 border-b border-grey-line py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
                  <dt className="font-semibold">{s.title}</dt>
                  <dd className="text-slate">{s.text}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-sm text-slate">
              Your written scope lists only what your property needs, selected after the inspection.
            </p>
          </div>
        </Sheet>
      </section>

      {/* Approach */}
      <section aria-labelledby="approach-title" className="bg-grey py-20 md:py-24">
        <Sheet>
          <SectionIntro number="02" label="Approach" title={`How we approach ${job.phrase}.`} id="approach-title" />
          <ol className="mt-12 grid gap-px border border-grey-line bg-grey-line md:grid-cols-2">
            {job.approach.map((a, i) => (
              <li key={a.title} className="bg-white p-7">
                <span className="label tabular-nums text-gold-ink">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-xl font-semibold">{a.title}</h3>
                <p className="mt-2 text-slate">{a.text}</p>
              </li>
            ))}
          </ol>
        </Sheet>
      </section>

      {/* Process + notes */}
      <section aria-labelledby="process-title" className="bg-white py-20 md:py-24">
        <Sheet className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionIntro number="03" label="Process" title="From enquiry to handover." id="process-title" />
            <div className="mt-8">
              <ProcessSequence tone="dark" vertical />
            </div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <h2 className="label text-gold-ink">Before work starts</h2>
            <div className="mt-6">
              <DependencyNotes items={job.notes} single />
            </div>
          </div>
        </Sheet>
      </section>

      {/* Cities + related work */}
      <section aria-labelledby="where-title" className="bg-grey py-20 md:py-24">
        <Sheet className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionIntro number="04" label="Where" title={`${job.name} across ${areas}.`} id="where-title">
              <p>Coverage within each city is confirmed when you enquire, based on your locality and the work involved.</p>
            </SectionIntro>
            <ul className="mt-8">
              {locations.map((l) => (
                <li key={l.slug} className="border-t border-grey-line last:border-b">
                  <Link href={`/locations/${l.slug}`} className="group flex min-h-14 items-center justify-between gap-4 py-3">
                    <span className="text-lg font-medium">
                      <span className="draw-link">
                        {job.name} in {l.city}
                      </span>
                    </span>
                    <Arrow className="text-gold-ink" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <h2 className="label text-gold-ink">Related work</h2>
            <ul className="mt-6">
              {related.map((r) => (
                <li key={r.slug} className="border-t border-grey-line last:border-b">
                  <Link href={jobPath(r.slug)} className="group flex min-h-14 items-center justify-between gap-4 py-3">
                    <span className="text-lg font-medium">
                      <span className="draw-link">{r.name}</span>
                    </span>
                    <Arrow className="text-gold-ink" />
                  </Link>
                </li>
              ))}
              <li className="border-t border-grey-line last:border-b">
                <Link href={renovationPath} className="group flex min-h-14 items-center justify-between gap-4 py-3">
                  <span className="text-lg font-medium">
                    <span className="draw-link">All renovation and civil works</span>
                  </span>
                  <Arrow className="text-gold-ink" />
                </Link>
              </li>
            </ul>
          </div>
        </Sheet>
      </section>

      <section aria-labelledby="faq-title" className="bg-white py-20 md:py-24">
        <Sheet className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionIntro number="05" label="Questions" title={`${job.name} questions.`} id="faq-title" />
          </div>
          <div className="lg:col-span-8">
            <FaqList items={job.faqs} />
          </div>
        </Sheet>
      </section>

      <EnquiryBand
        service="renovation-civil-works"
        title={`Planning ${job.phrase}?`}
        body="Tell us about the property and what you have in mind. We will call or message you, and arrange an inspection if it makes sense."
      />
    </>
  );
}
