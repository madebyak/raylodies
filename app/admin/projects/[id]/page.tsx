import ProjectForm from "@/components/admin/projects/ProjectForm";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function ProjectEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  // Fetch Categories for the dropdown
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("type", "project")
    .order("name");

  let project = null;

  if (id !== "new") {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      notFound();
    }
    project = data;
  }

  return (
    <ProjectForm initialData={project || {}} categories={categories || []} />
  );
}
