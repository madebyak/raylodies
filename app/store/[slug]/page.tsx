import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Download, FileIcon } from "lucide-react";
import { BuyButton } from "@/components/store/BuyButton";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch product
  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      categories (name)
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!product) {
    notFound();
  }

  // Check if user has already purchased (if logged in)
  const { data: { user } } = await supabase.auth.getUser();
  let hasPurchased = false;

  if (user) {
    const { data: purchase } = await supabase
      .from('order_items')
      .select('id, order:orders!inner(user_id, status)')
      .eq('product_id', product.id)
      .eq('order.user_id', user.id)
      .eq('order.status', 'completed')
      .single();
      
    hasPurchased = !!purchase;
  }

  return (
    <article className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/store"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-8 transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Back to Store
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Image Gallery */}
          <div className="space-y-6">
            <div className="aspect-[4/3] relative rounded-xl overflow-hidden bg-white/5 border border-white/5">
              {product.thumbnail ? (
                <Image
                  src={product.thumbnail}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white/20">
                  No Preview
                </div>
              )}
            </div>
            {/* Gallery thumbnails would go here if we had product_images table populated */}
          </div>

          {/* Right: Product Info */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-white/40">
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
                {formatPrice(product.price)}
              </p>
            </div>

            <div className="prose prose-invert prose-sm text-white/60 font-light leading-relaxed max-w-none">
              <p className="whitespace-pre-wrap">{product.description}</p>
            </div>

            <div className="pt-8 border-t border-white/5">
              {hasPurchased ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-400 bg-green-400/10 p-4 rounded-lg">
                    <Check size={20} />
                    <span>You own this product</span>
                  </div>
                  <Link href="/account/downloads">
                    <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                      <Download size={18} />
                      Go to Downloads
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {product.paddle_price_id ? (
                    <BuyButton 
                      priceId={product.paddle_price_id} 
                      productId={product.id} 
                    />
                  ) : (
                    <Button disabled className="w-full opacity-50 cursor-not-allowed">
                      Not Available for Purchase
                    </Button>
                  )}
                  <p className="text-center text-xs text-white/30">
                    Secure payment via Paddle • Instant download
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
