'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { normalizeSlug } from '@/lib/slug'

export async function upsertProject(formData: FormData) {
  const supabase = await createClient()
  
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category_id = formData.get('category_id') as string
  const year = formData.get('year') as string
  const is_published = formData.get('is_published') === 'on'
  const is_featured = formData.get('is_featured') === 'on'
  const meta_title = (formData.get('meta_title') as string) || null
  const meta_description = (formData.get('meta_description') as string) || null
  const og_image = (formData.get('og_image') as string) || null
  
  // Auto-generate slug from title if not provided
  let slug = formData.get('slug') as string
  slug = normalizeSlug(slug || title)

  const projectData = {
    title,
    slug,
    description,
    category_id: category_id || null,
    year,
    is_published,
    is_featured,
    meta_title,
    meta_description,
    og_image,
    updated_at: new Date().toISOString(),
  }

  let result
  
  if (id && id !== 'new') {
    // Update existing
    result = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', id)
      .select()
      .single()
  } else {
    // Insert new
    result = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single()
  }

  if (result.error) {
    return { error: result.error.message }
  }

  // Revalidate affected paths
  revalidatePath('/admin/projects')
  revalidatePath(`/admin/projects/${result.data.id}`)
  revalidatePath('/work')
  
  return { success: true, data: result.data }
}


