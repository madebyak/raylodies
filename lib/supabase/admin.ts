import { createClient } from '@supabase/supabase-js'

// Note: This client has FULL ACCESS to your database.
// Only use this in Server Actions or API Routes.
// NEVER use this in Client Components.

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

