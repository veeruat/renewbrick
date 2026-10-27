import Image from "next/image";
import { business } from "@/content/site";
import { getLogo } from "@/lib/logo";

/**
 * Renders the approved RenewBrick logo at its intrinsic aspect ratio. The
 * supplied logo is navy and gold on white, so it is only ever placed on white.
 * If the logo file is missing, a TEMPORARY text wordmark is shown instead —
 * it is not the RenewBrick logo.
 */
export function Wordmark({ className = "h-16", priority = false }: { className?: string; priority?: boolean }) {
  const logo = getLogo();
  if (logo) {
    return (
      <Image
        src={logo.src}
        width={logo.width}
        height={logo.height}
        alt={business.name}
        priority={priority}
        sizes="(min-width: 640px) 220px, 195px"
        className={`w-auto ${className}`}
      />
    );
  }
  return (
    <span className="flex items-baseline text-[2.3rem] font-extrabold leading-none tracking-[-0.03em] sm:text-[2.7rem]">
      <span className="text-navy">renew</span>
      <span className="text-gold-ink">brick</span>
    </span>
  );
}
