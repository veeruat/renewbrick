import Link from "next/link";
import { ElevationDrawing } from "@/components/drawings";
import { EnquiryBand, ProcessSequence } from "@/components/sections";
import { Arrow, Breadcrumbs, Caption, JsonLd, SectionLabel, Sheet } from "@/components/ui";
import { locations } from "@/content/locations";
import { business } from "@/content/site";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About Us — How We Plan and Coordinate Property Work",
  description:
    "RenewBrick is a property transformation and care company in Hyderabad and Warangal. Learn how we inspect, scope, coordinate execution partners and check work before handover.",
  path: "/about",
});

const model = [
  {
    title: "We take responsibility for the plan",
    text: "RenewBrick inspects the property, writes the scope, prepares the estimate and agrees it with you before anything starts.",
  },
  {
    title: "Specialists carry out the work",
    text: "Execution partners and specialist vendors — independent businesses selected for the trades involved — carry out the work. They are not RenewBrick employees; we coordinate them on your behalf.",
  },
  {
    title: "You stay in control of decisions",
    text: "Changes to scope or cost are explained, estimated and approved in writing. You are not asked to approve anything you have not seen.",
  },
  {
    title: "The work is checked before handover",
    text: "Completed work is checked against the approved scope, snags are listed and closed, and the property is handed back with a record of what was done.",
  },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])} />

      <section aria-labelledby="about-title" className="bg-navy text-white">
        <Sheet className="grid gap-12 pb-16 pt-10 md:pb-24 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "About" }]} />
            <p className="label mt-12 text-gold">About {business.name}</p>
            <h1 id="about-title" className="display mt-5 text-display-lg">
              Thoughtful transformation. <em className="text-gold">Clearly managed.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-lead text-mist">
              RenewBrick is a property transformation and care company working in Hyderabad and Warangal. We help owners
              improve, prepare, maintain and look after their properties — with the scope defined up front, the right
              specialists coordinated, and every decision documented.
            </p>
          </div>
          <figure className="self-end lg:col-span-4 lg:col-start-9">
            <ElevationDrawing className="w-full text-white/70" />
            <figcaption>
              <Caption tone="light">
                <span className="text-gold">Fig. 00</span> Illustration — not a RenewBrick project.
              </Caption>
            </figcaption>
          </figure>
        </Sheet>
      </section>

      <section aria-labelledby="model-title" className="bg-white py-20 md:py-24">
        <Sheet className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionLabel number="01">The model</SectionLabel>
            <h2 id="model-title" className="display mt-5 text-display-md">
              What RenewBrick does — and who does what.
            </h2>
          </div>
          <ol className="lg:col-span-7 lg:col-start-6">
            {model.map((m, i) => (
              <li key={m.title} className="grid grid-cols-[3.5rem_1fr] gap-4 border-t border-grey-line py-7 last:border-b">
                <span className="display text-display-sm leading-none text-gold-ink">{i + 1}</span>
                <div>
                  <h3 className="text-xl font-semibold">{m.title}</h3>
                  <p className="mt-2 text-slate">{m.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Sheet>
      </section>

      <section id="how-we-work" aria-labelledby="process-title" className="bg-navy py-20 text-white md:py-24">
        <Sheet>
          <SectionLabel number="02" tone="light">
            How we work
          </SectionLabel>
          <h2 id="process-title" className="display mt-5 max-w-3xl text-display-md">
            The same seven stages on every job.
          </h2>
          <div className="mt-14">
            <ProcessSequence />
          </div>
        </Sheet>
      </section>

      <section aria-labelledby="focus-title" className="bg-grey py-20 md:py-24">
        <Sheet className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionLabel number="03">Geographic focus</SectionLabel>
            <h2 id="focus-title" className="display mt-5 text-display-md">
              Two cities, worked properly.
            </h2>
            <p className="mt-5 text-slate">
              We concentrate on Hyderabad and Warangal so that inspections, coordination and quality checks stay close to the
              work. Owners who live elsewhere can still enquire about a property in either city.
            </p>
          </div>
          <ul className="grid gap-px bg-grey-line sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            {locations.map((l) => (
              <li key={l.slug} className="bg-white">
                <Link href={`/locations/${l.slug}`} className="group flex h-full flex-col justify-between gap-8 p-7">
                  <span className="display text-display-sm">{l.city}</span>
                  <span className="inline-flex items-center gap-3 font-semibold text-navy">
                    <span className="draw-link">View {l.city}</span>
                    <Arrow />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Sheet>
      </section>

      {business.legalName && (
        <section aria-labelledby="entity-title" className="bg-white py-14">
          <Sheet>
            <h2 id="entity-title" className="label text-gold-ink">
              Legal entity
            </h2>
            <p className="mt-3 text-slate">
              Services are contracted and invoiced by <strong className="text-navy">{business.legalName}</strong>.
            </p>
          </Sheet>
        </section>
      )}

      <EnquiryBand />
    </>
  );
}
