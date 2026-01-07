"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { normalizeSlug } from "@/lib/slug";

function getErrorCode(err: unknown): string | null {
  if (!err || typeof err !== "object") return null;
  const code = (err as Record<string, unknown>).code;
  return typeof code === "string" ? code : null;
}

async function generateUniqueProjectSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  baseInput: string,
  excludeId?: string,
) {
  const base = normalizeSlug(baseInput);
  if (!base) return "";

  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;

    const q = supabase.from("projects").select("id").eq("slug", candidate);
    const { data, error } = excludeId
      ? await q.neq("id", excludeId).maybeSingle()
      : await q.maybeSingle();

    // If not found => slug is free
    if (!data) return candidate;

    // Ignore unexpected errors and keep trying a new candidate
    if (error && getErrorCode(error) !== "PGRST116") {
      console.warn("Slug check error:", error);
    }
  }

  throw new Error(
    "Failed to generate a unique slug. Please try a different title.",
  );
}

export async function upsertProject(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category_id = formData.get("category_id") as string;
  const year = formData.get("year") as string;
  const is_published = formData.get("is_published") === "on";
  const is_featured = formData.get("is_featured") === "on";
  const meta_title = (formData.get("meta_title") as string) || null;
  const meta_description = (formData.get("meta_description") as string) || null;
  const og_image = (formData.get("og_image") as string) || null;

  // Slug policy:
  // - Create: auto-generate from title and ensure uniqueness
  // - Edit: keep existing slug stable (we no longer expose slug editing in the admin UI)
  const isEdit = Boolean(id && id !== "new");
  let slug = "";
  if (isEdit) {
    const { data: existing } = await supabase
      .from("projects")
      .select("slug")
      .eq("id", id)
      .maybeSingle();
    slug =
      existing?.slug || (await generateUniqueProjectSlug(supabase, title, id));
  } else {
    slug = await generateUniqueProjectSlug(supabase, title);
  }

  const projectData = {
    title,
    slug,
    description,
    category_id: category_id || null,
    year,
    is_published,
    is_featured,
    meta_title,
    meta_description,
    og_image,
    updated_at: new Date().toISOString(),
  };

  let result;

  if (id && id !== "new") {
    // Update existing
    result = await supabase
      .from("projects")
      .update(projectData)
      .eq("id", id)
      .select()
      .single();
  } else {
    // Insert new
    result = await supabase
      .from("projects")
      .insert(projectData)
      .select()
      .single();
  }

  if (result.error) {
    return { error: result.error.message };
  }

  // Revalidate affected paths
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${result.data.id}`);
  revalidatePath("/work");
  revalidatePath("/");

  return { success: true, data: result.data };
}
