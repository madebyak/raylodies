'use server'

import { createClient } from '@/lib/supabase/server'
import { ProductImage } from '@/types/database'
import { revalidatePath } from 'next/cache'

export async function addProductImage(productId: string, url: string) {
  const supabase = await createClient()

  console.log(`Adding product image: productId=${productId}, url=${url}`)

  // Get current max order
  const { data: maxOrder, error: maxOrderError } = await supabase
    .from('product_images')
    .select('display_order')
    .eq('product_id', productId)
    .order('display_order', { ascending: false })
    .limit(1)
    .single()

  if (maxOrderError && maxOrderError.code !== 'PGRST116') {
    // PGRST116 = no rows returned, which is fine for first image
    console.error('Error getting max order:', maxOrderError)
  }

  const nextOrder = (maxOrder?.display_order ?? -1) + 1
  console.log(`Next display order: ${nextOrder}`)

  const { data, error } = await supabase
    .from('product_images')
    .insert({
      product_id: productId,
      url,
      display_order: nextOrder
    })
    .select()
    .single()

  if (error) {
    console.error('Error inserting product image:', error)
    throw new Error(error.message)
  }

  console.log('Successfully inserted product image:', data)
  
  // If this is the first image, set it as thumbnail
  if (nextOrder === 0) {
    await supabase
      .from('products')
      .update({ thumbnail: url })
      .eq('id', productId)
  }

  revalidatePath(`/admin/products/${productId}`)
  revalidatePath('/store')
  return data
}

export async function reorderProductImages(items: { id: string; display_order: number }[]) {
  const supabase = await createClient()
  const productId = (await supabase.from('product_images').select('product_id').eq('id', items[0].id).single()).data?.product_id

  // Batch update using Promise.all for better performance
  await Promise.all(
    items.map(item =>
      supabase
        .from('product_images')
        .update({ display_order: item.display_order })
        .eq('id', item.id)
    )
  )

  if (productId) {
    // Update thumbnail to the first image in the new order
    const { data: firstImage } = await supabase
        .from('product_images')
        .select('url')
        .eq('product_id', productId)
        .order('display_order', { ascending: true })
        .limit(1)
        .single()
        
    if (firstImage) {
        await supabase.from('products').update({ thumbnail: firstImage.url }).eq('id', productId)
    }
  }

  revalidatePath('/admin/products')
  revalidatePath('/store')
}

export async function removeProductImage(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('product_images')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  
  revalidatePath('/admin/products')
  revalidatePath('/store')
}

export async function getProductImages(productId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching product images:', error)
    return []
  }

  console.log(`Fetched ${data?.length || 0} images for product ${productId}`)
  return data as ProductImage[] || []
}


