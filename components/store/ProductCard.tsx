"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ProductListItem } from "@/types/database";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: ProductListItem;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Link href={`/store/${product.slug}`} className="group block">
        <article className="space-y-4">
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/20">
                No Thumbnail
              </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500" />

            {/* Category Tag */}
            {product.categories && (
              <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white/80 text-xs font-light px-3 py-1 tracking-wide">
                {product.categories.name}
              </span>
            )}

            {/* View Indicator */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <span className="text-white text-sm font-light tracking-wider border border-white/30 px-4 py-2 backdrop-blur-sm bg-black/30">
                View Details
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className="text-white text-base font-light group-hover:text-white/80 transition-colors duration-300 line-clamp-1">
              {product.title}
            </h3>
            <p className="text-white text-lg font-light">
              {formatPrice(product.price)}
            </p>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
