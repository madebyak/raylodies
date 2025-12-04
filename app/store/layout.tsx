import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store | Raylodies",
  description:
    "Premium AI presets and prompts by Raylodies. Elevate your creative projects with carefully crafted AI tools.",
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

