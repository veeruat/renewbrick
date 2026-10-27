import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { ServiceSlug } from "@/content/services";
import { inspectionLink } from "@/lib/contact";
import { jsonLdString } from "@/lib/seo";

export function Sheet({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`mx-auto w-full max-w-sheet px-gutter ${className}`}>{children}</div>;
}

type ButtonVariant = "gold" | "navy" | "outline-light" | "outline-dark";

const buttonStyles: Record<ButtonVariant, string> = {
  gold: "bg-gold text-navy hover:bg-gold-soft",
  navy: "bg-navy text-white hover:bg-navy-deep",
  "outline-light": "border border-white/40 text-white hover:border-gold hover:text-gold-soft",
  "outline-dark": "border border-navy/30 text-navy hover:border-navy hover:bg-navy hover:text-white",
};

const buttonBase =
  "group inline-flex min-h-12 items-center justify-center gap-3 px-6 py-3 text-[0.95rem] font-semibold tracking-[0.01em] transition-colors duration-200";

export function ButtonLink({
  variant = "gold",
  className = "",
  children,
  arrow = true,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; arrow?: boolean }) {
  return (
    <Link className={`${buttonBase} ${buttonStyles[variant]} ${className}`} {...props}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}

/** External contact links (tel:, wa.me) — plain anchors. */
export function ButtonAnchor({
  variant = "gold",
  className = "",
  children,
  ...props
}: ComponentProps<"a"> & { variant?: ButtonVariant }) {
  return (
    <a className={`${buttonBase} ${buttonStyles[variant]} ${className}`} {...props}>
      {children}
    </a>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 10"
      className={`h-2.5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M0 5h18M14 1l4 4-4 4" />
    </svg>
  );
}

/**
 * Section number + title in the drawing-set convention:
 *   02 ——— HOW RENEWBRICK WORKS
 */
export function SectionLabel({
  number,
  children,
  tone = "dark",
  className = "",
}: {
  number?: string;
  children: ReactNode;
  tone?: "dark" | "light";
  className?: string;
}) {
  const color = tone === "light" ? "text-gold" : "text-gold-ink";
  const rule = tone === "light" ? "bg-gold/60" : "bg-gold";
  return (
    <p className={`label flex items-center gap-3 ${color} ${className}`}>
      {number && <span className="tabular-nums">{number}</span>}
      {number && <span aria-hidden="true" className={`h-px w-10 ${rule}`} />}
      <span>{children}</span>
    </p>
  );
}

export function Caption({ children, tone = "dark" }: { children: ReactNode; tone?: "dark" | "light" }) {
  return (
    <p className={`label mt-3 flex gap-2 font-medium normal-case tracking-[0.04em] ${tone === "light" ? "text-mist" : "text-slate"}`}>
      {children}
    </p>
  );
}

export function AvailabilityTag({ planned, tone = "dark" }: { planned: boolean; tone?: "dark" | "light" }) {
  const light = tone === "light";
  return planned ? (
    <span className={`label inline-flex items-center gap-2 border px-2 py-1 ${light ? "border-gold/60 text-gold-soft" : "border-current text-gold-ink"}`}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full border border-current" />
      Planned — not yet bookable
    </span>
  ) : (
    <span className={`label inline-flex items-center gap-2 border px-2 py-1 ${light ? "border-white/40 text-white" : "border-current text-navy"}`}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gold" />
      Available
    </span>
  );
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />;
}

export function Breadcrumbs({ items, tone = "light" }: { items: { name: string; path?: string }[]; tone?: "light" | "dark" }) {
  const muted = tone === "light" ? "text-mist" : "text-slate";
  return (
    <nav aria-label="Breadcrumb">
      <ol className={`label flex flex-wrap items-center gap-2 font-medium ${muted}`}>
        {items.map((item, i) => (
          <li key={item.name} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.path ? (
              <Link href={item.path} className={`draw-link ${tone === "light" ? "hover:text-white" : "hover:text-navy"}`}>
                {item.name}
              </Link>
            ) : (
              <span aria-current="page" className={tone === "light" ? "text-white" : "text-navy"}>
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * "Request a Site Inspection" — opens WhatsApp with a prefilled message, or a
 * phone call, or the contact page while no verified number is configured.
 */
export function InspectionButton({
  service,
  city,
  variant = "gold",
  className = "",
  children = "Request a Site Inspection",
}: {
  service?: ServiceSlug;
  city?: string;
  variant?: ButtonVariant;
  className?: string;
  children?: ReactNode;
}) {
  const link = inspectionLink(service, city);
  if (link.channel === "page") {
    return (
      <ButtonLink href={link.href} variant={variant} className={className}>
        {children}
      </ButtonLink>
    );
  }
  return (
    <ButtonAnchor
      href={link.href}
      variant={variant}
      className={className}
      {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
      <Arrow />
    </ButtonAnchor>
  );
}

/** Text-link version of the inspection action. */
export function InspectionTextLink({ service, className = "", children }: { service?: ServiceSlug; className?: string; children: ReactNode }) {
  const link = inspectionLink(service);
  return link.channel === "page" ? (
    <Link href={link.href} className={className}>
      {children}
    </Link>
  ) : (
    <a href={link.href} className={className} {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {children}
    </a>
  );
}
