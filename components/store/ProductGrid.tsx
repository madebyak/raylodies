"use client";

import ProductCard from "./ProductCard";
import { ProductListItem } from "@/types/database";

export default function ProductGrid({ initialProducts }: { initialProducts: ProductListItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10">
      {initialProducts.length === 0 ? (
        <div className="col-span-full text-center py-20">
          <p className="text-white/40 text-lg font-light">
            No products available yet.
          </p>
        </div>
      ) : (
        initialProducts.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))
      )}
    </div>
  );
}
