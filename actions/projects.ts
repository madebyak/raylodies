'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { createPublicClient } from '@/lib/supabase/public'
import type { ProjectListItem } from '@/types/database'

type CategoryRow = { id: string; name: string; slug: string; type: 'project' | 'product' }
type CategoryJoin = CategoryRow | CategoryRow[] | null

function firstCategory(value: CategoryJoin): ProjectListItem['categories'] {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

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
  const supabase = createPublicClient()
  
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      slug,
      year,
      thumbnail,
      thumbnail_width,
      thumbnail_height,
      display_order,
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

  type ProjectRow = ProjectListItem & { categories: CategoryJoin; thumbnail_width?: number | null; thumbnail_height?: number | null }

  return (projects as unknown as ProjectRow[]).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    year: p.year ?? null,
    thumbnail: p.thumbnail ?? null,
    thumbnail_width: p.thumbnail_width ?? null,
    thumbnail_height: p.thumbnail_height ?? null,
    categories: firstCategory(p.categories),
  })) satisfies ProjectListItem[]
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
  revalidatePath('/')
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
  revalidatePath('/')
}

// Get featured projects for homepage
export const getFeaturedProjects = cache(async (limit: number = 4) => {
  const supabase = createPublicClient()
  
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      slug,
      year,
      thumbnail,
      thumbnail_width,
      thumbnail_height,
      display_order,
      categories (
        id,
        name,
        slug,
        type
      )
    `)
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Error fetching featured projects:', error)
    return []
  }

  type ProjectRow = ProjectListItem & { categories: CategoryJoin; thumbnail_width?: number | null; thumbnail_height?: number | null }

  return (projects as unknown as ProjectRow[]).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    year: p.year ?? null,
    thumbnail: p.thumbnail ?? null,
    thumbnail_width: p.thumbnail_width ?? null,
    thumbnail_height: p.thumbnail_height ?? null,
    categories: firstCategory(p.categories),
  })) satisfies ProjectListItem[]
})


