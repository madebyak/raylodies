import { createClient } from "@supabase/supabase-js";

/**
 * Public server-side Supabase client (anon key, no cookies).
 * Use for cacheable/public data reads in Server Components.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
