import Link from "next/link";
import { ButtonLink, Sheet } from "@/components/ui";
import { servicePath, services } from "@/content/services";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="bg-white py-24 md:py-32">
      <Sheet className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="label text-gold-ink">Error 404</p>
          <h1 className="display mt-4 text-display-lg">This page is not on the drawings.</h1>
          <p className="mt-5 max-w-lg text-lead text-slate">
            The page may have moved, or the address may be mistyped. These links should get you where you were going.
          </p>
          <div className="mt-10">
            <ButtonLink href="/">Go to the homepage</ButtonLink>
          </div>
        </div>
        <ul className="self-end border-t border-navy lg:col-span-4 lg:col-start-9">
          {services.map((s) => (
            <li key={s.slug} className="border-b border-grey-line">
              <Link href={servicePath(s.slug)} className="flex min-h-12 items-center font-medium">
                <span className="draw-link">{s.name}</span>
              </Link>
            </li>
          ))}
          <li className="border-b border-grey-line">
            <Link href="/contact" className="flex min-h-12 items-center font-medium">
              <span className="draw-link">Contact</span>
            </Link>
          </li>
        </ul>
      </Sheet>
    </section>
  );
}
