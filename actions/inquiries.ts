'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'

export interface Inquiry {
  id: string
  name: string
  email: string
  company: string | null
  project_type: string | null
  budget: string | null
  message: string
  status: string
  created_at: string
}

export const getInquiries = cache(async () => {
  const supabase = await createClient()
  
  const { data: inquiries, error } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching inquiries:', error)
    return []
  }

  return inquiries as Inquiry[]
})

export async function updateInquiryStatus(id: string, status: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('inquiries')
    .update({ status })
    .eq('id', id)

  if (error) {
    console.error('Error updating inquiry status:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/inquiries')
  return { success: true }
}

export async function deleteInquiry(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('inquiries')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting inquiry:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/inquiries')
  return { success: true }
}

export async function getInquiryStats() {
  const supabase = await createClient()
  
  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('status')
  
  if (!inquiries) return { total: 0, new: 0, responded: 0 }
  
  return {
    total: inquiries.length,
    new: inquiries.filter(i => i.status === 'new').length,
    responded: inquiries.filter(i => i.status === 'responded').length,
  }
}



