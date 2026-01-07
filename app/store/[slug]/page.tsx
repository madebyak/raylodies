import { createPublicClient } from "@/lib/supabase/public";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileIcon } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ProductImage } from "@/types/database";
import ProductGallery from "@/components/store/ProductGallery";
import ProductPurchasePanel from "@/components/store/ProductPurchasePanel";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/seo/site";
import { normalizeSlug } from "@/lib/slug";

export const revalidate = 300;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createPublicClient();

  // Fetch product with images
  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      categories (name),
      product_images (
        id,
        url,
        display_order
      )
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!product) {
    const normalized = normalizeSlug(slug);
    if (normalized && normalized !== slug) {
      const { data: alt } = await supabase
        .from("products")
        .select("slug")
        .eq("slug", normalized)
        .eq("is_published", true)
        .maybeSingle();

      if (alt?.slug) {
        redirect(`/store/${alt.slug}`);
      }
    }

    notFound();
  }

  // Sort images by display_order
  const images = (product.product_images as ProductImage[] || []).sort(
    (a, b) => a.display_order - b.display_order
  );

  const productUrl = absoluteUrl(`/store/${product.slug}`);
  const primaryImage =
    product.og_image ||
    product.thumbnail ||
    (images[0]?.url ? images[0].url : undefined);

  return (
    <article className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 md:px-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: "Store", item: absoluteUrl("/store") },
            { "@type": "ListItem", position: 3, name: product.title, item: productUrl },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          description: product.description || undefined,
          image: primaryImage ? [primaryImage] : undefined,
          sku: product.id,
          url: productUrl,
          brand: {
            "@type": "Brand",
            name: "Raylodies",
          },
          offers: {
            "@type": "Offer",
            url: productUrl,
            priceCurrency: "USD",
            price: product.price,
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
          },
        }}
      />
      <div className="max-w-[1800px] mx-auto">
        <Link
          href="/store"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-8 transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Back to Store
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left: Image Gallery */}
          <div className="lg:col-span-7">
            <ProductGallery 
              images={images} 
              thumbnail={product.thumbnail} 
              title={product.title} 
            />
          </div>

          {/* Right: Product Info */}
          <div className="space-y-8 lg:col-span-5">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-white/60">
                <span className="uppercase tracking-wider">{product.categories?.name}</span>
                {product.file_url && (
                  <span className="flex items-center gap-1 text-green-400/80 bg-green-400/10 px-2 py-0.5 rounded">
                    <FileIcon size={12} /> Digital Download
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-light text-white leading-tight">
                {product.title}
              </h1>
              <p className="text-2xl text-white font-light">
                {product.is_free || product.price === 0 ? "Free" : formatPrice(product.price)}
              </p>
            </div>

            <div className="prose prose-invert prose-sm text-white/70 font-light leading-relaxed max-w-none">
              <p className="whitespace-pre-wrap">{product.description}</p>
            </div>

            <div className="pt-8 border-t border-white/5">
              <ProductPurchasePanel
                productId={product.id}
                productSlug={product.slug}
                paddlePriceId={product.paddle_price_id}
                isFree={Boolean(product.is_free) || product.price === 0}
                hasFile={!!product.file_url}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
