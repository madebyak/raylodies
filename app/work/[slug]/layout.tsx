import type { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { normalizeSlug } from "@/lib/slug";

function clampDescription(text: string, max = 160) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

interface Props {
  params: { slug: string } | Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createPublicClient();

  let { data: project } = await supabase
    .from("projects")
    .select(
      `
      id,
      title,
      slug,
      description,
      year,
      thumbnail,
      og_image,
      meta_title,
      meta_description,
      categories (name, slug)
    `
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!project) {
    const normalized = normalizeSlug(slug);
    if (normalized && normalized !== slug) {
      const res = await supabase
        .from("projects")
        .select(
          `
          id,
          title,
          slug,
          description,
          year,
          thumbnail,
          og_image,
          meta_title,
          meta_description,
          categories (name, slug)
        `
        )
        .eq("slug", normalized)
        .eq("is_published", true)
        .maybeSingle();
      project = res.data ?? null;
    }
  }

  if (!project) {
    return {
      title: "Project Not Found | Raylodies",
      robots: { index: false, follow: false },
    };
  }

  const title = project.meta_title || `${project.title} | Raylodies`;
  const description =
    project.meta_description ||
    clampDescription(project.description || "AI-generated work by Raylodies.");

  const image = project.og_image || project.thumbnail || undefined;
  const canonical = `/work/${project.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("projects")
    .select("slug")
    .eq("is_published", true)
    .order("updated_at", { ascending: false })
    .limit(2000);

  return (data || []).filter((r) => r.slug).map((r) => ({ slug: r.slug as string }));
}

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

