import { createClient } from "@/lib/supabase/server";
import { Download, FileIcon } from "lucide-react";
import Image from "next/image";

export default async function DownloadsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get all purchased products
  const { data: purchasedItems } = await supabase
    .from('order_items')
    .select(`
      id,
      products (
        id,
        title,
        thumbnail,
        file_url
      )
    `)
    .eq('order.user_id', user!.id)
    .eq('order.status', 'completed')
    // Join with order to filter by user and status
    // Note: Supabase complex joins can be tricky, using !inner ensures inner join
    .not('products.file_url', 'is', null);

  // Since the simple join above might be limited by RLS visibility of order_items 
  // (we made a policy: Users view own order items), this should work.
  // However, we need to explicitly join 'orders' table in the select to apply the filter.
  
  // Refined query:
  const { data: items } = await supabase
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
    .eq('orders.user_id', user!.id)
    .eq('orders.status', 'completed');

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-light text-white">Your Downloads</h2>

      {(!items || items.length === 0) ? (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-12 text-center">
          <Download className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 font-light">No downloads available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map((item: any) => (
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
