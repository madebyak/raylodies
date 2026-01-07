"use server";

import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

export interface OrderWithDetails {
  id: string;
  paddle_transaction_id: string | null;
  user_id: string;
  status: string;
  total: number;
  currency: string | null;
  customer_email: string | null;
  created_at: string;
  user?: {
    email: string;
    full_name: string | null;
  };
  order_items?: {
    id: string;
    product_id: string;
    price: number;
    product?: {
      title: string;
      thumbnail: string | null;
    };
  }[];
}

type UserJoin =
  | { email: string; full_name: string | null }
  | { email: string; full_name: string | null }[]
  | null;
type ProductJoin =
  | { title: string; thumbnail: string | null }
  | { title: string; thumbnail: string | null }[]
  | null;

type OrderItemRow = {
  id: string;
  product_id: string;
  price: number;
  product?: ProductJoin;
};

type OrderRow = {
  id: string;
  paddle_transaction_id: string | null;
  user_id: string;
  status: string;
  total: number;
  currency: string | null;
  customer_email: string | null;
  created_at: string;
  user?: UserJoin;
  order_items?: OrderItemRow[];
};

function firstOrUndefined<T>(value: T | T[] | null | undefined): T | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function normalizeOrder(row: OrderRow): OrderWithDetails {
  const user = firstOrUndefined(row.user);
  return {
    ...row,
    user: user ? { email: user.email, full_name: user.full_name } : undefined,
    order_items: (row.order_items || []).map((item) => {
      const product = firstOrUndefined(item.product);
      return {
        id: item.id,
        product_id: item.product_id,
        price: item.price,
        product: product
          ? { title: product.title, thumbnail: product.thumbnail }
          : undefined,
      };
    }),
  };
}

export const getOrders = cache(async () => {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      user:users(email, full_name),
      order_items(
        id,
        product_id,
        price,
        product:products(title, thumbnail)
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }

  return (orders as unknown as OrderRow[]).map(normalizeOrder);
});

// Lightweight query for admin dashboard (chart + latest list)
export const getDashboardOrders = cache(async () => {
  const supabase = await createClient();

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      paddle_transaction_id,
      user_id,
      status,
      total,
      currency,
      customer_email,
      created_at,
      user:users(email, full_name),
      order_items(
        id,
        product_id,
        price,
        product:products(title, thumbnail)
      )
    `,
    )
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Error fetching dashboard orders:", error);
    return [];
  }

  return (orders as unknown as OrderRow[]).map(normalizeOrder);
});

export const getOrderById = cache(async (id: string) => {
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      user:users(email, full_name),
      order_items(
        id,
        product_id,
        price,
        product:products(title, thumbnail)
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching order:", error);
    return null;
  }

  return normalizeOrder(order as unknown as OrderRow);
});

export async function updateOrderStatus(id: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Error updating order status:", error);
    return { error: error.message };
  }

  return { success: true };
}

export async function getOrderStats() {
  const supabase = await createClient();

  // Prefer DB aggregation (fast at scale). Falls back if the RPC isn't created yet.
  const { data: statsRows, error: rpcError } =
    await supabase.rpc("get_order_stats");

  if (!rpcError && Array.isArray(statsRows) && statsRows[0]) {
    const row = statsRows[0] as unknown as {
      total_revenue?: number | string | null;
      total_orders?: number | string | null;
      completed_orders?: number | string | null;
    };
    return {
      totalRevenue: Number(row.total_revenue ?? 0),
      totalOrders: Number(row.total_orders ?? 0),
      completedOrders: Number(row.completed_orders ?? 0),
    };
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("total, status");

  if (!orders) return { totalRevenue: 0, totalOrders: 0, completedOrders: 0 };

  let totalRevenue = 0;
  let completedOrders = 0;

  for (const o of orders) {
    if (o.status === "completed") {
      completedOrders += 1;
      totalRevenue += o.total || 0;
    }
  }

  return { totalRevenue, totalOrders: orders.length, completedOrders };
}
