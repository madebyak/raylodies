import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work | Raylodies",
  description:
    "Explore AI-generated images and videos by Raylodies. A collection pushing the boundaries of digital creativity and artificial intelligence.",
};

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

