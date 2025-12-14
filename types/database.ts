export interface Category {
  id: string
  name: string
  slug: string
  type: 'project' | 'product'
}

export interface Project {
  id: string
  title: string
  slug: string
  description: string | null
  category_id: string | null
  year: string | null
  thumbnail: string | null
  is_featured: boolean
  is_published: boolean
  display_order: number
  created_at: string
  updated_at: string
  categories?: Category | null
  // For UI convenience
  category?: Category | null 
}

export interface ProjectMedia {
  id: string
  project_id: string
  type: 'image' | 'video'
  url: string
  video_provider?: 'supabase' | 'mux' | 'youtube' | 'vimeo' | 'cloudflare' | null
  display_order: number
}

export interface Product {
  id: string
  title: string
  slug: string
  description: string | null
  price: number
  category_id: string | null
  thumbnail: string | null
  file_url: string | null
  paddle_product_id: string | null
  paddle_price_id: string | null
  is_published: boolean
  created_at: string
  updated_at: string
  category?: Category | null
  categories?: Category | null // For join queries
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  display_order: number
}
