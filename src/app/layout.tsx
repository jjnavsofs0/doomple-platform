import "@/lib/server-error-bootstrap";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "./providers";
import "@/styles/globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Doomple Technologies | Custom Software Development & Consulting India",
    template: "%s | Doomple Technologies",
  },
  description:
    "Doomple Technologies is a leading software development and technology consulting company in Gurgaon, India. We build custom software, AI solutions and mobile apps, and provide expert consulting for startups, MSMEs and enterprises.",
  keywords: [
    "custom software development company India",
    "software development company Gurgaon",
    "technology consulting India",
    "AI consulting India",
    "mobile app development India",
    "SaaS development India",
    "software development for startups India",
    "MSME technology solutions",
    "legacy software modernization India",
    "data analytics consulting India",
    "dedicated development team India",
    "e-commerce development India",
    "DevOps consulting India",
    "digital transformation India",
    "software audit India",
  ],
  authors: [{ name: "Doomple Technologies", url: "https://doomple.com" }],
  creator: "Doomple Technologies",
  publisher: "Doomple Technologies",
  metadataBase: new URL("https://doomple.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://doomple.com",
    title: "Doomple Technologies | Custom Software Development & Consulting India",
    description:
      "Custom software development, AI solutions, mobile apps and technology consulting for startups, MSMEs and enterprises. Based in Gurgaon, India — delivering globally.",
    siteName: "Doomple Technologies",
  },
  twitter: {
    card: "summary_large_image",
    title: "Doomple Technologies | Custom Software Development & Consulting India",
    description:
      "Custom software, AI solutions and technology consulting for startups, MSMEs & enterprises. Gurgaon, India.",
    creator: "@doomple",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Doomple Technologies",
  url: "https://doomple.com",
  logo: "https://doomple.com/logo.png",
  description:
    "Custom software development and technology consulting company in Gurgaon, India. Serving startups, MSMEs and enterprises with software development, AI solutions, and strategic consulting.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "H. No.113 Gali No.1, VIKAS NAGAR, Basai Road",
    addressLocality: "Gurgaon",
    addressRegion: "Haryana",
    postalCode: "122001",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "28.4595",
    longitude: "77.0266",
  },
  telephone: "+91-9211698507",
  email: "sneha@doomple.com",
  areaServed: ["IN", "GB", "US", "AU", "SG", "AE"],
  knowsAbout: [
    "Custom Software Development",
    "Mobile App Development",
    "AI Consulting",
    "Technology Strategy Consulting",
    "Software Audit",
    "Legacy Modernization",
    "Data Analytics",
    "DevOps",
    "Cloud Infrastructure",
  ],
  sameAs: [
    "https://linkedin.com/company/doomple",
    "https://twitter.com/doomple",
    "https://facebook.com/doomple",
    "https://instagram.com/doomple",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
