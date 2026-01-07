import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Raylodies",
  description:
    "Learn about Raylodies - AI creative director specializing in AI-generated imagery and video content. Pushing the boundaries of digital creativity.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
