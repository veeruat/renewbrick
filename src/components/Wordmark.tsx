import Image from "next/image";
import { business } from "@/content/site";
import { getLogo } from "@/lib/logo";

/**
 * Renders the approved RenewBrick logo at its intrinsic aspect ratio: the
 * navy-and-gold version on light backgrounds, the reversed (white + gold)
 * version on navy. If the logo file is missing, a TEMPORARY text wordmark is
 * shown instead — it is not the RenewBrick logo.
 */
export function Wordmark({
  className = "h-12",
  priority = false,
  tone = "light",
}: {
  className?: string;
  priority?: boolean;
  tone?: "light" | "dark";
}) {
  const logo = getLogo(tone);
  if (logo) {
    return (
      <Image
        src={logo.src}
        width={logo.width}
        height={logo.height}
        alt={business.name}
        priority={priority}
        className={`w-auto ${className}`}
      />
    );
  }
  return (
    <span className="flex items-baseline text-[2.3rem] font-extrabold leading-none tracking-[-0.03em] sm:text-[2.7rem]">
      <span className={tone === "dark" ? "text-white" : "text-navy"}>renew</span>
      <span className={tone === "dark" ? "text-gold" : "text-gold-ink"}>brick</span>
    </span>
  );
}
