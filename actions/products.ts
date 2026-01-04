'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { createPublicClient } from '@/lib/supabase/public'
import type { ProductListItem } from '@/types/database'

type CategoryJoin = { id: string; name: string; slug: string; type: 'project' | 'product' } | { id: string; name: string; slug: string; type: 'project' | 'product' }[] | null

function firstCategory(value: CategoryJoin): ProductListItem['categories'] {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

type KeywordJoin = { keyword: string }[] | null

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
  const supabase = createPublicClient()
  
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      title,
      slug,
      price,
      thumbnail,
      categories (
        id,
        name,
        slug,
        type
        ),
      product_keywords (
        keyword
      )
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching published products:', error)
    return []
  }

  return (products as unknown as Array<ProductListItem & { categories: CategoryJoin; product_keywords?: KeywordJoin }>).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: p.price,
    thumbnail: p.thumbnail ?? null,
    categories: firstCategory(p.categories),
    keywords: (p.product_keywords || []).map((k) => k.keyword).filter(Boolean),
  })) satisfies ProductListItem[]
})

export async function deleteProduct(id: string): Promise<{ success?: true; archived?: true; error?: string }> {
  const supabase = await createClient()
  
  // If a product has order_items, deleting it can break purchase history and downloads.
  // Our schema also blocks deletion due to FK constraints. In that case, we "archive" by unpublishing.
  const { data: anyItem, error: oiErr } = await supabase
    .from('order_items')
    .select('id')
    .eq('product_id', id)
    .limit(1)
    .maybeSingle()

  if (!oiErr && anyItem?.id) {
    const { error: archiveErr } = await supabase
      .from('products')
      .update({ is_published: false })
      .eq('id', id)

    if (archiveErr) {
      console.error('Error archiving product:', archiveErr)
      return { error: archiveErr.message }
    }

    revalidatePath('/admin/products')
    revalidatePath('/store')
    return { success: true, archived: true }
  }

  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) {
    console.error('Error deleting product:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/products')
  revalidatePath('/store')
  revalidatePath('/')
  return { success: true }
}

export async function toggleProductStatus(id: string, currentStatus: boolean): Promise<{ success?: true; error?: string }> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('products')
    .update({ is_published: !currentStatus })
    .eq('id', id)

  if (error) {
    console.error('Error toggling product status:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/products')
  revalidatePath('/store')
  revalidatePath('/')
  return { success: true }
}


