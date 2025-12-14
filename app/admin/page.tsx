"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import { DollarSign, ShoppingBag, Users, TrendingUp } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import Link from "next/link";

// Mock data for initial display
const salesData = [
  { name: "Dec 8", sales: 420 },
  { name: "Dec 9", sales: 850 },
  { name: "Dec 10", sales: 600 },
  { name: "Dec 11", sales: 900 },
  { name: "Dec 12", sales: 1200 },
  { name: "Dec 13", sales: 800 },
  { name: "Dec 14", sales: 1500 },
];

const recentOrders = [
  { id: "ORD-7234", customer: "Sarah Williams", product: "Cinematic Landscapes", amount: 29.00, status: "completed", date: "2 mins ago" },
  { id: "ORD-7233", customer: "Mike Johnson", product: "Portrait Master", amount: 39.00, status: "completed", date: "1 hour ago" },
  { id: "ORD-7232", customer: "Alex Chen", product: "Neon Cyberpunk", amount: 34.00, status: "pending", date: "3 hours ago" },
  { id: "ORD-7231", customer: "Emily Davis", product: "AI Video Pack", amount: 68.00, status: "completed", date: "5 hours ago" },
  { id: "ORD-7230", customer: "James Wilson", product: "Cinematic Landscapes", amount: 29.00, status: "refunded", date: "1 day ago" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value="$14,250" 
          change="+12.5%" 
          icon={DollarSign} 
        />
        <StatCard 
          title="Total Orders" 
          value="482" 
          change="+8.2%" 
          icon={ShoppingBag} 
        />
        <StatCard 
          title="Active Customers" 
          value="1,205" 
          change="+15.3%" 
          icon={Users} 
        />
        <StatCard 
          title="Conversion Rate" 
          value="3.2%" 
          change="+1.1%" 
          icon={TrendingUp} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-[#050505] border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-light text-white mb-6">Revenue Overview</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#ffffff40" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#ffffff40" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `$${value}`} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px" }}
                  itemStyle={{ color: "#fff" }}
                  cursor={{ fill: "#ffffff05" }}
                />
                <Bar dataKey="sales" fill="#ffffff" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                    <ShoppingBag size={16} />
                  </div>
                  <div>
                    <p className="text-sm text-white font-light">{order.customer}</p>
                    <p className="text-xs text-white/40">{order.product}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white font-medium">{formatPrice(order.amount)}</p>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ size?: number }>;
}

function StatCard({ title, value, change, icon: Icon }: StatCardProps) {
  const isPositive = change.startsWith("+");
  
  return (
    <div className="bg-[#050505] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors group">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-white/5 rounded-lg text-white/60 group-hover:text-white transition-colors">
          <Icon size={20} />
        </div>
        <span className={cn(
          "text-xs font-medium px-2 py-1 rounded-full",
          isPositive ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"
        )}>
          {change}
        </span>
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
    <span className={cn("text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block", styles[status as keyof typeof styles])}>
      {label}
    </span>
  );
}
