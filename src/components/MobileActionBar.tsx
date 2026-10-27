"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ContactLink } from "@/lib/contact";

/**
 * Compact action bar fixed to the bottom of small screens. The footer reserves
 * space for it (pb-28), so it never covers the last content on the page.
 * Hidden on /contact, where the contact options are the page itself.
 */
export function MobileActionBar({ inspection, tel }: { inspection: ContactLink; tel: string | null }) {
  const pathname = usePathname();
  if (pathname.startsWith("/contact")) return null;
  const primary = "flex min-h-12 flex-1 items-center justify-center bg-gold px-4 text-[0.95rem] font-semibold text-navy";
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
        {tel && inspection.channel !== "phone" && (
          <a href={tel} className="flex min-h-12 min-w-12 items-center justify-center border border-navy/30 px-4 text-sm font-semibold text-navy">
            Call
          </a>
        )}
      </div>
    </div>
  );
}
