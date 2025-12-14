'use server'

import { createClient } from '@/lib/supabase/server'
import { ProjectMedia } from '@/types/database'
import { revalidatePath } from 'next/cache'

export async function addProjectMedia(projectId: string, url: string, type: 'image' | 'video') {
  const supabase = await createClient()

  // Get current max order
  const { data: maxOrder } = await supabase
    .from('project_media')
    .select('display_order')
    .eq('project_id', projectId)
    .order('display_order', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = (maxOrder?.display_order ?? -1) + 1

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

  if (error) throw new Error(error.message)
  
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
  
  const { data } = await supabase
    .from('project_media')
    .select('*')
    .eq('project_id', projectId)
    .order('display_order', { ascending: true })

  return data as ProjectMedia[] || []
}
