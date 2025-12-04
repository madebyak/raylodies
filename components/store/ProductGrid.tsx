"use client";

import { products, Product } from "@/lib/data";
import ProductCard from "./ProductCard";

export default function ProductGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {products.map((product: Product, index: number) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}

