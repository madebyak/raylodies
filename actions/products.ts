'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'

// Memoized version for the same request (React cache)
// For admin pages - uses authenticated client
export const getProducts = cache(async () => {
  const supabase = await createClient()
  
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        id,
        name,
        slug,
        type
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return products
})

// Get published products only (for public store page)
export const getPublishedProducts = cache(async () => {
  const supabase = await createClient()
  
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        id,
        name,
        slug,
        type
        )
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching published products:', error)
    return []
  }

  return products
})

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting product:', error)
    // In production, you might want to use a toast notification service
    return
  }

  revalidatePath('/admin/products')
  revalidatePath('/store')
}

export async function toggleProductStatus(id: string, currentStatus: boolean): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('products')
    .update({ is_published: !currentStatus })
    .eq('id', id)

  if (error) {
    console.error('Error toggling product status:', error)
    return
  }

  revalidatePath('/admin/products')
  revalidatePath('/store')
}
