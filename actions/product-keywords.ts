'use server'

import { createClient } from '@/lib/supabase/server'

export async function getProductKeywords(productId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('product_keywords')
    .select('keyword')
    .eq('product_id', productId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching product keywords:', error)
    return []
  }

  return (data || []).map((r) => r.keyword).filter(Boolean)
}

function normalizeKeyword(k: string): string {
  return k.trim().replace(/\s+/g, ' ')
}

export async function setProductKeywords(productId: string, keywords: string[]): Promise<{ success?: true; error?: string }> {
  const supabase = await createClient()
  const cleaned = Array.from(
    new Map(
      keywords
        .map(normalizeKeyword)
        .filter(Boolean)
        .map((k) => [k.toLowerCase(), k] as const)
    ).values()
  )

  const { error: delError } = await supabase
    .from('product_keywords')
    .delete()
    .eq('product_id', productId)

  if (delError) {
    console.error('Error clearing product keywords:', delError)
    return { error: delError.message }
  }

  if (cleaned.length === 0) return { success: true }

  const { error: insError } = await supabase
    .from('product_keywords')
    .insert(cleaned.map((keyword) => ({ product_id: productId, keyword })))

  if (insError) {
    console.error('Error inserting product keywords:', insError)
    return { error: insError.message }
  }

  return { success: true }
}


