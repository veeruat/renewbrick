import type { ReactNode } from "react";
import { Breadcrumbs, Sheet } from "./ui";

export function LegalPage({
  title,
  approved,
  approvedOn,
  children,
}: {
  title: string;
  approved: boolean;
  approvedOn: string | null;
  children: ReactNode;
}) {
  return (
    <>
      <section className="bg-navy text-white">
        <Sheet className="pb-12 pt-10">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: title }]} />
          <h1 className="display mt-10 text-display-lg">{title}</h1>
          {approved && approvedOn && <p className="mt-4 text-mist">Last updated {approvedOn}</p>}
        </Sheet>
      </section>
      <section className="bg-white py-14 md:py-20">
        <Sheet>
          {!approved && (
            <div role="note" className="mb-10 max-w-prose border-l-4 border-gold bg-grey p-5">
              <p className="font-semibold">Draft — under professional review</p>
              <p className="mt-1 text-[0.95rem] text-slate">
                This document is a draft and has not yet been approved. Items in [square brackets] are awaiting confirmation.
              </p>
            </div>
          )}
          <div className="prose-sheet">{children}</div>
        </Sheet>
      </section>
    </>
  );
}
