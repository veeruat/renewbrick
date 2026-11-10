"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ContactLink } from "@/lib/contact";
import { PhoneIcon, WhatsAppIcon } from "./icons";

/**
 * Compact action bar fixed to the bottom of small screens. The footer reserves
 * space for it (pb-28), so it never covers the last content on the page.
 * Hidden on /contact, where the contact options are the page itself.
 */
export function MobileActionBar({ inspection, tel, wa }: { inspection: ContactLink; tel: string | null; wa: string | null }) {
  const pathname = usePathname();
  if (pathname.startsWith("/contact")) return null;
  const primary = "flex min-h-12 flex-1 items-center justify-center bg-gold px-4 text-[0.95rem] font-semibold text-navy";
  const secondary = "flex min-h-12 min-w-12 items-center justify-center border border-navy/30 text-navy";
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-grey-line bg-white px-3 py-2 lg:hidden print:hidden">
      <div className="mx-auto flex max-w-xl gap-2">
        {inspection.channel === "page" ? (
          <Link href={inspection.href} className={primary}>
            Request a Site Inspection
          </Link>
        ) : (
          <a href={inspection.href} className={primary} {...(inspection.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            Request a Site Inspection
          </a>
        )}
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp RenewBrick" className={secondary}>
            <WhatsAppIcon className="h-5 w-5 text-[#128C7E]" />
          </a>
        )}
        {tel && (
          <a href={tel} aria-label="Call RenewBrick" className={secondary}>
            <PhoneIcon className="h-5 w-5" />
          </a>
        )}
      </div>
    </div>
  );
}
