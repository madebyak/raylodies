import { getProducts, deleteProduct, toggleProductStatus } from "@/actions/products";
import Button from "@/components/ui/Button";
import { Plus, Search, Edit, Trash2, Eye, EyeOff, ShoppingBag, Download } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/database";
import { formatPrice } from "@/lib/utils";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-light text-white">Products</h2>
          <p className="text-white/40 text-sm mt-1">Manage your digital store products</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="flex items-center gap-2">
            <Plus size={18} />
            New Product
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-4 bg-[#050505] border border-white/5 p-2 rounded-lg">
        <div className="flex items-center gap-2 px-3 flex-1">
          <Search size={18} className="text-white/40" />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/30 w-full"
          />
        </div>
        <div className="h-6 w-px bg-white/10" />
        <select className="bg-transparent border-none outline-none text-sm text-white/60 hover:text-white cursor-pointer px-4">
          <option value="all">All Categories</option>
          <option value="presets">Presets</option>
          <option value="assets">Assets</option>
        </select>
        <div className="h-6 w-px bg-white/10" />
        <select className="bg-transparent border-none outline-none text-sm text-white/60 hover:text-white cursor-pointer px-4">
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Products Grid/List */}
      <div className="bg-[#050505] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="py-4 px-6 text-xs font-medium text-white/40 uppercase tracking-wider">Product</th>
              <th className="py-4 px-6 text-xs font-medium text-white/40 uppercase tracking-wider">Category</th>
              <th className="py-4 px-6 text-xs font-medium text-white/40 uppercase tracking-wider">Price</th>
              <th className="py-4 px-6 text-xs font-medium text-white/40 uppercase tracking-wider">File</th>
              <th className="py-4 px-6 text-xs font-medium text-white/40 uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 text-xs font-medium text-white/40 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-white/40 font-light">
                  No products found. Create one to get started.
                </td>
              </tr>
            ) : (
              products.map((product: any) => (
                <ProductRow key={product.id} product={product} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductRow({ product }: { product: Product }) {
  return (
    <tr className="group hover:bg-white/[0.02] transition-colors">
      <td className="py-4 px-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-white/10 relative overflow-hidden border border-white/10">
            {product.thumbnail ? (
              <Image 
                src={product.thumbnail} 
                alt={product.title} 
                fill 
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white/20">
                <ShoppingBag size={20} />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{product.title}</p>
            <p className="text-xs text-white/40">/{product.slug}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-6">
        <span className="text-sm text-white/60">
          {product.categories?.name || 'Uncategorized'}
        </span>
      </td>
      <td className="py-4 px-6">
        <span className="text-sm text-white font-medium">{formatPrice(product.price)}</span>
      </td>
      <td className="py-4 px-6">
        {product.file_url ? (
          <div className="flex items-center gap-1.5 text-green-400 text-xs bg-green-400/10 px-2 py-1 rounded w-fit">
            <Download size={12} />
            Uploaded
          </div>
        ) : (
          <span className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded">Missing</span>
        )}
      </td>
      <td className="py-4 px-6">
        <StatusBadge isPublished={product.is_published} />
      </td>
      <td className="py-4 px-6 text-right">
        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
          <form action={toggleProductStatus.bind(null, product.id, product.is_published)}>
             <button title="Toggle Status" className="p-2 hover:bg-white/10 rounded-md transition-colors text-white/60 hover:text-white">
                {product.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
             </button>
          </form>
          <Link href={`/admin/products/${product.id}`}>
            <button title="Edit" className="p-2 hover:bg-white/10 rounded-md transition-colors text-white/60 hover:text-blue-400">
              <Edit size={16} />
            </button>
          </Link>
          <form action={deleteProduct.bind(null, product.id)}>
            <button title="Delete" className="p-2 hover:bg-white/10 rounded-md transition-colors text-white/60 hover:text-red-400">
              <Trash2 size={16} />
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}

function StatusBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <span className={cn(
      "text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1.5",
      isPublished 
        ? "text-green-400 bg-green-400/10 border border-green-400/20" 
        : "text-white/40 bg-white/5 border border-white/10"
    )}>
      <span className={cn("w-1 h-1 rounded-full", isPublished ? "bg-green-400" : "bg-white/40")} />
      {isPublished ? "Published" : "Draft"}
    </span>
  );
}

import { cn } from "@/lib/utils";
