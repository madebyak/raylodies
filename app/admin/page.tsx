import { getDashboardOrders, getOrderStats } from "@/actions/orders";
import { getCustomerStats } from "@/actions/customers";
import { DollarSign, ShoppingBag, Users, TrendingUp, Package } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import DashboardChart from "@/components/admin/DashboardChart";

export default async function AdminDashboard() {
  const [orderStats, customerStats, recentOrders] = await Promise.all([
    getOrderStats(),
    getCustomerStats(),
    getDashboardOrders()
  ]);

  // Get last 5 orders
  const latestOrders = recentOrders.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={formatPrice(orderStats.totalRevenue)} 
          icon={DollarSign}
          color="green"
        />
        <StatCard 
          title="Total Orders" 
          value={orderStats.totalOrders.toString()} 
          icon={ShoppingBag}
          color="blue"
        />
        <StatCard 
          title="Total Customers" 
          value={customerStats.totalCustomers.toString()}
          icon={Users}
          color="purple"
        />
        <StatCard 
          title="New This Month" 
          value={customerStats.newCustomersThisMonth.toString()}
          icon={TrendingUp}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-[#050505] border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-light text-white mb-6">Recent Activity</h3>
          <DashboardChart orders={recentOrders} />
        </div>

        {/* Recent Orders */}
        <div className="bg-[#050505] border border-white/5 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-light text-white">Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs text-white/40 hover:text-white transition-colors">
              View All
            </Link>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
            {latestOrders.length === 0 ? (
              <div className="text-center text-white/40 py-8">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No orders yet</p>
              </div>
            ) : (
              latestOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
                      {order.order_items?.[0]?.product?.thumbnail ? (
                        <Image
                          src={order.order_items[0].product.thumbnail}
                          alt=""
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <ShoppingBag size={16} className="text-white/40" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-white font-light">
                        {order.user?.full_name || order.customer_email?.split('@')[0] || 'Guest'}
                      </p>
                      <p className="text-xs text-white/40">
                        {order.order_items?.[0]?.product?.title || 'Product'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white font-medium">{formatPrice(order.total)}</p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickLink href="/admin/products/new" label="Add Product" icon={ShoppingBag} />
        <QuickLink href="/admin/projects/new" label="Add Project" icon={Package} />
        <QuickLink href="/admin/orders" label="View Orders" icon={DollarSign} />
        <QuickLink href="/admin/customers" label="View Customers" icon={Users} />
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: 'green' | 'blue' | 'purple' | 'yellow';
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    green: 'bg-green-500/10 text-green-400',
    blue: 'bg-blue-500/10 text-blue-400',
    purple: 'bg-purple-500/10 text-purple-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
  };
  
  return (
    <div className="bg-[#050505] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors group">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2 rounded-lg", colorClasses[color])}>
          <Icon size={20} />
        </div>
      </div>
      <h3 className="text-white/40 text-sm font-light mb-1">{title}</h3>
      <p className="text-2xl text-white font-light">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    completed: "text-green-400 bg-green-400/10",
    pending: "text-yellow-400 bg-yellow-400/10",
    refunded: "text-red-400 bg-red-400/10",
    failed: "text-gray-400 bg-gray-400/10",
  };
  
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  
  return (
    <span className={cn("text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block", styles[status as keyof typeof styles] || styles.pending)}>
      {label}
    </span>
  );
}

function QuickLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }) {
  return (
    <Link
      href={href}
      className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:bg-white/[0.05] hover:border-white/10 transition-all flex items-center gap-3"
    >
      <Icon size={18} className="text-white/40" />
      <span className="text-sm text-white/60">{label}</span>
    </Link>
  );
}


