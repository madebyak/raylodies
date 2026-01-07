import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import Providers from "@/components/providers";
import { Toaster } from "sonner";
import { getSiteUrl } from "@/lib/seo/site";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/seo/site";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Raylodies | AI Creative Director",
  description:
    "Raylodies is an AI creative director specializing in AI-generated images and videos. Explore the portfolio and shop digital AI presets.",
  keywords: [
    "AI",
    "creative director",
    "AI art",
    "AI videos",
    "AI presets",
    "digital art",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "Raylodies | AI Creative Director",
    description:
      "Raylodies is an AI creative director specializing in AI-generated images and videos. Explore the portfolio and shop digital AI presets.",
    url: "/",
    siteName: "Raylodies",
    images: [
      {
        url: "/opengraph-image.jpg",
        width: 1200,
        height: 630,
        alt: "Raylodies - AI Creative Director & Artist",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Raylodies | AI Creative Director",
    description:
      "Raylodies is an AI creative director specializing in AI-generated images and videos. Explore the portfolio and shop digital AI presets.",
    images: [
      {
        url: "/twitter-image.jpg",
        width: 1200,
        height: 630,
        alt: "Raylodies - AI Creative Director & Artist",
      },
    ],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
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
      </body>
    </html>
  );
}
