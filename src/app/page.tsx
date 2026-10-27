import Link from "next/link";
import { ElevationDrawing } from "@/components/drawings";
import { EnquiryBand, FaqList, ProcessSequence } from "@/components/sections";
import { Arrow, AvailabilityTag, ButtonAnchor, ButtonLink, Caption, InspectionButton, InspectionTextLink, SectionLabel, Sheet } from "@/components/ui";
import { faqsFor } from "@/content/faqs";
import { hero, principles, scenarios } from "@/content/home";
import { locations } from "@/content/locations";
import { getService, servicePath, services } from "@/content/services";
import { inspectionLink, telHref } from "@/lib/contact";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "RenewBrick — Renovation & Property Care in Hyderabad and Warangal",
  description:
    "RenewBrick plans and coordinates home and apartment renovation, civil works, property maintenance and rental-ready services in Hyderabad and Warangal. Request a site inspection.",
  path: "/",
  absoluteTitle: true,
});

const homeFaqIds = ["inspection-booking", "inspection-fee", "estimate-basis", "additional-work", "who-does-work", "locations-remote-owner"];

export default function HomePage() {
  const tel = telHref();
  const viaWhatsApp = inspectionLink().channel === "whatsapp";

  return (
    <>
      {/* A. Hero */}
      <section aria-labelledby="hero-title" className="relative overflow-hidden bg-navy text-white">
        <div aria-hidden="true" className="bond absolute inset-y-0 right-0 hidden w-1/2 opacity-[0.05] lg:block" />
        <Sheet className="relative grid gap-12 pb-12 pt-12 md:pt-20 lg:grid-cols-12 lg:gap-8 lg:pb-16">
          <div className="lg:col-span-7 lg:pt-6">
            <SectionLabel tone="light">{hero.eyebrow}</SectionLabel>
            <h1 id="hero-title" className="display mt-6 text-display-xl">
              <span className="block">{hero.headline[0]}</span>
              <span className="block">{hero.headline[1]}</span>
              <span className="block">
                <em className="text-gold">Elevate</em> your property.
              </span>
            </h1>
            <p className="mt-8 max-w-xl text-lead text-mist">{hero.body}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <InspectionButton />
              {tel && viaWhatsApp ? (
                <ButtonAnchor variant="outline-light" href={tel}>
                  Call RenewBrick
                </ButtonAnchor>
              ) : (
                <ButtonLink variant="outline-light" href="#how-we-work" arrow={false}>
                  See how we work
                </ButtonLink>
              )}
            </div>
          </div>
          <figure className="lg:col-span-5">
            <ElevationDrawing className="mx-auto w-full max-w-md text-white/80 lg:max-w-none" />
            <figcaption>
              <Caption tone="light">
                <span className="text-gold">Fig. 00</span> Illustration — not a RenewBrick project.
              </Caption>
            </figcaption>
          </figure>
        </Sheet>

        {/* Title block: where, what, next */}
        <Sheet className="relative pb-14">
          <dl className="grid border border-navy-line sm:grid-cols-3">
            <div className="border-b border-navy-line p-5 sm:border-b-0 sm:border-r">
              <dt className="label text-gold">Serving</dt>
              <dd className="display mt-2 text-display-sm">
                {locations.map((l, i) => (
                  <span key={l.slug}>
                    {i > 0 && <span className="text-gold"> &amp; </span>}
                    <Link href={`/locations/${l.slug}`} className="draw-link">
                      {l.city}
                    </Link>
                  </span>
                ))}
              </dd>
              <dd className="mt-1 text-sm text-mist">Telangana</dd>
            </div>
            <div className="border-b border-navy-line p-5 sm:border-b-0 sm:border-r">
              <dt className="label text-gold">Services</dt>
              <dd className="mt-2 text-[0.95rem] leading-relaxed text-white">
                Renovation &amp; civil works · Maintenance · Rental-ready · Management{" "}
                <span className="text-mist">(planned)</span>
              </dd>
            </div>
            <div className="p-5">
              <dt className="label text-gold">First step</dt>
              <dd className="mt-2 text-[0.95rem] leading-relaxed text-white">
                Message us on WhatsApp or call. We talk it through, and arrange an inspection if it makes sense.
              </dd>
            </div>
          </dl>
        </Sheet>
      </section>

      {/* C. Services — an editorial index, not a card grid */}
      <section aria-labelledby="services-title" className="bg-white py-20 md:py-28">
        <Sheet className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <SectionLabel number="01">Services</SectionLabel>
              <h2 id="services-title" className="display mt-5 text-display-md">
                Four ways we look after property.
              </h2>
              <p className="mt-5 text-slate">
                Each starts the same way — an inspection and a written scope — and each is carried through by execution
                partners and specialists we coordinate on your behalf.
              </p>
            </div>
          </div>
          <ol className="border-t border-navy lg:col-span-8">
            {services.map((s) => {
              const planned = s.availability === "planned";
              return (
                <li key={s.slug} className="group grid gap-6 border-b border-grey-line py-10 md:grid-cols-[5rem_1fr]">
                  <p aria-hidden="true" className={`display text-display-md leading-none ${planned ? "text-slate" : "text-gold-ink"}`}>
                    {s.number}
                  </p>
                  <div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <h3 className="text-2xl font-semibold tracking-[-0.01em]">
                        <Link href={servicePath(s.slug)} className="draw-link">
                          {s.name}
                        </Link>
                      </h3>
                      <AvailabilityTag planned={planned} />
                    </div>
                    <p className="mt-4 max-w-2xl text-lead text-slate">{s.need}</p>
                    <ul className="mt-6 grid gap-x-8 gap-y-2 text-[0.95rem] sm:grid-cols-2">
                      {s.includes.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-gold-ink" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3">
                      <Link href={servicePath(s.slug)} className="group/link inline-flex min-h-11 items-center gap-3 font-semibold text-navy">
                        <span className="draw-link">{planned ? "Read about the planned service" : `Explore ${s.shortName.toLowerCase()}`}</span>
                        <Arrow />
                      </Link>
                      <InspectionTextLink
                        service={s.slug}
                        className="inline-flex min-h-11 items-center font-semibold text-gold-ink underline decoration-gold underline-offset-4 hover:text-navy"
                      >
                        {planned ? "Register interest" : "Request an inspection"}
                      </InspectionTextLink>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </Sheet>
      </section>

      {/* D. How RenewBrick works */}
      <section id="how-we-work" aria-labelledby="process-title" className="bg-navy py-20 text-white md:py-28">
        <Sheet>
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <SectionLabel number="02" tone="light">
                How RenewBrick works
              </SectionLabel>
              <h2 id="process-title" className="display mt-5 text-display-md">
                Seven stages, and a written record of what was agreed.
              </h2>
            </div>
            <p className="self-end text-lead text-mist lg:col-span-5 lg:col-start-8">
              The same sequence applies whether the job is a leaking terrace or a full renovation. The gold stage is the one
              that protects you most.
            </p>
          </div>
          <div className="mt-16">
            <ProcessSequence />
          </div>
        </Sheet>
      </section>

      {/* E. Property scenarios */}
      <section aria-labelledby="scenarios-title" className="bg-grey py-20 md:py-28">
        <Sheet>
          <SectionLabel number="03">Your situation</SectionLabel>
          <h2 id="scenarios-title" className="display mt-5 max-w-3xl text-display-md">
            Where owners usually start.
          </h2>
          <div className="mt-14 grid gap-px bg-grey-line md:grid-cols-2">
            {scenarios.map((sc, i) => (
              <article key={sc.title} className={`bg-grey p-0 py-10 md:px-10 ${i % 2 === 0 ? "md:pl-0" : "md:pr-0"}`}>
                <p className="label text-gold-ink">Situation {String(i + 1).padStart(2, "0")}</p>
                <h3 className="display mt-3 text-display-sm">{sc.title}</h3>
                <p className="mt-4 text-lead italic text-navy/85" style={{ fontFamily: "var(--font-display)" }}>
                  {sc.situation}
                </p>
                <p className="mt-5 text-slate">
                  <span className="font-semibold text-navy">How we approach it: </span>
                  {sc.approach}
                </p>
                <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                  {sc.services.map((slug) => (
                    <Link key={slug} href={servicePath(slug)} className="inline-flex min-h-11 items-center gap-2 font-semibold text-navy">
                      <span className="draw-link">{getService(slug).name}</span>
                      <Arrow className="h-2 w-4" />
                    </Link>
                  ))}
                </p>
              </article>
            ))}
          </div>
        </Sheet>
      </section>

      {/* F. Why RenewBrick — operating principles as a specification */}
      <section aria-labelledby="why-title" className="bg-white py-20 md:py-28">
        <Sheet className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionLabel number="04">Why RenewBrick</SectionLabel>
            <h2 id="why-title" className="display mt-5 text-display-md">
              How we work, written down.
            </h2>
            <p className="mt-5 max-w-md text-slate">
              These are the principles every RenewBrick job follows. We would rather show you how a project is run than
              ask you to take our word for it.
            </p>
          </div>
          <ol className="lg:col-span-7">
            {principles.map((p, i) => (
              <li key={p.title} className="grid grid-cols-[3.5rem_1fr] gap-4 border-t border-grey-line py-6 last:border-b">
                <span className="label pt-1.5 tabular-nums text-gold-ink">4.{i + 1}</span>
                <div>
                  <h3 className="text-xl font-semibold">{p.title}</h3>
                  <p className="mt-2 text-slate">{p.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Sheet>
      </section>

      {/* H. Locations */}
      <section aria-labelledby="locations-title" className="bg-navy-deep py-20 text-white md:py-28">
        <Sheet>
          <SectionLabel number="05" tone="light">
            Where we work
          </SectionLabel>
          <h2 id="locations-title" className="sr-only">
            Service locations
          </h2>
          <div className="mt-10 grid border-t border-navy-line md:grid-cols-2">
            {locations.map((l, i) => (
              <Link
                key={l.slug}
                href={`/locations/${l.slug}`}
                className={`group flex flex-col justify-between gap-10 border-b border-navy-line py-10 transition-colors hover:bg-navy md:min-h-80 md:p-10 ${
                  i === 0 ? "md:border-r md:pl-0 hover:md:pl-10" : ""
                } transition-[padding,background-color] duration-300`}
              >
                <div>
                  <p className="label text-gold">
                    {l.state} · {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="display mt-4 text-display-lg">{l.city}</p>
                  <p className="mt-4 max-w-sm text-mist">{l.summary}</p>
                </div>
                <span className="inline-flex items-center gap-3 font-semibold text-gold-soft">
                  Renovation and property care in {l.city}
                  <Arrow />
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-8 max-w-2xl text-sm text-mist">
            Coverage within each city is confirmed when you enquire. Owners elsewhere are welcome to enquire about a property
            in either city.
          </p>
        </Sheet>
      </section>

      {/* I. FAQ */}
      <section aria-labelledby="faq-title" className="bg-white py-20 md:py-28">
        <Sheet className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionLabel number="06">Questions</SectionLabel>
            <h2 id="faq-title" className="display mt-5 text-display-md">
              Before you enquire.
            </h2>
            <Link href="/faq" className="mt-6 inline-flex min-h-11 items-center gap-3 font-semibold text-navy">
              <span className="draw-link">All questions and answers</span>
              <Arrow />
            </Link>
          </div>
          <div className="lg:col-span-8">
            <FaqList items={faqsFor({ ids: homeFaqIds })} />
          </div>
        </Sheet>
      </section>

      {/* J. Final enquiry */}
      <EnquiryBand />
    </>
  );
}
