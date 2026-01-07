import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Parses Supabase public object URLs into { bucket, path }.
 * Expected format:
 *   https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
 */
export function parseSupabasePublicObjectUrl(
  url: string,
): { bucket: string; path: string } | null {
  try {
    const u = new URL(url);
    const marker = "/storage/v1/object/public/";
    const idx = u.pathname.indexOf(marker);
    if (idx === -1) return null;
    const rest = u.pathname.slice(idx + marker.length); // "<bucket>/<path>"
    const slash = rest.indexOf("/");
    if (slash <= 0) return null;
    const bucket = rest.slice(0, slash);
    const path = decodeURIComponent(rest.slice(slash + 1));
    if (!bucket || !path) return null;
    return { bucket, path };
  } catch {
    return null;
  }
}

/**
 * Best-effort deletion of a storage object.
 * Uses service role key via `createAdminClient()` to bypass RLS.
 */
export async function deleteStorageObject(
  bucket: string,
  path: string,
): Promise<{ success?: true; error?: string }> {
  const admin = createAdminClient();
  const { error } = await admin.storage.from(bucket).remove([path]);
  if (error) return { error: error.message };
  return { success: true };
}
