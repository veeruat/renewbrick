import Link from "next/link";
import { locations } from "@/content/locations";
import { servicePath, services } from "@/content/services";
import { inspectionLink } from "@/lib/contact";
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
      <div className="mx-auto flex h-24 max-w-sheet items-center justify-between gap-4 px-gutter">
        <Link href="/" className="flex min-h-11 items-center" aria-label="RenewBrick — home">
          <Wordmark priority className="h-10 sm:h-12 lg:h-14" />
        </Link>
        <NavMenu groups={navGroups} cta={{ label: "Request a Site Inspection", ...inspectionLink() }} />
      </div>
    </header>
  );
}
