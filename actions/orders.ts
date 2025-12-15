'use server'

import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'

export interface OrderWithDetails {
  id: string
  paddle_transaction_id: string
  user_id: string
  status: string
  total: number
  currency: string
  customer_email: string
  created_at: string
  user?: {
    email: string
    full_name: string | null
  }
  order_items?: {
    id: string
    product_id: string
    price: number
    product?: {
      title: string
      thumbnail: string | null
    }
  }[]
}

export const getOrders = cache(async () => {
  const supabase = await createClient()
  
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      user:users(email, full_name),
      order_items(
        id,
        product_id,
        price,
        product:products(title, thumbnail)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }

  return orders as OrderWithDetails[]
})

export const getOrderById = cache(async (id: string) => {
  const supabase = await createClient()
  
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      user:users(email, full_name),
      order_items(
        id,
        product_id,
        price,
        product:products(title, thumbnail)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching order:', error)
    return null
  }

  return order as OrderWithDetails
})

export async function updateOrderStatus(id: string, status: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)

  if (error) {
    console.error('Error updating order status:', error)
    return { error: error.message }
  }

  return { success: true }
}

export async function getOrderStats() {
  const supabase = await createClient()
  
  const { data: orders } = await supabase
    .from('orders')
    .select('total, status, created_at')
  
  if (!orders) return { totalRevenue: 0, totalOrders: 0, completedOrders: 0 }
  
  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + (o.total || 0), 0)
  
  const totalOrders = orders.length
  const completedOrders = orders.filter(o => o.status === 'completed').length
  
  return { totalRevenue, totalOrders, completedOrders }
}
