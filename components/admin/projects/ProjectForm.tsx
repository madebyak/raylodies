"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { upsertProject } from "@/actions/project-editor";
import { addProjectMedia, getProjectMedia, removeProjectMedia, reorderProjectMedia } from "@/actions/media";
import Button from "@/components/ui/Button";
import Input, { Textarea, Select } from "@/components/ui/Input";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import MediaUploader from "./MediaUploader";
import SortableMediaItem from "./SortableMediaItem";
import { Project, Category, ProjectMedia } from "@/types/database";

import {
  DndContext,
  closestCenter,
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
  categories 
}: { 
  initialData?: Partial<Project>, 
  categories: Category[] 
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [mediaItems, setMediaItems] = useState<ProjectMedia[]>([]);
  const isNew = !initialData?.id;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load media on mount
  useEffect(() => {
    if (initialData?.id) {
      getProjectMedia(initialData.id).then(setMediaItems);
    }
  }, [initialData?.id]);

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    if (initialData?.id) formData.append('id', initialData.id);

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

  async function handleMediaUpload(url: string, type: 'image' | 'video') {
    try {
        const newItem = await addProjectMedia(initialData?.id!, url, type);
        setMediaItems(prev => [...prev, newItem]);
        toast.success("Media added");
    } catch (e) {
        toast.error("Failed to add media to DB");
    }
  }

  async function handleRemoveMedia(id: string) {
    setMediaItems(prev => prev.filter(item => item.id !== id));
    try {
        await removeProjectMedia(id);
        toast.success("Media removed");
    } catch (e) {
        toast.error("Failed to remove media");
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setMediaItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Save new order to DB
        reorderProjectMedia(newItems.map((item, index) => ({
            id: item.id,
            display_order: index
        }))).catch(() => toast.error("Failed to save order"));

        return newItems;
      });
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/projects" className="p-2 hover:bg-white/5 rounded-full text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-light text-white">
              {isNew ? "New Project" : "Edit Project"}
            </h1>
            <p className="text-sm text-white/40">
              {isNew ? "Create a new portfolio item" : `Editing ${initialData?.title}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/5">
            <div className={`w-2 h-2 rounded-full ${initialData?.is_published ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-sm text-white/60">
              {initialData?.is_published ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#050505] border border-white/5 rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-light text-white mb-4">Basic Information</h3>
              <Input name="title" label="Project Title" defaultValue={initialData?.title} required />
              <Input name="slug" label="Slug (URL)" defaultValue={initialData?.slug} className="font-mono text-white/60" />
              <Textarea name="description" label="Description" defaultValue={initialData?.description || ''} rows={6} />
            </div>

            {!isNew && (
              <div className="bg-[#050505] border border-white/5 rounded-xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-light text-white">Media Gallery</h3>
                  <span className="text-xs text-white/40">Drag to reorder</span>
                </div>
                
                <MediaUploader projectId={initialData?.id!} onUploadComplete={handleMediaUpload} />
                
                <DndContext 
                  sensors={sensors} 
                  collisionDetection={closestCenter} 
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={mediaItems.map(i => i.id)} strategy={rectSortingStrategy}>
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
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-[#050505] border border-white/5 rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-light text-white mb-4">Settings</h3>
              <Select
                name="category_id"
                label="Category"
                defaultValue={initialData?.category_id || ''}
                options={[{ value: '', label: 'Select Category' }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
              />
              <Input name="year" label="Year" defaultValue={initialData?.year || new Date().getFullYear().toString()} />
              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm text-white/60 group-hover:text-white transition-colors">Published</span>
                  <input type="checkbox" name="is_published" defaultChecked={initialData?.is_published} className="accent-white w-4 h-4" />
                </label>
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm text-white/60 group-hover:text-white transition-colors">Featured</span>
                  <input type="checkbox" name="is_featured" defaultChecked={initialData?.is_featured} className="accent-white w-4 h-4" />
                </label>
              </div>
            </div>

            <div className="sticky top-24">
              <Button type="submit" className="w-full flex items-center justify-center gap-2" disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {isSaving ? 'Saving...' : 'Save Project'}
              </Button>
              {isNew && <p className="text-xs text-white/40 text-center mt-4">Save first to upload media</p>}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
