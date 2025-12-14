import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { Package } from "lucide-react";

export default async function PurchasesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        price,
        products (title, thumbnail)
      )
    `)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-light text-white">Purchase History</h2>

      {(!orders || orders.length === 0) ? (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-12 text-center">
          <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 font-light">No purchases yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden">
              <div className="bg-white/[0.02] border-b border-white/5 px-6 py-4 flex flex-wrap gap-4 justify-between items-center">
                <div className="flex gap-6 text-sm">
                  <div>
                    <p className="text-white/40 mb-1">Order Placed</p>
                    <p className="text-white font-light">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 mb-1">Total</p>
                    <p className="text-white font-light">{formatPrice(order.total)}</p>
                  </div>
                  <div>
                    <p className="text-white/40 mb-1">Status</p>
                    <span className="capitalize text-green-400">{order.status}</span>
                  </div>
                </div>
                <div className="text-xs text-white/20 font-mono">#{order.paddle_transaction_id}</div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {order.order_items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-4">
                      {item.products?.thumbnail && (
                        <div className="w-12 h-12 bg-white/5 rounded-md overflow-hidden relative">
                          <img src={item.products.thumbnail} alt="" className="object-cover w-full h-full" />
                        </div>
                      )}
                      <div>
                        <p className="text-white font-light">{item.products?.title || 'Unknown Product'}</p>
                        <p className="text-white/40 text-sm">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
