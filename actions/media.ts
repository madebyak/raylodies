'use server'

import { createClient } from '@/lib/supabase/server'
import { ProjectMedia } from '@/types/database'
import { revalidatePath } from 'next/cache'
import { deleteStorageObject, parseSupabasePublicObjectUrl } from '@/lib/supabase/storage'

type AddProjectMediaMeta = {
  width?: number | null
  height?: number | null
  poster_url?: string | null
}

// Note: Thumbnail is now managed independently via ThumbnailUploader in admin.
// It no longer auto-syncs from the first media item.

function getErrorCode(err: unknown): string | null {
  if (!err || typeof err !== 'object') return null
  const code = (err as Record<string, unknown>).code
  return typeof code === 'string' ? code : null
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

  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath('/work')
  revalidatePath('/')
  return data
}

export async function reorderProjectMedia(items: { id: string; display_order: number }[]) {
  const supabase = await createClient()
  if (!items || items.length === 0) return

  // Batch update using Promise.all for better performance
  await Promise.all(
    items.map(item =>
      supabase
        .from('project_media')
        .update({ display_order: item.display_order })
        .eq('id', item.id)
    )
  )

  revalidatePath('/admin/projects')
  revalidatePath('/work')
  revalidatePath('/')
}

export async function removeProjectMedia(id: string) {
  const supabase = await createClient()

  // Fetch before delete so we can attempt storage cleanup (media + poster).
  const { data: existing, error: fetchErr } = await supabase
    .from('project_media')
    .select('project_id, url, poster_url')
    .eq('id', id)
    .maybeSingle()

  if (fetchErr && getErrorCode(fetchErr) !== 'PGRST116') {
    console.warn('Failed to fetch media before delete:', fetchErr)
  }

  const { error } = await supabase
    .from('project_media')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  // Best-effort: delete storage objects if URLs are Supabase public-assets objects.
  for (const candidate of [existing?.url, existing?.poster_url]) {
    if (!candidate || typeof candidate !== 'string') continue
    const parsed = parseSupabasePublicObjectUrl(candidate)
    if (!parsed) continue
    if (parsed.bucket !== 'public-assets') continue
    const res = await deleteStorageObject(parsed.bucket, parsed.path)
    if (res.error) console.warn('Storage cleanup failed (project media):', res.error)
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



