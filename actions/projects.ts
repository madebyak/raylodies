'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'

// Memoized version for the same request (React cache)
// For admin pages - uses authenticated client
export const getProjects = cache(async () => {
  const supabase = await createClient()
  
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *,
      categories (
        id,
        name,
        slug,
        type
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return projects
})

// Get published projects only (for public pages)
// Uses the same client but filters for published only
export const getPublishedProjects = cache(async () => {
  const supabase = await createClient()
  
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *,
      categories (
        id,
        name,
        slug,
        type
      )
    `)
    .eq('is_published', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching published projects:', error)
    return []
  }

  return projects
})

export async function deleteProject(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting project:', error)
    return
  }

  revalidatePath('/admin/projects')
  revalidatePath('/work')
}

export async function toggleProjectStatus(id: string, currentStatus: boolean): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('projects')
    .update({ is_published: !currentStatus })
    .eq('id', id)

  if (error) {
    console.error('Error toggling project status:', error)
    return
  }

  revalidatePath('/admin/projects')
  revalidatePath('/work')
}
