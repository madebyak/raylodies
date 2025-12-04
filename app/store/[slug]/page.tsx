"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { getProductBySlug, products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { notFound } from "next/navigation";
import { useState } from "react";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const product = getProductBySlug(slug);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) {
    notFound();
  }

  // Get related products (excluding current)
  const relatedProducts = products
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <section className="px-6 md:px-10 pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="max-w-[1800px] mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href="/store"
            className="inline-flex items-center gap-2 text-white/50 text-sm font-light hover:text-white transition-colors duration-300 mb-12"
          >
            <ArrowLeft size={16} />
            Back to Store
          </Link>
        </motion.div>

        {/* Product Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-[4/3] bg-white/5 overflow-hidden">
              <Image
                src={product.images[selectedImage] || product.thumbnail}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-16 flex-shrink-0 overflow-hidden transition-all duration-300 ${
                      selectedImage === index
                        ? "ring-1 ring-white"
                        : "opacity-50 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} - ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            {/* Category */}
            <span className="text-white/40 text-sm font-light tracking-wider">
              {product.category}
            </span>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-white">
              {product.title}
            </h1>

            {/* Price */}
            <p className="text-2xl md:text-3xl text-white font-light">
              {formatPrice(product.price)}
            </p>

            {/* Description */}
            <p className="text-white/50 text-base font-light leading-relaxed">
              {product.description}
            </p>

            {/* Keywords */}
            <div className="flex flex-wrap gap-2">
              {product.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-3 py-1 bg-white/5 text-white/50 text-xs font-light rounded-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>

            {/* What's Included */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="text-white text-sm font-light uppercase tracking-wider">
                What&apos;s Included
              </h3>
              <ul className="space-y-3">
                {[
                  "Comprehensive prompt collection",
                  "Detailed usage guide",
                  "Negative prompts included",
                  "Compatible with major AI tools",
                  "Lifetime updates",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-white/60 text-sm font-light"
                  >
                    <Check size={16} className="text-white/40" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <button
                disabled
                className="w-full px-8 py-4 bg-white text-black text-sm font-light tracking-wide hover:bg-white/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Coming Soon
              </button>
              <p className="text-white/30 text-xs font-light mt-3 text-center">
                Payment integration coming soon via Paddle.com
              </p>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-24 pt-12 border-t border-white/10"
          >
            <h2 className="text-2xl font-light text-white mb-10">
              You might also like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/store/${relatedProduct.slug}`}
                  className="group"
                >
                  <div className="space-y-4">
                    <div className="relative aspect-[4/3] bg-white/5 overflow-hidden">
                      <Image
                        src={relatedProduct.thumbnail}
                        alt={relatedProduct.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                    </div>
                    <div>
                      <h3 className="text-white text-sm font-light group-hover:text-white/70 transition-colors line-clamp-1">
                        {relatedProduct.title}
                      </h3>
                      <p className="text-white/50 text-sm font-light mt-1">
                        {formatPrice(relatedProduct.price)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

