import Link from "next/link";
import { legalStatus } from "@/content/legal";
import { locations } from "@/content/locations";
import { business, serviceAreaList } from "@/content/site";
import { servicePath, services } from "@/content/services";
import { formatPhone, mailHref, telHref, whatsappHref } from "@/lib/contact";
import { BrickCourse } from "./drawings";
import { Wordmark } from "./Wordmark";

/** Footer drawn as an architectural title block. */
export function Footer() {
  const tel = telHref();
  const wa = whatsappHref();
  const mail = mailHref();
  const hasContact = tel || wa || mail;

  return (
    <footer className="bg-navy-deep text-white">
      <div className="mx-auto max-w-sheet px-gutter pb-28 pt-16 lg:pb-12">
        <div className="grid gap-px border border-navy-line bg-navy-line md:grid-cols-2 lg:grid-cols-12">
          <div className="bg-navy-deep p-6 lg:col-span-4">
            <Wordmark tone="dark" className="h-12" />
            <p className="label mt-5 text-gold">{business.tagline}</p>
            <p className="mt-2 text-mist">{business.descriptor}</p>
            <p className="mt-6 max-w-xs text-sm text-mist">
              Serving {serviceAreaList()}. Work is carried out by execution partners
              and specialist vendors coordinated by RenewBrick.
            </p>
          </div>

          <FooterColumn title="Services" className="lg:col-span-3">
            {services.map((s) => (
              <FooterLink key={s.slug} href={servicePath(s.slug)}>
                {s.name}
                {s.availability === "planned" && <span className="label ml-2 text-gold">Planned</span>}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Company" className="lg:col-span-2">
            <FooterLink href="/about">About</FooterLink>
            <FooterLink href="/#how-we-work">How we work</FooterLink>
            <FooterLink href="/faq">FAQ</FooterLink>
            {locations.map((l) => (
              <FooterLink key={l.slug} href={`/locations/${l.slug}`}>
                {l.city}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Contact" className="lg:col-span-3">
            {tel && <FooterAnchor href={tel}>{formatPhone(business.phone!)}</FooterAnchor>}
            {wa && (
              <FooterAnchor href={wa} external>
                WhatsApp
              </FooterAnchor>
            )}
            {mail && <FooterAnchor href={mail}>{business.email}</FooterAnchor>}
            {!hasContact && <li className="text-sm text-mist">Contact details are being finalised.</li>}
            <FooterLink href="/contact">Request a site inspection</FooterLink>
          </FooterColumn>
        </div>

        <div className="mt-6 flex flex-col gap-4 text-sm text-mist md:flex-row md:items-center md:justify-between">
          <p>
            © {business.legalName ?? business.name}
            {business.address && <span className="block md:inline md:before:mx-2 md:before:content-['·']">{business.address}</span>}
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="draw-link hover:text-white">
              Privacy policy{!legalStatus.privacy.approved && " (draft)"}
            </Link>
            <Link href="/terms" className="draw-link hover:text-white">
              Terms{!legalStatus.terms.approved && " (draft)"}
            </Link>
            <BrickCourse className="hidden h-3.5 w-30 text-gold/50 md:block" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, className = "", children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-navy-deep p-6 ${className}`}>
      <h2 className="label mb-4 text-gold">{title}</h2>
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="inline-flex min-h-9 items-center text-white/90 transition-colors hover:text-gold-soft">
        {children}
      </Link>
    </li>
  );
}

function FooterAnchor({ href, external, children }: { href: string; external?: boolean; children: React.ReactNode }) {
  return (
    <li>
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="inline-flex min-h-9 items-center text-white/90 transition-colors hover:text-gold-soft"
      >
        {children}
      </a>
    </li>
  );
}
