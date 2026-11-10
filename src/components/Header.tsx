import Link from "next/link";
import { locations } from "@/content/locations";
import { servicePath, services } from "@/content/services";
import { business, serviceAreaList } from "@/content/site";
import { formatPhone, inspectionLink, telHref, whatsappGreeting, whatsappHref } from "@/lib/contact";
import { PhoneIcon, WhatsAppIcon } from "./icons";
import { NavMenu, type NavGroup } from "./NavMenu";
import { Wordmark } from "./Wordmark";

export const navGroups: NavGroup[] = [
  {
    label: "Services",
    items: services.map((s) => ({
      label: s.name,
      href: servicePath(s.slug),
      note: s.availability === "planned" ? "Planned" : undefined,
    })),
  },
  { label: "How We Work", href: "/#how-we-work" },
  {
    label: "Locations",
    items: locations.map((l) => ({ label: l.city, href: `/locations/${l.slug}` })),
  },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-grey-line bg-white">
      <ContactBar />
      <div className="mx-auto flex h-24 max-w-sheet items-center justify-between gap-4 px-gutter">
        <Link href="/" className="flex min-h-11 items-center" aria-label="RenewBrick — home">
          <Wordmark priority className="h-10 sm:h-12 lg:h-14" />
        </Link>
        <NavMenu groups={navGroups} cta={{ label: "Request a Site Inspection", ...inspectionLink() }} />
      </div>
    </header>
  );
}

/**
 * Slim navy bar above the main header row: service areas on the left (wide
 * screens), phone and WhatsApp on the right. Part of the sticky header, so the
 * number stays in view. Its height (h-10) is included in the header offsets:
 * NavMenu's mobile panel (top-[8.5rem]) and scroll-padding-top in globals.css.
 */
function ContactBar() {
  const tel = telHref();
  const wa = whatsappHref(whatsappGreeting);
  if (!tel && !wa) return null;
  const link = "inline-flex min-h-8 items-center gap-2 transition-colors hover:text-gold-soft";
  return (
    <div className="bg-navy-deep text-white">
      <div className="mx-auto flex h-10 max-w-sheet items-center justify-between gap-4 px-gutter text-[0.85rem]">
        <p className="label hidden text-[0.7rem] text-mist md:block">Serving {serviceAreaList().replace(" and ", " & ")}</p>
        <ul className="flex w-full items-center justify-between gap-5 sm:w-auto sm:justify-end" aria-label="Contact RenewBrick">
          {tel && (
            <li>
              <a href={tel} className={link}>
                <PhoneIcon className="h-3.5 w-3.5 text-gold" />
                <span className="sr-only">Call </span>
                <span className="font-semibold tabular-nums tracking-[0.02em]">{formatPhone(business.phone!)}</span>
              </a>
            </li>
          )}
          {tel && wa && (
            <li aria-hidden="true" className="hidden h-4 w-px bg-navy-line sm:block" />
          )}
          {wa && (
            <li>
              <a href={wa} target="_blank" rel="noopener noreferrer" className={link}>
                <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
                <span className="font-semibold">
                  WhatsApp<span className="hidden sm:inline"> us</span>
                </span>
                <span className="sr-only"> (opens WhatsApp)</span>
              </a>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
