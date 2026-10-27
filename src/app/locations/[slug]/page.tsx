import Link from "next/link";
import { notFound } from "next/navigation";
import { EnquiryBand, FaqList } from "@/components/sections";
import { Arrow, Breadcrumbs, InspectionButton, JsonLd, SectionLabel, Sheet } from "@/components/ui";
import { getLocation, locations } from "@/content/locations";
import { getService, servicePath, services } from "@/content/services";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

// Only the cities in src/content/locations.ts are exported; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return locations.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/locations/[slug]">) {
  const location = getLocation((await params).slug);
  if (!location) return {};
  return pageMetadata({
    title: location.metaTitle,
    description: location.metaDescription,
    path: `/locations/${location.slug}`,
  });
}

export default async function LocationPage({ params }: PageProps<"/locations/[slug]">) {
  const location = getLocation((await params).slug);
  if (!location) notFound();
  const others = locations.filter((l) => l.slug !== location.slug);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: location.city, path: `/locations/${location.slug}` },
        ])}
      />

      <section aria-labelledby="loc-title" className="relative overflow-hidden bg-navy text-white">
        <div aria-hidden="true" className="bond absolute inset-0 opacity-[0.05]" />
        <Sheet className="relative pb-16 pt-10 md:pb-24">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Locations" }, { name: location.city }]} />
          <div className="mt-12 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="label text-gold">
                {location.city}, {location.state}
              </p>
              <h1 id="loc-title" className="display mt-5 text-display-lg">
                {location.headline}
              </h1>
              <p className="mt-6 max-w-2xl text-lead text-mist">{location.intro}</p>
              <div className="mt-10">
                <InspectionButton city={location.city}>Request a Site Inspection in {location.city}</InspectionButton>
              </div>
            </div>
            <p
              aria-hidden="true"
              className="display hidden self-end text-right text-[clamp(5rem,10vw,9rem)] leading-none text-white/10 lg:col-span-4 lg:block"
            >
              {location.city.slice(0, 3).toUpperCase()}
            </p>
          </div>
        </Sheet>
      </section>

      {/* Situations — mapped to services */}
      <section aria-labelledby="sit-title" className="bg-white py-20 md:py-24">
        <Sheet>
          <SectionLabel number="01">In {location.city}</SectionLabel>
          <h2 id="sit-title" className="display mt-5 max-w-3xl text-display-md">
            What owners in {location.city} ask us to help with.
          </h2>
          <ul className="mt-12 border-t border-navy">
            {location.situations.map((s) => {
              const svc = getService(s.service);
              return (
                <li key={s.title} className="grid gap-3 border-b border-grey-line py-7 md:grid-cols-12 md:gap-8">
                  <h3 className="text-xl font-semibold md:col-span-4">{s.title}</h3>
                  <p className="text-slate md:col-span-5">{s.text}</p>
                  <Link href={servicePath(svc.slug)} className="inline-flex min-h-11 items-start gap-3 font-semibold text-navy md:col-span-3 md:justify-end">
                    <span className="draw-link">{svc.name}</span>
                    <Arrow className="mt-2" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Sheet>
      </section>

      {/* Local considerations */}
      <section aria-labelledby="cons-title" className="bg-grey py-20 md:py-24">
        <Sheet className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionLabel number="02">Planning notes</SectionLabel>
            <h2 id="cons-title" className="display mt-5 text-display-md">
              Worth knowing before work starts.
            </h2>
          </div>
          <ol className="grid gap-px bg-grey-line lg:col-span-8">
            {location.considerations.map((c, i) => (
              <li key={c.title} className="grid grid-cols-[3rem_1fr] gap-4 bg-grey py-6">
                <span className="label pt-1.5 tabular-nums text-gold-ink">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-lg font-semibold">{c.title}</h3>
                  <p className="mt-2 text-slate">{c.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Sheet>
      </section>

      {/* Services available + coverage */}
      <section aria-labelledby="svc-title" className="bg-white py-20 md:py-24">
        <Sheet className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionLabel number="03">Services and coverage</SectionLabel>
            <h2 id="svc-title" className="display mt-5 text-display-md">
              Services in {location.city}.
            </h2>
            <p className="mt-5 text-slate">{location.coverageNote}</p>
          </div>
          <ul className="lg:col-span-6 lg:col-start-7">
            {services.map((s) => (
              <li key={s.slug} className="border-t border-grey-line last:border-b">
                <Link href={servicePath(s.slug)} className="group flex min-h-16 items-center justify-between gap-4 py-4">
                  <span className="text-lg font-medium">
                    <span className="draw-link">{s.name}</span>
                    {s.availability === "planned" && <span className="label ml-3 text-gold-ink">Planned</span>}
                  </span>
                  <Arrow className="text-gold-ink" />
                </Link>
              </li>
            ))}
          </ul>
        </Sheet>
      </section>

      <section aria-labelledby="faq-title" className="bg-grey py-20 md:py-24">
        <Sheet className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionLabel number="04">Questions</SectionLabel>
            <h2 id="faq-title" className="display mt-5 text-display-md">
              {location.city} questions.
            </h2>
            {others.map((o) => (
              <Link key={o.slug} href={`/locations/${o.slug}`} className="mt-6 inline-flex min-h-11 items-center gap-3 font-semibold text-navy">
                <span className="draw-link">We also work in {o.city}</span>
                <Arrow />
              </Link>
            ))}
          </div>
          <div className="lg:col-span-8">
            <FaqList items={location.faqs} />
          </div>
        </Sheet>
      </section>

      <EnquiryBand title={`Property in ${location.city}?`} city={location.city} />
    </>
  );
}
