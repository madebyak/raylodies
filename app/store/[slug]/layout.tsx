import type { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { formatPrice } from "@/lib/utils";
import { normalizeSlug } from "@/lib/slug";
import { absoluteUrl } from "@/lib/seo/site";

function clampDescription(text: string, max = 160) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createPublicClient();

  let { data: product } = await supabase
    .from("products")
    .select(
      `
      id,
      title,
      slug,
      description,
      price,
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

  if (!product) {
    const normalized = normalizeSlug(slug);
    if (normalized && normalized !== slug) {
      const res = await supabase
        .from("products")
        .select(
          `
          id,
          title,
          slug,
          description,
          price,
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
      product = res.data ?? null;
    }
  }

  if (!product) {
    return {
      title: "Product Not Found | Raylodies Store",
      robots: { index: false, follow: false },
    };
  }

  const title = product.meta_title || `${product.title} | Raylodies Store`;
  const description =
    product.meta_description ||
    clampDescription(
      product.description
        ? `${product.description} — ${formatPrice(product.price)}`
        : `Digital download — ${formatPrice(product.price)}`
    );

  const image = product.og_image || product.thumbnail || undefined;
  const canonicalPath = `/store/${product.slug}`;
  const canonical = absoluteUrl(canonicalPath);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
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
    .from("products")
    .select("slug")
    .eq("is_published", true)
    .order("updated_at", { ascending: false })
    .limit(2000);

  return (data || []).filter((r) => r.slug).map((r) => ({ slug: r.slug as string }));
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

