'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function upsertProduct(formData: FormData) {
  const supabase = await createClient()
  
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category_id = formData.get('category_id') as string
  const price = parseFloat(formData.get('price') as string)
  const paddle_product_id = formData.get('paddle_product_id') as string
  const paddle_price_id = formData.get('paddle_price_id') as string
  const is_published = formData.get('is_published') === 'on'
  
  // Auto-generate slug from title if not provided
  let slug = formData.get('slug') as string
  if (!slug) {
    slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  const productData = {
    title,
    slug,
    description,
    price,
    category_id: category_id || null,
    paddle_product_id,
    paddle_price_id,
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
  
  return { success: true, data: result.data }
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
