'use server'

import { createClient } from '@/lib/supabase/server'
import { ProjectMedia } from '@/types/database'
import { revalidatePath } from 'next/cache'

type AddProjectMediaMeta = {
  width?: number | null
  height?: number | null
  poster_url?: string | null
}

function getErrorCode(err: unknown): string | null {
  if (!err || typeof err !== 'object') return null
  const code = (err as Record<string, unknown>).code
  return typeof code === 'string' ? code : null
}

async function syncProjectThumbnailFromFirstMedia(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string
) {
  const { data: first, error } = await supabase
    .from('project_media')
    .select('type,url,poster_url,width,height')
    .eq('project_id', projectId)
    .order('display_order', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error && getErrorCode(error) !== 'PGRST116') {
    console.error('Error selecting first media:', error)
  }

  if (!first) {
    await supabase
      .from('projects')
      .update({ thumbnail: null, thumbnail_width: null, thumbnail_height: null })
      .eq('id', projectId)
    return
  }

  const thumb =
    first.type === 'image'
      ? first.url
      : first.poster_url

  await supabase
    .from('projects')
    .update({
      thumbnail: thumb ?? null,
      thumbnail_width: first.width ?? null,
      thumbnail_height: first.height ?? null,
    })
    .eq('id', projectId)
}

export async function addProjectMedia(
  projectId: string,
  url: string,
  type: 'image' | 'video',
  meta?: AddProjectMediaMeta
) {
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
      display_order: nextOrder,
      width: meta?.width ?? null,
      height: meta?.height ?? null,
      poster_url: meta?.poster_url ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error inserting project media:', error)
    throw new Error(error.message)
  }

  console.log('Successfully inserted project media:', data)
  
  // Keep thumbnail always in sync with the *first* media item (image or video poster)
  await syncProjectThumbnailFromFirstMedia(supabase, projectId)

  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath('/work')
  revalidatePath('/')
  return data
}

export async function reorderProjectMedia(items: { id: string; display_order: number }[]) {
  const supabase = await createClient()
  if (!items || items.length === 0) return
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
    await syncProjectThumbnailFromFirstMedia(supabase, projectId)
  }

  revalidatePath('/admin/projects')
  revalidatePath('/work')
  revalidatePath('/')
}

export async function removeProjectMedia(id: string) {
  const supabase = await createClient()
  
  const { data: deleted, error } = await supabase
    .from('project_media')
    .delete()
    .eq('id', id)
    .select('project_id')
    .maybeSingle()

  if (error) throw new Error(error.message)
  
  if (deleted?.project_id) {
    await syncProjectThumbnailFromFirstMedia(supabase, deleted.project_id)
  }

  revalidatePath('/admin/projects')
  revalidatePath('/work')
  revalidatePath('/')
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



