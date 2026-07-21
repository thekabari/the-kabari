import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";

const SITE_URL = "https://thekabari.pk";
const GA_ID    = "G-XXXXXXXXXX"; // TODO: replace with your real GA4 Measurement ID

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:  "theKabari — Scrap Se XP Kamao, Paise Lo",
    template: "%s | theKabari",
  },
  description:
    "Pakistan ka pehla gamified scrap pickup service. Free doorstep pickup, instant Easypaisa payment, real XP aur badges earn karo. Karachi, Lahore, Islamabad mein available.",
  keywords: [
    "scrap pickup Pakistan",
    "kabari service",
    "recycling Pakistan",
    "scrap dealer Karachi",
    "scrap dealer Lahore",
    "paper scrap",
    "iron scrap price",
    "easypaisa payment",
    "gamified recycling",
    "theKabari",
  ],
  authors:  [{ name: "theKabari", url: SITE_URL }],
  creator:  "theKabari",
  publisher:"theKabari",
  robots:   { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type:        "website",
    locale:      "en_PK",
    url:         SITE_URL,
    siteName:    "theKabari",
    title:       "theKabari — Scrap Se XP Kamao, Paise Lo",
    description: "Pakistan ka pehla gamified scrap pickup. Free doorstep pickup, instant Easypaisa payment, real XP earn karo.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "theKabari — Scrap Se XP Kamao" }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "theKabari — Scrap Se XP Kamao, Paise Lo",
    description: "Pakistan ka pehla gamified scrap pickup. Free doorstep pickup, instant Easypaisa payment.",
    images:      ["/og.png"],
    creator:     "@thekabari",
  },
  icons: {
    icon:        "/favicon.ico",
    shortcut:    "/favicon.ico",
    apple:       "/apple-touch-icon.png",
  },
  manifest:    "/site.webmanifest",
  alternates:  { canonical: SITE_URL },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#4ade80" />
        <meta name="geo.region" content="PK" />
        <meta name="geo.placename" content="Pakistan" />
        {/* Structured data — LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "theKabari",
            "description": "Pakistan ka pehla gamified scrap pickup service.",
            "url": SITE_URL,
            "logo": `${SITE_URL}/logo.png`,
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer support",
              "availableLanguage": ["English","Urdu"],
            },
            "areaServed": ["Karachi","Lahore","Islamabad","Rawalpindi","Faisalabad","Peshawar","Quetta"],
            "serviceType": "Scrap Collection & Recycling",
          }) }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>

        {/* Google Analytics 4 — swap G-XXXXXXXXXX with your real Measurement ID */}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { page_path: window.location.pathname });
        `}</Script>
      </body>
    </html>
  );
}
