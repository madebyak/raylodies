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
  thumbnail_width?: number | null
  thumbnail_height?: number | null
  is_featured: boolean
  is_published: boolean
  display_order: number
  meta_title?: string | null
  meta_description?: string | null
  og_image?: string | null
  created_at: string
  updated_at: string
  categories?: Category | null
  // For UI convenience
  category?: Category | null 
}

/**
 * Lightweight shape for list/grid UIs (public pages).
 * Avoids fetching unneeded columns.
 */
export interface ProjectListItem {
  id: string
  title: string
  slug: string
  year: string | null
  thumbnail: string | null
  thumbnail_width?: number | null
  thumbnail_height?: number | null
  categories?: Pick<Category, 'id' | 'name' | 'slug' | 'type'> | null
}

export interface ProjectMedia {
  id: string
  project_id: string
  type: 'image' | 'video'
  url: string
  width?: number | null
  height?: number | null
  poster_url?: string | null
  video_provider?: 'supabase' | 'mux' | 'youtube' | 'vimeo' | 'cloudflare' | null
  display_order: number
}

export interface Product {
  id: string
  title: string
  slug: string
  description: string | null
  price: number
  is_free: boolean
  category_id: string | null
  thumbnail: string | null
  file_url: string | null
  paddle_product_id: string | null
  paddle_price_id: string | null
  is_published: boolean
  meta_title?: string | null
  meta_description?: string | null
  og_image?: string | null
  created_at: string
  updated_at: string
  category?: Category | null
  categories?: Category | null // For join queries
}

/**
 * Lightweight shape for store grid cards.
 */
export interface ProductListItem {
  id: string
  title: string
  slug: string
  price: number
  is_free: boolean
  thumbnail: string | null
  categories?: Pick<Category, 'id' | 'name' | 'slug' | 'type'> | null
  keywords?: string[]
}

export interface ProductEntitlement {
  id: string
  user_id: string
  product_id: string
  source: 'free' | 'admin_grant' | 'migration'
  created_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  display_order: number
}


