"use client";

import { useSearchParams } from "next/navigation";

export function Reference() {
  const ref = useSearchParams().get("ref");
  if (!ref || !/^RB-\d{6}-[A-Z0-9]{4}$/.test(ref)) return null;
  return (
    <p className="mt-6 text-lead text-slate">
      Your reference is <strong className="font-semibold tabular-nums text-navy">{ref}</strong>.
    </p>
  );
}
