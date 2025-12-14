import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import Providers from "@/components/providers";
import { createClient } from "@/lib/supabase/server";
import { Toaster } from "sonner";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className={`${roboto.variable} antialiased`}>
        <Providers>
          <ConditionalLayout user={user}>
            {children}
          </ConditionalLayout>
        </Providers>
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  );
}
