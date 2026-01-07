import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { Package } from "lucide-react";
import Image from "next/image";
import PurchasesAutoRefresh from "@/components/account/PurchasesAutoRefresh";

interface ProductInfo {
  title: string;
  thumbnail: string | null;
}

interface OrderItemRaw {
  price: number;
  products: ProductInfo;
}

interface OrderRaw {
  id: string;
  created_at: string;
  total: number;
  status: string;
  paddle_transaction_id: string;
  order_items: OrderItemRaw[];
}

export default async function PurchasesPage({
  searchParams,
}: {
  // Next.js 16 typed PageProps expects searchParams to be a Promise in this repo's generated types.
  // At runtime, `searchParams` may already be a plain object; `await` is safe on non-Promise values.
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: ordersData } = await supabase
    .from("orders")
    .select(
      `
      id,
      created_at,
      total,
      status,
      paddle_transaction_id,
      order_items (
        price,
        products (title, thumbnail)
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Transform to expected type
  const orders: OrderRaw[] = (ordersData || []).map((order) => ({
    id: order.id as string,
    created_at: order.created_at as string,
    total: order.total as number,
    status: order.status as string,
    paddle_transaction_id: order.paddle_transaction_id as string,
    order_items: (order.order_items || []).map(
      (item: { price: number; products: ProductInfo | ProductInfo[] }) => ({
        price: item.price,
        products: Array.isArray(item.products)
          ? item.products[0]
          : item.products,
      }),
    ),
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-light text-white">Purchase History</h2>
      <PurchasesAutoRefresh
        enabled={resolvedSearchParams?.checkout === "success"}
        orderCount={orders.length}
      />

      {orders.length === 0 ? (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-12 text-center">
          <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 font-light">No purchases yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden"
            >
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
                    <p className="text-white font-light">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 mb-1">Status</p>
                    <span className="capitalize text-green-400">
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-white/20 font-mono">
                  #{order.paddle_transaction_id}
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {order.order_items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      {item.products?.thumbnail && (
                        <div className="w-12 h-12 bg-white/5 rounded-md overflow-hidden relative">
                          <Image
                            src={item.products.thumbnail}
                            alt={item.products?.title || ""}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      )}
                      <div>
                        <p className="text-white font-light">
                          {item.products?.title || "Unknown Product"}
                        </p>
                        <p className="text-white/40 text-sm">
                          {formatPrice(item.price)}
                        </p>
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
