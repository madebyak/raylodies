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
import { useMemo } from "react";

interface Order {
  id: string;
  total: number;
  created_at: string;
  status: string;
}

interface DashboardChartProps {
  orders: Order[];
}

export default function DashboardChart({ orders }: DashboardChartProps) {
  // Group orders by day for the last 7 days
  const chartData = useMemo(() => {
    const days: { [key: string]: number } = {};
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days[key] = 0;
    }
    
    // Sum up completed orders by day
    orders
      .filter(o => o.status === 'completed')
      .forEach(order => {
        const date = new Date(order.created_at);
        const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (days[key] !== undefined) {
          days[key] += order.total || 0;
        }
      });
    
    return Object.entries(days).map(([name, sales]) => ({ name, sales }));
  }, [orders]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
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
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
          />
          <Bar dataKey="sales" fill="#ffffff" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}



