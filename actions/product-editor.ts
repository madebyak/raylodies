'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { syncProductWithPaddle } from '@/lib/paddle/server'

export async function upsertProduct(formData: FormData) {
  const supabase = await createClient()
  
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category_id = formData.get('category_id') as string
  const price = parseFloat(formData.get('price') as string)
  const is_published = formData.get('is_published') === 'on'
  
  // Auto-generate slug from title if not provided
  let slug = formData.get('slug') as string
  if (!slug) {
    slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  // Get existing Paddle IDs if updating
  let existingPaddleProductId: string | null = null
  let existingPaddlePriceId: string | null = null
  
  if (id && id !== 'new') {
    const { data: existing } = await supabase
      .from('products')
      .select('paddle_product_id, paddle_price_id')
      .eq('id', id)
      .single()
    
    existingPaddleProductId = existing?.paddle_product_id || null
    existingPaddlePriceId = existing?.paddle_price_id || null
  }

  // Sync with Paddle - create/update product and price
  const paddleResult = await syncProductWithPaddle({
    existingPaddleProductId,
    existingPaddlePriceId,
    name: title,
    description,
    price,
  })

  if (paddleResult.error) {
    console.error('Paddle sync failed:', paddleResult.error)
    // Continue without Paddle IDs - admin can manually add later if needed
    // Or return error if Paddle is required:
    // return { error: paddleResult.error }
  }

  const productData = {
    title,
    slug,
    description,
    price,
    category_id: category_id || null,
    paddle_product_id: paddleResult.paddleProductId || existingPaddleProductId || null,
    paddle_price_id: paddleResult.paddlePriceId || existingPaddlePriceId || null,
    is_published,
    updated_at: new Date().toISOString(),
  }

  let result
  
  if (id && id !== 'new') {
    result = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single()
  } else {
    result = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single()
  }

  if (result.error) {
    return { error: result.error.message }
  }

  // Revalidate affected paths
  revalidatePath('/admin/products')
  revalidatePath(`/admin/products/${result.data.id}`)
  revalidatePath('/store')
  
  return { 
    success: true, 
    data: result.data,
    paddleSynced: !!paddleResult.paddleProductId,
    paddleError: paddleResult.error 
  }
}

export async function uploadProductFile(productId: string, formData: FormData) {
  // Use service role for admin operations (uploads to private bucket)
  // Note: For now we use the regular client but ensure the bucket has correct RLS policies
  // Ideally, use the admin client from lib/supabase/admin.ts if RLS blocks regular users completely
  const supabase = await createClient()
  
  const file = formData.get('file') as File
  const fileName = `products/${productId}/${file.name}`
  
  // Upload to private bucket 'product-files'
  const { error } = await supabase.storage
    .from('product-files')
    .upload(fileName, file, {
      upsert: true,
    })
  
  if (error) {
    return { error: error.message }
  }
  
  // Update product with file path
  await supabase
    .from('products')
    .update({ file_url: fileName })
    .eq('id', productId)

  revalidatePath(`/admin/products/${productId}`)
  return { success: true }
}
