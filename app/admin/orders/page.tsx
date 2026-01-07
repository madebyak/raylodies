import { getOrders, getOrderStats } from "@/actions/orders";
import { formatPrice } from "@/lib/utils";
import { Package, DollarSign, CheckCircle } from "lucide-react";
import Image from "next/image";

export default async function OrdersPage() {
  const [orders, stats] = await Promise.all([
    getOrders(),
    getOrderStats()
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light text-white">Orders</h1>
        <p className="text-sm text-white/40 mt-1">
          Manage customer orders and transactions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-white/40">Total Revenue</p>
              <p className="text-2xl font-light text-white">
                {formatPrice(stats.totalRevenue)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-white/40">Total Orders</p>
              <p className="text-2xl font-light text-white">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-white/40">Completed</p>
              <p className="text-2xl font-light text-white">{stats.completedOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-4">
                  Order
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-4">
                  Customer
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-4">
                  Products
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-4">
                  Total
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-4">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-4">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No orders yet</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-white font-mono">
                          #{order.paddle_transaction_id?.slice(-8) || order.id.slice(0, 8)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-white">
                          {order.user?.full_name || 'Guest'}
                        </p>
                        <p className="text-xs text-white/40">
                          {order.customer_email || order.user?.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {order.order_items?.slice(0, 3).map((item) => (
                          <div key={item.id} className="relative w-8 h-8 rounded overflow-hidden bg-white/5">
                            {item.product?.thumbnail ? (
                              <Image
                                src={item.product.thumbnail}
                                alt={item.product.title || ''}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-4 h-4 text-white/20" />
                              </div>
                            )}
                          </div>
                        ))}
                        {(order.order_items?.length || 0) > 3 && (
                          <span className="text-xs text-white/40">
                            +{(order.order_items?.length || 0) - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">
                        {formatPrice(order.total)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'completed' 
                          ? 'bg-green-500/10 text-green-400'
                          : order.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white/60">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}




