import { getProducts } from "@/actions/products";
import ProductGrid from "@/components/store/ProductGrid";

export default async function StorePage() {
  const products = await getProducts();

  return (
    <section className="px-6 md:px-10 pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="max-w-[1800px] mx-auto">
        {/* Page Header */}
        <div className="mb-12 md:mb-16 animate-fade-up">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6">
            Store
          </h1>
          <p className="text-white/50 text-lg md:text-xl font-light max-w-3xl">
            Explore a curated collection of premium Digital Prints, Source
            material, Assets, and Blueprints; crafted for artists, designers,
            brands, and collectors.
          </p>
        </div>

        {/* Product Grid */}
        <div className="animate-fade-up delay-200">
          <ProductGrid initialProducts={products} />
        </div>
      </div>
    </section>
  );
}
