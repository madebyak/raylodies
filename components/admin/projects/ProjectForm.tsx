"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { upsertProject } from "@/actions/project-editor";
import {
  addProjectMedia,
  getProjectMedia,
  removeProjectMedia,
  reorderProjectMedia,
} from "@/actions/media";
import { deleteProject } from "@/actions/projects";
import {
  updateProjectThumbnail,
  removeProjectThumbnail,
} from "@/actions/project-thumbnail";
import Button from "@/components/ui/Button";
import Input, { Textarea, Select } from "@/components/ui/Input";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import MediaUploader from "./MediaUploader";
import SortableMediaItem from "./SortableMediaItem";
import ThumbnailUploader from "./ThumbnailUploader";
import { Project, Category, ProjectMedia } from "@/types/database";

import {
  DndContext,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

export default function ProjectForm({
  initialData,
  categories,
}: {
  initialData?: Partial<Project>;
  categories: Category[];
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [mediaItems, setMediaItems] = useState<ProjectMedia[]>([]);
  const isNew = !initialData?.id;
  const [isDeleting, setIsDeleting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Load media on mount
  useEffect(() => {
    if (initialData?.id) {
      getProjectMedia(initialData.id).then(setMediaItems);
    }
  }, [initialData?.id]);

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    if (initialData?.id) formData.append("id", initialData.id);

    const result = await upsertProject(formData);

    setIsSaving(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Project saved successfully");
      if (isNew) {
        router.push(`/admin/projects/${result.data.id}`);
      } else {
        router.refresh();
      }
    }
  }

  async function handleMediaUpload(
    url: string,
    type: "image" | "video",
    meta?: {
      width?: number | null;
      height?: number | null;
      poster_url?: string | null;
    },
  ) {
    if (!initialData?.id) return;
    try {
      const newItem = await addProjectMedia(initialData.id, url, type, meta);
      setMediaItems((prev) => [...prev, newItem]);
      toast.success("Media added");
    } catch {
      toast.error("Failed to add media to DB");
    }
  }

  async function handleRemoveMedia(id: string) {
    setMediaItems((prev) => prev.filter((item) => item.id !== id));
    try {
      await removeProjectMedia(id);
      toast.success("Media removed");
    } catch {
      toast.error("Failed to remove media");
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over?.id) {
      setMediaItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        if (oldIndex === -1 || newIndex === -1) return items;

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Save new order to DB
        reorderProjectMedia(
          newItems.map((item, index) => ({
            id: item.id,
            display_order: index,
          })),
        ).catch(() => toast.error("Failed to save order"));

        return newItems;
      });
    }
  }

  async function handleDeleteProject() {
    if (!initialData?.id) return;
    const ok = window.confirm("Delete this project? This cannot be undone.");
    if (!ok) return;
    setIsDeleting(true);
    try {
      await deleteProject(initialData.id);
      toast.success("Project deleted");
      router.push("/admin/projects");
      router.refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error(`Failed to delete project: ${msg}`);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleThumbnailUpload(
    url: string,
    width: number,
    height: number,
  ) {
    if (!initialData?.id) return;
    try {
      const result = await updateProjectThumbnail(
        initialData.id,
        url,
        width,
        height,
      );
      if (result.error) {
        toast.error(result.error);
      } else {
        router.refresh();
      }
    } catch {
      toast.error("Failed to update thumbnail");
    }
  }

  async function handleThumbnailRemove() {
    if (!initialData?.id) return;
    try {
      const result = await removeProjectThumbnail(initialData.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Thumbnail removed");
        router.refresh();
      }
    } catch {
      toast.error("Failed to remove thumbnail");
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/projects"
            className="p-2 hover:bg-white/5 rounded-full text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-light text-white">
              {isNew ? "New Project" : "Edit Project"}
            </h1>
            <p className="text-sm text-white/40">
              {isNew
                ? "Create a new portfolio item"
                : `Editing ${initialData?.title}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/5">
            <div
              className={`w-2 h-2 rounded-full ${initialData?.is_published ? "bg-green-500" : "bg-yellow-500"}`}
            />
            <span className="text-sm text-white/60">
              {initialData?.is_published ? "Published" : "Draft"}
            </span>
          </div>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#050505] border border-white/10 rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-light text-white mb-4">
                Basic Information
              </h3>
              <Input
                name="title"
                label="Project Title"
                defaultValue={initialData?.title}
                required
              />
              <div className="space-y-1">
                <p className="text-sm text-white/80">URL</p>
                <p className="text-xs text-white/40 font-mono break-all">
                  {initialData?.slug
                    ? `/work/${initialData.slug}`
                    : "Auto-generated after save (from title)."}
                </p>
              </div>
              <Textarea
                name="description"
                label="Description"
                defaultValue={initialData?.description || ""}
                rows={6}
              />
            </div>

            {/* SEO */}
            <div className="bg-[#050505] border border-white/10 rounded-xl p-6 space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-light text-white">SEO</h3>
                <p className="text-sm text-white/40">
                  These fields control Google title/description and social
                  previews for this project page.
                </p>
              </div>

              <Input
                name="meta_title"
                label="Meta Title"
                defaultValue={initialData?.meta_title || ""}
                placeholder="e.g. Neon Futures | Raylodies"
              />

              <Textarea
                name="meta_description"
                label="Meta Description"
                defaultValue={initialData?.meta_description || ""}
                rows={3}
                placeholder="Aim for ~140–160 characters. Describe the project + category."
              />

              <Input
                name="og_image"
                label="OG Image URL"
                defaultValue={initialData?.og_image || ""}
                placeholder="Optional: full image URL for social sharing (1200x630 recommended)"
              />
            </div>

            {/* Thumbnail Section */}
            <div className="bg-[#050505] border border-white/10 rounded-xl p-6 space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-light text-white">Thumbnail</h3>
                <p className="text-sm text-white/40">
                  This image appears in the work grid and social previews. It
                  won&apos;t show in the project gallery.
                </p>
              </div>

              {isNew ? (
                <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center opacity-50 cursor-not-allowed">
                  <p className="text-sm text-white/40">
                    Save project first to upload thumbnail
                  </p>
                </div>
              ) : initialData?.id ? (
                <ThumbnailUploader
                  projectId={initialData.id}
                  currentThumbnail={initialData.thumbnail || null}
                  onUploadComplete={handleThumbnailUpload}
                  onRemove={handleThumbnailRemove}
                />
              ) : null}
            </div>

            <div className="bg-[#050505] border border-white/10 rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-light text-white">Media Gallery</h3>
                {!isNew && (
                  <span className="text-xs text-white/40">Drag to reorder</span>
                )}
              </div>

              {isNew ? (
                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center opacity-50 cursor-not-allowed">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                      <Save className="w-6 h-6 text-white/20" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-white/40 font-medium">
                        Save project first to upload media
                      </p>
                      <p className="text-xs text-white/30">
                        Fill in the basic information and save to enable uploads
                      </p>
                    </div>
                  </div>
                </div>
              ) : initialData?.id ? (
                <>
                  <MediaUploader
                    projectId={initialData.id}
                    onUploadComplete={handleMediaUpload}
                  />

                  <DndContext
                    sensors={sensors}
                    collisionDetection={rectIntersection}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={mediaItems.map((i) => i.id)}
                      strategy={rectSortingStrategy}
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {mediaItems.map((item) => (
                          <SortableMediaItem
                            key={item.id}
                            id={item.id}
                            item={item}
                            onRemove={handleRemoveMedia}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                  {mediaItems.length === 0 && (
                    <p className="text-sm text-white/30 text-center py-4">
                      No media yet. Upload images or videos to showcase your
                      project.
                    </p>
                  )}
                </>
              ) : null}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#050505] border border-white/10 rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-light text-white mb-4">Settings</h3>
              <Select
                name="category_id"
                label="Category"
                defaultValue={initialData?.category_id || ""}
                options={[
                  { value: "", label: "Select Category" },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
              <Input
                name="year"
                label="Year"
                defaultValue={
                  initialData?.year || new Date().getFullYear().toString()
                }
              />
              <div className="space-y-3 pt-4 border-t border-white/10">
                <label className="flex items-center justify-between cursor-pointer group p-3 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/[0.02] transition-all">
                  <div className="flex flex-col">
                    <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                      Published
                    </span>
                    <span className="text-xs text-white/40">
                      Visible on public pages
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    name="is_published"
                    defaultChecked={initialData?.is_published}
                    className="accent-white w-5 h-5 rounded"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer group p-3 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/[0.02] transition-all">
                  <div className="flex flex-col">
                    <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                      Featured
                    </span>
                    <span className="text-xs text-white/40">
                      Show on homepage
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    name="is_featured"
                    defaultChecked={initialData?.is_featured}
                    className="accent-white w-5 h-5 rounded"
                  />
                </label>
              </div>
            </div>

            <div className="sticky top-24">
              <Button
                type="submit"
                className="w-full flex items-center justify-center gap-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {isSaving ? "Saving..." : "Save Project"}
              </Button>
              {!isNew && initialData?.id && (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full mt-3"
                  onClick={handleDeleteProject}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Project"}
                </Button>
              )}
              {isNew && (
                <p className="text-xs text-white/40 text-center mt-4">
                  Save first to upload media
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
