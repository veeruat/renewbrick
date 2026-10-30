import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Nunito_Sans } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileActionBar } from "@/components/MobileActionBar";
import { inspectionLink, telHref } from "@/lib/contact";
import { JsonLd } from "@/components/ui";
import { business, siteConfig } from "@/content/site";
import { organizationJsonLd } from "@/lib/seo";
import "./globals.css";

// Calm pairing: an open classical serif for headlines, a soft humanist sans for reading.
const nunitoSans = Nunito_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${business.name} — Property Transformation & Care · Hyderabad, Bangalore, Warangal`,
    template: `%s | ${business.name}`,
  },
  description:
    "RenewBrick plans and coordinates renovation, civil works, property maintenance and rental-ready services for property owners in Hyderabad, Bangalore and Warangal.",
  applicationName: business.name,
  // Previews and staging stay out of search results unless SITE_INDEXING=true.
  robots: siteConfig.indexable ? { index: true, follow: true } : { index: false, follow: false },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#092B4D",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${nunitoSans.variable} ${cormorant.variable} antialiased`}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="fixed left-3 top-3 z-[100] -translate-y-24 bg-gold px-4 py-3 font-semibold text-navy transition-transform focus:translate-y-0"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <Footer />
        <MobileActionBar inspection={inspectionLink()} tel={telHref()} />
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
