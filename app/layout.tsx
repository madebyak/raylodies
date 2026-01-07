import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import Providers from "@/components/providers";
import { Toaster } from "sonner";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/seo/site";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

// Site configuration - using hardcoded absolute URLs for OG images (best practice)
const siteConfig = {
  name: "Raylodies",
  title: "Raylodies | AI Creative Director",
  description:
    "Raylodies is an AI creative director specializing in AI-generated images and videos. Explore the portfolio and shop digital AI presets.",
  url: "https://www.raylodies.com",
  ogImage: "https://www.raylodies.com/opengraph-image.jpg",
  twitterHandle: "@rno_jay",
  locale: "en_US",
};

export const metadata: Metadata = {
  // Base URL for resolving relative URLs
  metadataBase: new URL(siteConfig.url),

  // Primary Meta Tags
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,

  // Keywords for SEO
  keywords: [
    "AI",
    "creative director",
    "AI art",
    "AI videos",
    "AI presets",
    "digital art",
    "AI artist",
    "Raylodies",
  ],

  // Author information
  authors: [
    {
      name: "Raylodies",
      url: siteConfig.url,
    },
  ],
  creator: "Raylodies",
  publisher: "Raylodies",

  // Robots directives
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

  // Canonical URL
  alternates: {
    canonical: siteConfig.url,
  },

  // Open Graph metadata (Facebook, LinkedIn, Discord, Telegram, etc.)
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Raylodies - AI Creative Director & Artist",
        type: "image/jpeg",
      },
    ],
  },

  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Raylodies - AI Creative Director & Artist",
      },
    ],
  },

  // Verification for search consoles
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },

  // Pinterest domain verification
  other: {
    "p:domain_verify": "e8ed1eecd088a9013ecf1f74bc090005",
  },

  // Category
  category: "art",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} antialiased`}>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Raylodies",
            url: absoluteUrl("/"),
            // Prefer a brand logo (not the favicon). SVG is OK; we also ship raster icons via app/icon.png.
            logo: absoluteUrl("/white-logo.svg"),
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Raylodies",
            url: absoluteUrl("/"),
          }}
        />
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </Providers>
        <Toaster theme="dark" position="bottom-right" richColors />
        
        {/* Pinterest Save Button SDK - enables hover "Save" button on images */}
        {/* data-pin-color="red" shows the red branded Pinterest button */}
        {/* data-pin-lang="en" ensures English text */}
        {/* data-pin-save="true" shows "Save" text on the button */}
        <Script
          src="//assets.pinterest.com/js/pinit.js"
          strategy="lazyOnload"
          data-pin-hover="true"
          data-pin-tall="true"
          data-pin-round="true"
          data-pin-color="red"
          data-pin-lang="en"
          data-pin-save="true"
        />
      </body>
    </html>
  );
}
