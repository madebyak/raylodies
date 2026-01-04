'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { syncProductWithPaddle } from '@/lib/paddle/server'
import { normalizeSlug } from '@/lib/slug'
import { createAdminClient } from '@/lib/supabase/admin'

function getErrorCode(err: unknown): string | null {
  if (!err || typeof err !== 'object') return null
  const code = (err as Record<string, unknown>).code
  return typeof code === 'string' ? code : null
}

async function generateUniqueProductSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  baseInput: string,
  excludeId?: string
) {
  const base = normalizeSlug(baseInput)
  if (!base) return ''

  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`
    const q = supabase.from('products').select('id').eq('slug', candidate)
    const { data, error } = excludeId ? await q.neq('id', excludeId).maybeSingle() : await q.maybeSingle()
    if (!data) return candidate
    if (error && getErrorCode(error) !== 'PGRST116') {
      console.warn('Slug check error:', error)
    }
  }

  throw new Error('Failed to generate a unique slug. Please try a different title.')
}

export async function upsertProduct(formData: FormData) {
  const supabase = await createClient()
  
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category_id = formData.get('category_id') as string
  const price = parseFloat(formData.get('price') as string)
  const is_published = formData.get('is_published') === 'on'
  const meta_title = (formData.get('meta_title') as string) || null
  const meta_description = (formData.get('meta_description') as string) || null
  const og_image = (formData.get('og_image') as string) || null
  
  // Slug policy:
  // - Create: auto-generate from title and ensure uniqueness
  // - Edit: keep existing slug stable (we no longer expose slug editing in the admin UI)
  const isEdit = Boolean(id && id !== 'new')
  let slug = ''
  let existingDbPrice: number | null = null

  // Get existing Paddle IDs if updating
  let existingPaddleProductId: string | null = null
  let existingPaddlePriceId: string | null = null
  
  if (id && id !== 'new') {
    const { data: existing } = await supabase
      .from('products')
      .select('paddle_product_id, paddle_price_id, slug, price')
      .eq('id', id)
      .single()
    
    existingPaddleProductId = existing?.paddle_product_id || null
    existingPaddlePriceId = existing?.paddle_price_id || null
    slug = existing?.slug || (await generateUniqueProductSlug(supabase, title, id))
    existingDbPrice = typeof existing?.price === 'number' ? existing.price : null
  }
  if (!isEdit) {
    slug = await generateUniqueProductSlug(supabase, title)
  }

  // Sync with Paddle - create/update product and price
  const paddleResult = await syncProductWithPaddle({
    existingPaddleProductId,
    existingPaddlePriceId,
    name: title,
    description,
    price,
    updatePrice: existingDbPrice === null ? true : existingDbPrice !== price,
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
    meta_title,
    meta_description,
    og_image,
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = user?.app_metadata?.role === 'super_admin'
  if (!user || !isAdmin) {
    return { error: 'Unauthorized' }
  }
  const admin = createAdminClient()
  
  const file = formData.get('file') as File
  const fileName = `products/${productId}/${file.name}`
  
  // Upload to private bucket 'product-files'
  const { error } = await admin.storage
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

/**
 * Prefer this for admin UI: upload the file directly to Supabase Storage from the client,
 * then call this action to persist the storage path on the product.
 * This avoids Next.js Server Actions request body limits for large files.
 */
export async function setProductFilePath(productId: string, filePath: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = user?.app_metadata?.role === 'super_admin'
  if (!user || !isAdmin) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('products')
    .update({ file_url: filePath })
    .eq('id', productId)

  if (error) return { error: error.message }

  revalidatePath('/admin/products')
  revalidatePath(`/admin/products/${productId}`)
  revalidatePath('/store')
  return { success: true }
}


