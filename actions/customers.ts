'use server'

import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'

export interface CustomerWithStats {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: string
  created_at: string
  updated_at: string
  total_orders?: number
  total_spent?: number
}

export const getCustomers = cache(async () => {
  const supabase = await createClient()

  // Prefer DB aggregation (fast at scale). Falls back if the RPC isn't created yet.
  const { data: rpcRows, error: rpcError } = await supabase.rpc('get_customers_with_stats')
  if (!rpcError && Array.isArray(rpcRows)) {
    return rpcRows as CustomerWithStats[]
  }
  
  // Get all users
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching customers:', error)
    return []
  }

  // Get order stats for each user
  const { data: orders } = await supabase
    .from('orders')
    .select('user_id, total, status')
    .eq('status', 'completed')

  // Calculate stats per user
  const userStats = new Map<string, { total_orders: number; total_spent: number }>()
  
  if (orders) {
    for (const order of orders) {
      const stats = userStats.get(order.user_id) || { total_orders: 0, total_spent: 0 }
      stats.total_orders += 1
      stats.total_spent += order.total || 0
      userStats.set(order.user_id, stats)
    }
  }

  // Merge stats with users
  const customersWithStats: CustomerWithStats[] = users.map(user => ({
    ...user,
    total_orders: userStats.get(user.id)?.total_orders || 0,
    total_spent: userStats.get(user.id)?.total_spent || 0,
  }))

  return customersWithStats
})

export const getCustomerById = cache(async (id: string) => {
  const supabase = await createClient()
  
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching customer:', error)
    return null
  }

  // Get customer orders
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        id,
        price,
        product:products(title, thumbnail)
      )
    `)
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  return {
    ...user,
    orders: orders || [],
    total_orders: orders?.filter(o => o.status === 'completed').length || 0,
    total_spent: orders
      ?.filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (o.total || 0), 0) || 0,
  }
})

export async function getCustomerStats() {
  const supabase = await createClient()
  
  const { count: totalCustomers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
  
  const { data: recentCustomers } = await supabase
    .from('users')
    .select('id')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
  
  return {
    totalCustomers: totalCustomers || 0,
    newCustomersThisMonth: recentCustomers?.length || 0,
  }
}


