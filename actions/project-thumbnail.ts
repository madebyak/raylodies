'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { deleteStorageObject, parseSupabasePublicObjectUrl } from '@/lib/supabase/storage'

export async function updateProjectThumbnail(
  projectId: string,
  thumbnail: string | null,
  thumbnailWidth: number | null,
  thumbnailHeight: number | null
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('projects')
    .update({
      thumbnail,
      thumbnail_width: thumbnailWidth,
      thumbnail_height: thumbnailHeight,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)

  if (error) {
    console.error('Error updating project thumbnail:', error)
    return { error: error.message }
  }

  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath('/work')
  revalidatePath('/')
  return { success: true }
}

export async function removeProjectThumbnail(projectId: string) {
  const supabase = await createClient()

  // Fetch current thumbnail to delete from storage
  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('thumbnail')
    .eq('id', projectId)
    .single()

  if (fetchError) {
    console.error('Error fetching project:', fetchError)
    return { error: fetchError.message }
  }

  // Best-effort: delete from storage if it's a Supabase URL
  if (project?.thumbnail) {
    const parsed = parseSupabasePublicObjectUrl(project.thumbnail)
    if (parsed && parsed.bucket === 'public-assets') {
      const res = await deleteStorageObject(parsed.bucket, parsed.path)
      if (res.error) console.warn('Storage cleanup failed (thumbnail):', res.error)
    }
  }

  const { error } = await supabase
    .from('projects')
    .update({
      thumbnail: null,
      thumbnail_width: null,
      thumbnail_height: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)

  if (error) {
    console.error('Error removing project thumbnail:', error)
    return { error: error.message }
  }

  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath('/work')
  revalidatePath('/')
  return { success: true }
}

