import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/Chrome";
import { site } from "@/config/site";
import { getContactSettings } from "@/lib/settings";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.brand} | Sri Lankan vanilla exporter`, template: `%s | ${site.brand}` },
  description: "Vanilla beans, vanilla powder and vanilla tea from Sri Lanka for importers, manufacturers, wholesalers and private-label buyers.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: site.brand, title: `${site.brand} | Vanilla products export from Sri Lanka`, description: "Request a quote or samples for vanilla beans, powder and tea." },
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%23183A2C'/><text x='16' y='23' font-size='20' text-anchor='middle' fill='%23E9D7A5' font-family='serif'>V</text></svg>" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const contact = await getContactSettings();
  const sameAs = [contact.facebook, contact.instagram, contact.tiktok].filter(Boolean);
  const ld = { "@context": "https://schema.org", "@type": "Organization", name: site.brand, url: site.url, ...(contact.email && { email: contact.email }), ...(contact.whatsapp && { telephone: `+${contact.whatsapp}` }), ...(sameAs.length && { sameAs }), address: contact.address ? { "@type": "PostalAddress", streetAddress: contact.address, addressCountry: "LK" } : undefined };
  return (
    <html lang="en">
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">Skip to content</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
        <Header /><main id="main">{children}</main><Footer contact={contact} />
      </body>
    </html>
  );
}
