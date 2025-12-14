"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertProduct } from "@/actions/product-editor";
import Button from "@/components/ui/Button";
import Input, { Textarea, Select } from "@/components/ui/Input";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import FileUploader from "./FileUploader";
import MediaUploader from "../projects/MediaUploader"; // Reusing the visual media uploader
import { Product, Category } from "@/types/database";

export default function ProductForm({ 
  initialData, 
  categories 
}: { 
  initialData?: Partial<Product>, 
  categories: Category[] 
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const isNew = !initialData?.id;

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
      </div>

      <form action={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#050505] border border-white/5 rounded-xl p-6 space-y-6">
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

            {!isNew && (
              <div className="bg-[#050505] border border-white/5 rounded-xl p-6 space-y-6">
                <h3 className="text-lg font-light text-white mb-4">Digital File</h3>
                <p className="text-sm text-white/40 mb-4">
                  Upload the .zip file that customers will receive after purchase.
                  This file is stored securely and only accessible via signed URLs.
                </p>
                <FileUploader 
                  productId={initialData?.id!} 
                  currentFile={initialData?.file_url || null} 
                />
              </div>
            )}
            
            {/* Gallery Uploader Placeholder - Reusing MediaUploader logic for product images would be similar */}
             {!isNew && (
              <div className="bg-[#050505] border border-white/5 rounded-xl p-6 space-y-6">
                 <h3 className="text-lg font-light text-white mb-4">Product Gallery</h3>
                 <p className="text-sm text-white/40 mb-4">Visuals for the product page.</p>
                 <MediaUploader 
                    projectId={initialData?.id!} // Using same component but technically should be product context
                    onUploadComplete={() => toast.success("Image uploaded (Demo)")}
                 />
              </div>
             )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-[#050505] border border-white/5 rounded-xl p-6 space-y-6">
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

              <div className="pt-4 border-t border-white/5 space-y-4">
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

              <div className="pt-4 border-t border-white/5">
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm text-white/60 group-hover:text-white transition-colors">Published</span>
                  <input 
                    type="checkbox" 
                    name="is_published" 
                    defaultChecked={initialData?.is_published}
                    className="accent-white w-4 h-4"
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
                  Save first to upload files
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
