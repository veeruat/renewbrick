import { processCaveat, processStages } from "@/content/process";
import type { ServiceSlug } from "@/content/services";
import { business } from "@/content/site";
import { inspectionLink, telHref } from "@/lib/contact";
import { BrickCourse } from "./drawings";
import { ButtonAnchor, InspectionButton, SectionLabel, Sheet } from "./ui";

/** Accordion built on <details>, so it works without JavaScript. */
export function FaqList({ items, tone = "dark" }: { items: { question: string; answer: string }[]; tone?: "dark" | "light" }) {
  const light = tone === "light";
  return (
    <div className={`border-t ${light ? "border-navy-line" : "border-grey-line"}`}>
      {items.map((f) => (
        <details key={f.question} className={`group border-b ${light ? "border-navy-line" : "border-grey-line"}`}>
          <summary className="flex min-h-14 items-start justify-between gap-6 py-5">
            <h3 className={`text-lg font-medium leading-snug ${light ? "text-white" : "text-navy"}`}>{f.question}</h3>
            <span
              aria-hidden="true"
              className={`relative mt-1.5 h-4 w-4 shrink-0 ${light ? "text-gold" : "text-gold-ink"} before:absolute before:left-0 before:top-1/2 before:h-px before:w-4 before:bg-current after:absolute after:left-1/2 after:top-0 after:h-4 after:w-px after:bg-current after:transition-transform group-open:after:scale-y-0`}
            />
          </summary>
          <p className={`max-w-prose pb-6 pr-10 ${light ? "text-mist" : "text-slate"}`}>{f.answer}</p>
        </details>
      ))}
    </div>
  );
}

/** The seven-stage sequence: horizontal drawing line on desktop, vertical on mobile. */
export function ProcessSequence({ tone = "light", vertical = false }: { tone?: "light" | "dark"; vertical?: boolean }) {
  const light = tone === "light";
  // Horizontal layout applies from lg upwards unless the sequence is forced vertical.
  const h = (cls: string) => (vertical ? "" : cls);
  return (
    <div>
      <ol className={`relative grid gap-0 ${h("lg:grid-cols-7")}`}>
        {processStages.map((stage, i) => (
          <li key={stage.id} className={`relative flex gap-5 pb-8 ${h("lg:block lg:pb-0 lg:pr-5")}`}>
            {/* connector */}
            <span
              aria-hidden="true"
              className={`absolute left-[15px] top-8 h-full w-px ${h("lg:left-8 lg:top-[15px] lg:h-px lg:w-full")} ${
                i === processStages.length - 1 ? "hidden" : ""
              } ${light ? "bg-navy-line" : "bg-grey-line"}`}
            />
            <span
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center text-xs font-semibold tabular-nums ${
                stage.gate
                  ? "bg-gold text-navy"
                  : light
                    ? "border border-mist/60 bg-navy text-white"
                    : "border border-navy/40 bg-white text-navy"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className={h("lg:mt-6")}>
              <h3 className={`text-lg font-semibold ${light ? "text-white" : "text-navy"}`}>{stage.title}</h3>
              {stage.gate && (
                <p className={`label mt-1 ${light ? "text-gold" : "text-gold-ink"}`}>Nothing proceeds without it</p>
              )}
              <p className={`mt-2 text-[0.95rem] leading-relaxed ${light ? "text-mist" : "text-slate"}`}>{stage.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className={`mt-10 max-w-2xl border-l-2 border-gold pl-5 ${light ? "text-mist" : "text-slate"}`}>{processCaveat}</p>
    </div>
  );
}

/** Closing invitation used at the foot of most pages. */
export function EnquiryBand({
  service,
  title = "Tell us about your property.",
  body = "Message us on WhatsApp with a few details — photos help — or call. If an inspection makes sense, we will agree a time with you; nothing is booked until you confirm.",
  ctaLabel = "Request a Site Inspection",
  city,
}: {
  service?: ServiceSlug;
  title?: string;
  body?: string;
  ctaLabel?: string;
  city?: string;
}) {
  const tel = telHref();
  const viaWhatsApp = inspectionLink(service, city).channel === "whatsapp";
  return (
    <section aria-labelledby="enquiry-band-title" className="relative overflow-hidden bg-navy text-white">
      <div aria-hidden="true" className="bond absolute inset-0 opacity-[0.07]" />
      <Sheet className="relative grid gap-10 py-20 md:py-28 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SectionLabel tone="light">Next step</SectionLabel>
          <h2 id="enquiry-band-title" className="display mt-5 text-display-lg">
            {title}
          </h2>
        </div>
        <div className="flex flex-col justify-end lg:col-span-5">
          <p className="text-lead text-mist">{body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <InspectionButton service={service} city={city}>
              {ctaLabel}
            </InspectionButton>
            {tel && viaWhatsApp && (
              <ButtonAnchor variant="outline-light" href={tel}>
                Call {business.name}
              </ButtonAnchor>
            )}
          </div>
        </div>
      </Sheet>
    </section>
  );
}

export function SectionDivider({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <div aria-hidden="true" className="flex items-center gap-4">
      <span className={`h-px flex-1 ${tone === "light" ? "bg-navy-line" : "bg-grey-line"}`} />
      <BrickCourse className={`h-3.5 w-30 ${tone === "light" ? "text-gold/60" : "text-gold"}`} />
      <span className={`h-px flex-1 ${tone === "light" ? "bg-navy-line" : "bg-grey-line"}`} />
    </div>
  );
}
