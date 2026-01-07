import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start a Project | Raylodies",
  description:
    "Get in touch with Raylodies for AI imagery, video, and creative direction projects. Available for select collaborations.",
};

export default function StartAProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
