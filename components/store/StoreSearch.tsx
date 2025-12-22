"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import ProductGrid from "@/components/store/ProductGrid";
import type { ProductListItem } from "@/types/database";

export default function StoreSearch({ initialProducts }: { initialProducts: ProductListItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initialProducts;

    return initialProducts.filter((p) => {
      const inTitle = p.title?.toLowerCase().includes(q);
      const inKeywords = (p.keywords || []).some((k) => k.toLowerCase().includes(q));
      return inTitle || inKeywords;
    });
  }, [initialProducts, query]);

  return (
    <div className="space-y-8">
      <div className="max-w-xl">
        <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-3 border border-white/10 focus-within:border-white/20 transition-colors">
          <Search size={16} className="text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or keyword..."
            className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/30 w-full"
            aria-label="Search store products"
          />
        </div>
        {query.trim() && (
          <p className="text-xs text-white/30 mt-2">
            Showing {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </p>
        )}
      </div>

      <ProductGrid initialProducts={filtered} />
    </div>
  );
}


