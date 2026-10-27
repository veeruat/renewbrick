import { NextResponse, type NextRequest } from "next/server";
import { locations } from "@/content/locations";

const known = new Set(locations.map((l) => `/locations/${l.slug}`));

/**
 * With Cache Components, a page's static shell starts streaming before
 * `notFound()` runs, so an unknown city would otherwise be served as a "soft
 * 404" (status 200). Rewriting unknown location slugs to an unmatched path
 * makes Next.js serve the not-found page with a real 404 status.
 */
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname.replace(/\/$/, "");
  if (path.startsWith("/locations/") && !known.has(path)) {
    return NextResponse.rewrite(new URL("/__not-found", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/locations/:path*",
};
