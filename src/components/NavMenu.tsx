"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { ContactLink } from "@/lib/contact";

export type NavGroup = {
  label: string;
  href?: string;
  items?: { label: string; href: string; note?: string }[];
};

/**
 * Desktop: inline links with disclosure dropdowns (button + list, Escape and
 * outside click close). Mobile: a full-height panel toggled by a menu button.
 * The links themselves are also rendered server-side in the footer, so all
 * routes stay crawlable without JavaScript.
 */
export function NavMenu({ groups, cta }: { groups: NavGroup[]; cta: ContactLink & { label: string } }) {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const mobileButton = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const closeAll = useCallback(() => {
    setOpen(null);
    setMobileOpen(false);
  }, []);

  // Close menus when the route changes (pages stay mounted under Activity).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (mobileOpen) mobileButton.current?.focus();
      closeAll();
    }
    function onClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [mobileOpen, closeAll]);

  useEffect(() => {
    document.documentElement.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href?: string, items?: NavGroup["items"]) =>
    (href && href !== "/" && !href.includes("#") && pathname.startsWith(href)) ||
    items?.some((i) => pathname.startsWith(i.href));

  return (
    // Any link click closes the menus, including same-page anchors like /#how-we-work.
    <div
      ref={navRef}
      className="flex items-center gap-2"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a")) closeAll();
      }}
    >
      {/* Desktop */}
      <nav aria-label="Main" className="hidden lg:block">
        <ul className="flex items-center gap-1">
          {groups.map((g) => (
            <li key={g.label} className="relative">
              {g.items ? (
                <>
                  <button
                    type="button"
                    aria-expanded={open === g.label}
                    aria-controls={`${panelId}-${g.label}`}
                    onClick={() => setOpen(open === g.label ? null : g.label)}
                    className={`flex min-h-11 items-center gap-1.5 px-3 text-[0.95rem] transition-colors hover:text-gold-ink ${
                      isActive(g.href, g.items) ? "text-gold-ink" : "text-navy"
                    }`}
                  >
                    {g.label}
                    <svg aria-hidden="true" viewBox="0 0 10 6" className={`h-1.5 w-2.5 transition-transform ${open === g.label ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M1 1l4 4 4-4" />
                    </svg>
                  </button>
                  <div
                    id={`${panelId}-${g.label}`}
                    hidden={open !== g.label}
                    className="absolute left-0 top-full z-50 mt-3 w-80 border border-grey-line border-t-2 border-t-gold bg-white p-2 shadow-xl"
                  >
                    <ul>
                      {g.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            aria-current={pathname === item.href ? "page" : undefined}
                            className="block px-4 py-3 text-navy transition-colors hover:bg-grey"
                          >
                            <span className="block font-medium">{item.label}</span>
                            {item.note && <span className="label mt-1 block font-medium text-gold-ink">{item.note}</span>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <Link
                  href={g.href!}
                  aria-current={pathname === g.href ? "page" : undefined}
                  className={`flex min-h-11 items-center px-3 text-[0.95rem] transition-colors hover:text-gold-ink ${
                    isActive(g.href) ? "text-gold-ink" : "text-navy"
                  }`}
                >
                  {g.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <CtaLink cta={cta} className="hidden min-h-11 items-center bg-gold px-5 text-[0.95rem] font-semibold text-navy transition-colors hover:bg-gold-soft sm:inline-flex">
        {cta.label}
      </CtaLink>

      {/* Mobile */}
      <button
        ref={mobileButton}
        type="button"
        aria-expanded={mobileOpen}
        aria-controls={`${panelId}-mobile`}
        onClick={() => setMobileOpen((v) => !v)}
        className="flex min-h-11 min-w-11 items-center justify-center gap-2 px-2 text-navy lg:hidden"
      >
        <span className="label">Menu</span>
        <svg aria-hidden="true" viewBox="0 0 20 14" className="h-3.5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          {mobileOpen ? <path d="M3 1l14 12M17 1L3 13" /> : <path d="M0 1h20M0 7h20M6 13h14" />}
        </svg>
      </button>

      <div
        id={`${panelId}-mobile`}
        hidden={!mobileOpen}
        className="fixed inset-x-0 bottom-0 top-24 z-40 overflow-y-auto bg-navy px-gutter pb-10 pt-4 lg:hidden"
      >
        <nav aria-label="Mobile">
          <ul className="divide-y divide-navy-line border-b border-navy-line">
            {groups.map((g) => (
              <li key={g.label} className="py-4">
                {g.href && !g.items ? (
                  <Link href={g.href} className="display block py-1 text-[2rem] text-white">
                    {g.label}
                  </Link>
                ) : (
                  <>
                    <p className="label mb-2 text-gold">{g.label}</p>
                    <ul>
                      {g.items!.map((item) => (
                        <li key={item.href}>
                          <Link href={item.href} className="flex min-h-11 items-baseline justify-between gap-4 py-1 text-lg text-white">
                            {item.label}
                            {item.note && <span className="label shrink-0 text-gold">{item.note}</span>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <CtaLink cta={cta} className="mt-8 flex min-h-12 items-center justify-center bg-gold px-5 font-semibold text-navy">
          {cta.label}
        </CtaLink>
      </div>
    </div>
  );
}

function CtaLink({ cta, className, children }: { cta: ContactLink; className: string; children: ReactNode }) {
  if (cta.channel === "page") {
    return (
      <Link href={cta.href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={cta.href} className={className} {...(cta.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {children}
    </a>
  );
}
