import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work | Raylodies",
  description:
    "A collection of projects exploring the boundaries of digital creativity and artificial intelligence. A look into how I translate raw data into specific, curated visions.",
};

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
