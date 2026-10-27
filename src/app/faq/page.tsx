import { EnquiryBand, FaqList } from "@/components/sections";
import { Breadcrumbs, JsonLd, Sheet } from "@/components/ui";
import { faqs, faqTopics, type FaqTopic } from "@/content/faqs";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Frequently Asked Questions — Inspections, Estimates and Work",
  description:
    "Answers about RenewBrick site inspections, estimates, written approvals, materials, timelines, maintenance, rental preparation, locations and quality checks.",
  path: "/faq",
});

export default function FaqPage() {
  const topics = Object.entries(faqTopics) as [FaqTopic, string][];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "FAQ", path: "/faq" }])} />
      <section aria-labelledby="faq-title" className="bg-navy text-white">
        <Sheet className="pb-14 pt-10 md:pb-20">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "FAQ" }]} />
          <p className="label mt-12 text-gold">Questions &amp; answers</p>
          <h1 id="faq-title" className="display mt-5 max-w-4xl text-display-lg">
            What owners ask before they enquire.
          </h1>
          <nav aria-label="FAQ topics" className="mt-10">
            <ul className="flex flex-wrap gap-2">
              {topics.map(([key, label]) => (
                <li key={key}>
                  <a href={`#${key}`} className="inline-flex min-h-11 items-center border border-navy-line px-4 text-[0.95rem] text-white transition-colors hover:border-gold hover:text-gold-soft">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Sheet>
      </section>

      <section className="bg-white py-16 md:py-24">
        <Sheet className="space-y-16">
          {topics.map(([key, label], i) => (
            <div key={key} id={key} className="grid scroll-mt-32 gap-8 lg:grid-cols-12">
              <h2 className="lg:col-span-4">
                <span className="label block tabular-nums text-gold-ink">{String(i + 1).padStart(2, "0")}</span>
                <span className="display mt-3 block text-display-sm">{label}</span>
              </h2>
              <div className="lg:col-span-8">
                <FaqList items={faqs.filter((f) => f.topic === key)} />
              </div>
            </div>
          ))}
        </Sheet>
      </section>

      <EnquiryBand title="Still have a question?" body="Send us an enquiry with your question and a few details about the property. We will get back to you." />
    </>
  );
}
