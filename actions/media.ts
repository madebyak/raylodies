'use server'

import { createClient } from '@/lib/supabase/server'
import { ProjectMedia } from '@/types/database'
import { revalidatePath } from 'next/cache'

export async function addProjectMedia(projectId: string, url: string, type: 'image' | 'video') {
  const supabase = await createClient()

  console.log(`Adding project media: projectId=${projectId}, type=${type}, url=${url}`)

  // Get current max order
  const { data: maxOrder, error: maxOrderError } = await supabase
    .from('project_media')
    .select('display_order')
    .eq('project_id', projectId)
    .order('display_order', { ascending: false })
    .limit(1)
    .single()

  if (maxOrderError && maxOrderError.code !== 'PGRST116') {
    // PGRST116 = no rows returned, which is fine for first media
    console.error('Error getting max order:', maxOrderError)
  }

  const nextOrder = (maxOrder?.display_order ?? -1) + 1
  console.log(`Next display order: ${nextOrder}`)

  const { data, error } = await supabase
    .from('project_media')
    .insert({
      project_id: projectId,
      url,
      type,
      display_order: nextOrder
    })
    .select()
    .single()

  if (error) {
    console.error('Error inserting project media:', error)
    throw new Error(error.message)
  }

  console.log('Successfully inserted project media:', data)
  
  // If this is the first image, set it as thumbnail
  if (nextOrder === 0 && type === 'image') {
    await supabase
      .from('projects')
      .update({ thumbnail: url })
      .eq('id', projectId)
  }

  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath('/work')
  return data
}

export async function reorderProjectMedia(items: { id: string; display_order: number }[]) {
  const supabase = await createClient()
  const projectId = (await supabase.from('project_media').select('project_id').eq('id', items[0].id).single()).data?.project_id

  // Batch update using Promise.all for better performance
  await Promise.all(
    items.map(item =>
      supabase
        .from('project_media')
        .update({ display_order: item.display_order })
        .eq('id', item.id)
    )
  )

  if (projectId) {
    // Update thumbnail to the first image in the new order
    const { data: firstImage } = await supabase
        .from('project_media')
        .select('url')
        .eq('project_id', projectId)
        .eq('type', 'image')
        .order('display_order', { ascending: true })
        .limit(1)
        .single()
        
    if (firstImage) {
        await supabase.from('projects').update({ thumbnail: firstImage.url }).eq('id', projectId)
    }
  }

  revalidatePath('/admin/projects')
  revalidatePath('/work')
}

export async function removeProjectMedia(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('project_media')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  
  revalidatePath('/admin/projects')
  revalidatePath('/work')
}

export async function getProjectMedia(projectId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('project_media')
    .select('*')
    .eq('project_id', projectId)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching project media:', error)
    return []
  }

  console.log(`Fetched ${data?.length || 0} media items for project ${projectId}`)
  return data as ProjectMedia[] || []
}

