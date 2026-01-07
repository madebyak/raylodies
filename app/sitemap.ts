import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site";
import { createPublicClient } from "@/lib/supabase/public";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const supabase = createPublicClient();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/work`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/store`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.6 },
    {
      url: `${baseUrl}/start-a-project`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const [{ data: productRows }, { data: projectRows }] = await Promise.all([
    supabase
      .from("products")
      .select("slug, updated_at")
      .eq("is_published", true)
      .order("updated_at", { ascending: false })
      .limit(5000),
    supabase
      .from("projects")
      .select("slug, updated_at")
      .eq("is_published", true)
      .order("updated_at", { ascending: false })
      .limit(5000),
  ]);

  const productRoutes: MetadataRoute.Sitemap = (productRows || [])
    .filter((r) => r.slug)
    .map((r) => ({
      url: `${baseUrl}/store/${r.slug}`,
      lastModified: r.updated_at ? new Date(r.updated_at) : undefined,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  const projectRoutes: MetadataRoute.Sitemap = (projectRows || [])
    .filter((r) => r.slug)
    .map((r) => ({
      url: `${baseUrl}/work/${r.slug}`,
      lastModified: r.updated_at ? new Date(r.updated_at) : undefined,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [...staticRoutes, ...projectRoutes, ...productRoutes];
}
