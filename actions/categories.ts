'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { Category } from '@/types/database'

// Get all categories
export const getCategories = cache(async () => {
  const supabase = await createClient()
  
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('type', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return categories as Category[]
})

// Get categories by type
export const getCategoriesByType = cache(async (type: 'project' | 'product') => {
  const supabase = await createClient()
  
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .eq('type', type)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return categories as Category[]
})

// Create a new category
export async function createCategory(formData: FormData): Promise<{ data?: Category; error?: string }> {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const type = formData.get('type') as 'project' | 'product'
  
  if (!name || !type) {
    return { error: 'Name and type are required' }
  }

  // Generate slug from name
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name,
      slug,
      type
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating category:', error)
    if (error.code === '23505') {
      return { error: 'A category with this name already exists' }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/admin/projects')
  revalidatePath('/admin/products')
  return { data }
}

// Update a category
export async function updateCategory(id: string, formData: FormData): Promise<{ data?: Category; error?: string }> {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  
  if (!name) {
    return { error: 'Name is required' }
  }

  // Generate new slug from name
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const { data, error } = await supabase
    .from('categories')
    .update({ name, slug })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating category:', error)
    if (error.code === '23505') {
      return { error: 'A category with this name already exists' }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/admin/projects')
  revalidatePath('/admin/products')
  revalidatePath('/work')
  revalidatePath('/store')
  return { data }
}

// Delete a category
export async function deleteCategory(id: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  
  // Check if category is in use
  const { data: projectsUsingCategory } = await supabase
    .from('projects')
    .select('id')
    .eq('category_id', id)
    .limit(1)

  const { data: productsUsingCategory } = await supabase
    .from('products')
    .select('id')
    .eq('category_id', id)
    .limit(1)

  if ((projectsUsingCategory && projectsUsingCategory.length > 0) || 
      (productsUsingCategory && productsUsingCategory.length > 0)) {
    return { error: 'Cannot delete category that is in use by projects or products' }
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting category:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/admin/projects')
  revalidatePath('/admin/products')
  return { success: true }
}
