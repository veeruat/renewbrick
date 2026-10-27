import type { ReactNode } from "react";
import { servicePath, type Service } from "@/content/services";
import { absoluteUrl, business } from "@/content/site";
import { inspectionHref, whatsappHref } from "@/lib/contact";
import { breadcrumbJsonLd } from "@/lib/seo";
import { AvailabilityTag, Breadcrumbs, ButtonAnchor, ButtonLink, Caption, JsonLd, SectionLabel, Sheet } from "./ui";

/** Hero shared by all service pages; the drawing and copy differ per service. */
export function ServiceHero({ service, drawing, figure }: { service: Service; drawing: ReactNode; figure: string }) {
  const planned = service.availability === "planned";
  const wa = whatsappHref(service.whatsappMessage);
  return (
    <section aria-labelledby="service-title" className="relative overflow-hidden bg-navy text-white">
      <Sheet className="grid gap-12 pb-16 pt-10 md:pb-20 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Services" }, { name: service.name }]} />
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <p className="label text-gold">
              Service {service.number} — {service.name}
            </p>
            <AvailabilityTag planned={planned} tone="light" />
          </div>
          <h1 id="service-title" className="display mt-5 text-display-lg">
            {service.headline}
          </h1>
          <p className="mt-6 max-w-2xl text-lead text-mist">{service.intro}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink href={inspectionHref(service.slug)}>{planned ? "Register Interest" : "Request a Site Inspection"}</ButtonLink>
            {wa && (
              <ButtonAnchor variant="outline-light" href={wa} target="_blank" rel="noopener noreferrer">
                Discuss on WhatsApp
              </ButtonAnchor>
            )}
          </div>
        </div>
        <figure className="self-end lg:col-span-5">
          <div className="border border-navy-line p-4 text-white/80 sm:p-6">{drawing}</div>
          <figcaption>
            <Caption tone="light">
              <span className="text-gold">{figure}</span> Illustration — not a record of RenewBrick work.
            </Caption>
          </figcaption>
        </figure>
      </Sheet>
    </section>
  );
}

export function ServiceJsonLd({ service }: { service: Service }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.name,
          serviceType: service.name,
          description: service.metaDescription,
          url: absoluteUrl(servicePath(service.slug)),
          provider: { "@id": `${absoluteUrl("/")}#organization`, name: business.name },
          areaServed: business.serviceAreas.map((city) => ({ "@type": "City", name: city })),
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: service.name, path: servicePath(service.slug) },
        ])}
      />
    </>
  );
}

export function SectionIntro({
  number,
  label,
  title,
  id,
  children,
  tone = "dark",
}: {
  number: string;
  label: string;
  title: string;
  id: string;
  children?: ReactNode;
  tone?: "dark" | "light";
}) {
  return (
    <div>
      <SectionLabel number={number} tone={tone}>
        {label}
      </SectionLabel>
      <h2 id={id} className="display mt-5 text-display-md">
        {title}
      </h2>
      {children && <div className={`mt-5 max-w-xl ${tone === "light" ? "text-mist" : "text-slate"}`}>{children}</div>}
    </div>
  );
}

export function AudienceList({ items, tone = "dark" }: { items: { title: string; text: string }[]; tone?: "dark" | "light" }) {
  return (
    <ul className="grid gap-px sm:grid-cols-2">
      {items.map((a) => (
        <li key={a.title} className={`border-t py-5 sm:pr-6 ${tone === "light" ? "border-navy-line" : "border-grey-line"}`}>
          <h3 className="font-semibold">{a.title}</h3>
          <p className={`mt-1 text-[0.95rem] ${tone === "light" ? "text-mist" : "text-slate"}`}>{a.text}</p>
        </li>
      ))}
    </ul>
  );
}

export function TickList({ items, marker = "rule" }: { items: string[]; marker?: "rule" | "number" }) {
  return (
    <ol className="space-y-3">
      {items.map((item, i) => (
        <li key={item} className="flex gap-4">
          {marker === "number" ? (
            <span className="label w-6 shrink-0 pt-1 tabular-nums text-gold-ink">{String(i + 1).padStart(2, "0")}</span>
          ) : (
            <span aria-hidden="true" className="mt-[0.8em] h-px w-4 shrink-0 bg-gold-ink" />
          )}
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

export function DependencyNotes({
  items,
  single = false,
  surface = "white",
}: {
  items: { title: string; text: string }[];
  single?: boolean;
  surface?: "white" | "grey";
}) {
  return (
    <div className={`grid gap-6 ${single ? "" : "md:grid-cols-2"}`}>
      {items.map((d) => (
        <div key={d.title} className={`border-l-2 border-gold p-6 ${surface === "grey" ? "bg-grey" : "bg-white"}`}>
          <h3 className="font-semibold">{d.title}</h3>
          <p className="mt-2 text-[0.95rem] text-slate">{d.text}</p>
        </div>
      ))}
    </div>
  );
}
