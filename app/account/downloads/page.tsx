import { createClient } from "@/lib/supabase/server";
import { Download, FileIcon } from "lucide-react";
import Image from "next/image";

interface ProductInfo {
  id: string;
  title: string;
  thumbnail: string | null;
  file_url: string | null;
}

interface OrderItemWithProduct {
  id: string;
  products: ProductInfo;
}

export default async function DownloadsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Paid purchases (orders/order_items)
  const { data: paidItems } = await supabase
    .from('order_items')
    .select(`
      id,
      products!inner (
        id,
        title,
        thumbnail,
        file_url
      ),
      orders!inner (
        user_id,
        status
      )
    `)
    .eq('orders.user_id', user.id)
    .eq('orders.status', 'completed');

  const paid: OrderItemWithProduct[] = (paidItems || []).map((item) => ({
    id: item.id as string,
    products: item.products as unknown as ProductInfo,
  }));

  // Free entitlements (login-required)
  const { data: freeItems } = await supabase
    .from("product_entitlements")
    .select(`
      id,
      products!inner (
        id,
        title,
        thumbnail,
        file_url
      )
    `)
    .eq("user_id", user.id);

  const free: OrderItemWithProduct[] = (freeItems || []).map((item) => ({
    id: item.id as string,
    products: item.products as unknown as ProductInfo,
  }));

  // Merge + de-dupe by product id (in case a product is both free and purchased)
  const byProductId = new Map<string, OrderItemWithProduct>();
  for (const item of [...paid, ...free]) {
    if (!item.products?.id) continue;
    byProductId.set(item.products.id, item);
  }
  const orderItems = Array.from(byProductId.values());

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-light text-white">Your Downloads</h2>

      {orderItems.length === 0 ? (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-12 text-center">
          <Download className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 font-light">No downloads available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orderItems.map((item) => (
            <div key={item.id} className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:border-white/10 transition-colors">
              <div className="w-16 h-16 bg-white/5 rounded-lg overflow-hidden relative shrink-0">
                {item.products.thumbnail ? (
                  <Image 
                    src={item.products.thumbnail} 
                    alt={item.products.title} 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white/20">
                    <FileIcon size={24} />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-light truncate">{item.products.title}</h3>
                <p className="text-white/40 text-sm">Ready to download</p>
              </div>

              <a 
                href={`/api/downloads/${item.products.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Download</span>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}





