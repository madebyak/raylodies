"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { upsertProduct } from "@/actions/product-editor";
import { addProductImage, getProductImages, removeProductImage, reorderProductImages } from "@/actions/product-images";
import Button from "@/components/ui/Button";
import Input, { Textarea, Select } from "@/components/ui/Input";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import FileUploader from "./FileUploader";
import ProductImageUploader from "./ProductImageUploader";
import SortableProductImage from "./SortableProductImage";
import { Product, Category, ProductImage } from "@/types/database";

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

export default function ProductForm({ 
  initialData, 
  categories 
}: { 
  initialData?: Partial<Product>, 
  categories: Category[] 
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [imageItems, setImageItems] = useState<ProductImage[]>([]);
  const isNew = !initialData?.id;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load images on mount
  useEffect(() => {
    if (initialData?.id) {
      getProductImages(initialData.id).then(setImageItems);
    }
  }, [initialData?.id]);

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    if (initialData?.id) formData.append('id', initialData.id);

    const result = await upsertProduct(formData);
    
    setIsSaving(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Product saved successfully");
      if (isNew) {
        router.push(`/admin/products/${result.data.id}`);
      } else {
        router.refresh();
      }
    }
  }

  async function handleImageUpload(url: string) {
    if (!initialData?.id) return;
    try {
      const newItem = await addProductImage(initialData.id, url);
      setImageItems(prev => [...prev, newItem]);
      toast.success("Image added");
    } catch {
      toast.error("Failed to add image to DB");
    }
  }

  async function handleRemoveImage(id: string) {
    setImageItems(prev => prev.filter(item => item.id !== id));
    try {
      await removeProductImage(id);
      toast.success("Image removed");
    } catch {
      toast.error("Failed to remove image");
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setImageItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Save new order to DB
        reorderProductImages(newItems.map((item, index) => ({
          id: item.id,
          display_order: index
        }))).catch(() => toast.error("Failed to save order"));

        return newItems;
      });
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 hover:bg-white/5 rounded-full text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-light text-white">
              {isNew ? "New Product" : "Edit Product"}
            </h1>
            <p className="text-sm text-white/40">
              {isNew ? "Add a new item to your store" : `Editing ${initialData?.title}`}
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
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#050505] border border-white/10 rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-light text-white mb-4">Product Details</h3>
              
              <Input
                name="title"
                label="Product Title"
                defaultValue={initialData?.title}
                placeholder="e.g. Cinematic Presets V1"
                required
              />
              
              <Input
                name="slug"
                label="Slug"
                defaultValue={initialData?.slug}
                className="font-mono text-white/60"
              />
              
              <Textarea
                name="description"
                label="Description"
                defaultValue={initialData?.description || ''}
                rows={6}
              />
            </div>

            {/* Digital File */}
            <div className="bg-[#050505] border border-white/10 rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-light text-white mb-4">Digital File</h3>
              <p className="text-sm text-white/40 mb-4">
                Upload the .zip file that customers will receive after purchase.
                This file is stored securely and only accessible via signed URLs.
              </p>
              
              {isNew ? (
                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center opacity-50 cursor-not-allowed">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                      <Save className="w-6 h-6 text-white/20" />
                    </div>
                    <p className="text-sm text-white/40">Save product first to upload files</p>
                  </div>
                </div>
              ) : initialData?.id ? (
                <FileUploader 
                  productId={initialData.id} 
                  currentFile={initialData?.file_url || null} 
                />
              ) : null}
            </div>
            
            {/* Product Gallery */}
            <div className="bg-[#050505] border border-white/10 rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-light text-white">Product Gallery</h3>
                {!isNew && <span className="text-xs text-white/40">Drag to reorder • First image = thumbnail</span>}
              </div>
              
              {isNew ? (
                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center opacity-50 cursor-not-allowed">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                      <Save className="w-6 h-6 text-white/20" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-white/40 font-medium">
                        Save product first to upload images
                      </p>
                      <p className="text-xs text-white/30">
                        Fill in the product details and save to enable uploads
                      </p>
                    </div>
                  </div>
                </div>
              ) : initialData?.id ? (
                <>
                  <ProductImageUploader 
                    productId={initialData.id} 
                    onUploadComplete={handleImageUpload}
                  />
                  
                  <DndContext 
                    sensors={sensors} 
                    collisionDetection={closestCenter} 
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={imageItems.map(i => i.id)} strategy={rectSortingStrategy}>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {imageItems.map((item) => (
                          <SortableProductImage 
                            key={item.id} 
                            id={item.id} 
                            item={item} 
                            onRemove={handleRemoveImage} 
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  
                  {imageItems.length === 0 && (
                    <p className="text-sm text-white/30 text-center py-4">
                      No images yet. Upload images to showcase your product.
                    </p>
                  )}
                </>
              ) : null}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-[#050505] border border-white/10 rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-light text-white mb-4">Pricing & Category</h3>
              
              <Input
                name="price"
                type="number"
                step="0.01"
                label="Price (USD)"
                defaultValue={initialData?.price}
                required
              />
              
              <Select
                name="category_id"
                label="Category"
                defaultValue={initialData?.category_id || ''}
                options={[
                  { value: '', label: 'Select Category' },
                  ...categories.map(c => ({ value: c.id, label: c.name }))
                ]}
              />

              <div className="pt-4 border-t border-white/10 space-y-4">
                <h4 className="text-sm font-medium text-white">Paddle Integration</h4>
                <Input
                  name="paddle_product_id"
                  label="Paddle Product ID"
                  placeholder="pro_..."
                  defaultValue={initialData?.paddle_product_id || ''}
                  className="font-mono text-xs"
                />
                <Input
                  name="paddle_price_id"
                  label="Paddle Price ID"
                  placeholder="pri_..."
                  defaultValue={initialData?.paddle_price_id || ''}
                  className="font-mono text-xs"
                />
              </div>

              <div className="pt-4 border-t border-white/10">
                <label className="flex items-center justify-between cursor-pointer group p-3 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/[0.02] transition-all">
                  <div className="flex flex-col">
                    <span className="text-sm text-white/80 group-hover:text-white transition-colors">Published</span>
                    <span className="text-xs text-white/40">Visible in store</span>
                  </div>
                  <input 
                    type="checkbox" 
                    name="is_published" 
                    defaultChecked={initialData?.is_published}
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
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {isSaving ? 'Saving...' : 'Save Product'}
              </Button>
              {isNew && (
                <p className="text-xs text-white/40 text-center mt-4">
                  Save first to upload files and images
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
