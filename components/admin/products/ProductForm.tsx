"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { upsertProduct } from "@/actions/product-editor";
import {
  addProductImage,
  getProductImages,
  removeProductImage,
  reorderProductImages,
} from "@/actions/product-images";
import {
  getProductKeywords,
  setProductKeywords,
} from "@/actions/product-keywords";
import { deleteProduct } from "@/actions/products";
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
  categories,
}: {
  initialData?: Partial<Product>;
  categories: Category[];
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageItems, setImageItems] = useState<ProductImage[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [isFree, setIsFree] = useState<boolean>(
    Boolean(initialData?.is_free) || initialData?.price === 0,
  );
  const [priceValue, setPriceValue] = useState<string>(() => {
    if (Boolean(initialData?.is_free)) return "0";
    if (typeof initialData?.price === "number")
      return String(initialData.price);
    return "";
  });
  const isNew = !initialData?.id;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Load images on mount
  useEffect(() => {
    if (initialData?.id) {
      getProductImages(initialData.id).then(setImageItems);
    }
  }, [initialData?.id]);

  // Load keywords on mount
  useEffect(() => {
    if (initialData?.id) {
      getProductKeywords(initialData.id).then(setKeywords);
    }
  }, [initialData?.id]);

  function addKeyword(raw: string) {
    const k = raw.trim().replace(/\s+/g, " ");
    if (!k) return;
    setKeywords((prev) => {
      const lower = new Set(prev.map((x) => x.toLowerCase()));
      if (lower.has(k.toLowerCase())) return prev;
      return [...prev, k];
    });
    setKeywordInput("");
  }

  function removeKeyword(k: string) {
    setKeywords((prev) => prev.filter((x) => x !== k));
  }

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    if (initialData?.id) formData.append("id", initialData.id);

    const result = await upsertProduct(formData);

    setIsSaving(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      // Save keywords (existing products only). For new products we redirect, so save on next edit.
      if (!isNew && result.data?.id) {
        const kwResult = await setProductKeywords(result.data.id, keywords);
        if (kwResult.error) {
          toast.warning(
            `Product saved, but keywords failed: ${kwResult.error}`,
          );
        }
      }

      // Show appropriate message based on Paddle sync status
      if (result.paddleSynced) {
        toast.success("Product saved & synced with Paddle");
      } else if (result.paddleError) {
        toast.warning(
          `Product saved, but Paddle sync failed: ${result.paddleError}`,
        );
      } else {
        toast.success("Product saved successfully");
      }

      if (isNew) {
        router.push(`/admin/products/${result.data.id}`);
      } else {
        router.refresh();
      }
    }
  }

  async function handleDeleteProduct() {
    if (!initialData?.id) return;
    const ok = window.confirm(
      "Delete this product?\n\nIf it has purchases, it will be archived (unpublished) instead.",
    );
    if (!ok) return;
    setIsDeleting(true);
    try {
      const res = await deleteProduct(initialData.id);
      if (res?.error) throw new Error(res.error);
      toast.success(
        res?.archived ? "Product archived (unpublished)" : "Product deleted",
      );
      router.push("/admin/products");
      router.refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error(`Failed to delete product: ${msg}`);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleImageUpload(url: string) {
    if (!initialData?.id) return;
    try {
      const newItem = await addProductImage(initialData.id, url);
      setImageItems((prev) => [...prev, newItem]);
      toast.success("Image added");
    } catch {
      toast.error("Failed to add image to DB");
    }
  }

  async function handleRemoveImage(id: string) {
    setImageItems((prev) => prev.filter((item) => item.id !== id));
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
        reorderProductImages(
          newItems.map((item, index) => ({
            id: item.id,
            display_order: index,
          })),
        ).catch(() => toast.error("Failed to save order"));

        return newItems;
      });
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2 hover:bg-white/5 rounded-full text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-light text-white">
              {isNew ? "New Product" : "Edit Product"}
            </h1>
            <p className="text-sm text-white/40">
              {isNew
                ? "Add a new item to your store"
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
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#050505] border border-white/10 rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-light text-white mb-4">
                Product Details
              </h3>

              <Input
                name="title"
                label="Product Title"
                defaultValue={initialData?.title}
                placeholder="e.g. Cinematic Presets V1"
                required
              />
              <div className="space-y-1">
                <p className="text-sm text-white/80">URL</p>
                <p className="text-xs text-white/40 font-mono break-all">
                  {initialData?.slug
                    ? `/store/${initialData.slug}`
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

            {/* Keywords */}
            <div className="bg-[#050505] border border-white/10 rounded-xl p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-light text-white">Keywords</h3>
                <p className="text-sm text-white/40">
                  Add tags to help customers search products by topic.
                </p>
              </div>

              {isNew ? (
                <div className="text-sm text-white/30">
                  Save the product first to add keywords.
                </div>
              ) : (
                <>
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <Input
                        name="keyword_input"
                        label="Add keyword"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        placeholder="e.g. presets, cinematic, sora, runway"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-11 px-5"
                      onClick={() => addKeyword(keywordInput)}
                    >
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {keywords.length === 0 ? (
                      <span className="text-xs text-white/30">
                        No keywords yet.
                      </span>
                    ) : (
                      keywords.map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => removeKeyword(k)}
                          className="px-3 py-1.5 text-xs text-white/70 border border-white/10 hover:border-white/30 hover:text-white transition-colors"
                          title="Click to remove"
                        >
                          {k}
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            {/* SEO */}
            <div className="bg-[#050505] border border-white/10 rounded-xl p-6 space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-light text-white">SEO</h3>
                <p className="text-sm text-white/40">
                  These fields control Google title/description and social
                  previews for this product page.
                </p>
              </div>

              <Input
                name="meta_title"
                label="Meta Title"
                defaultValue={initialData?.meta_title || ""}
                placeholder="e.g. Cinematic Presets V1 (Digital Download) | Raylodies"
              />

              <Textarea
                name="meta_description"
                label="Meta Description"
                defaultValue={initialData?.meta_description || ""}
                rows={3}
                placeholder="Aim for ~140–160 characters. Clear value + keywords."
              />

              <Input
                name="og_image"
                label="OG Image URL"
                defaultValue={initialData?.og_image || ""}
                placeholder="Optional: full image URL for social sharing (1200x630 recommended)"
              />
            </div>

            {/* Digital File */}
            <div className="bg-[#050505] border border-white/10 rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-light text-white mb-4">
                Digital File
              </h3>
              <p className="text-sm text-white/40 mb-4">
                Upload the digital file that customers will receive after
                purchase/claim. This file is stored securely and only accessible
                via signed URLs.
              </p>

              {isNew ? (
                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center opacity-50 cursor-not-allowed">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                      <Save className="w-6 h-6 text-white/20" />
                    </div>
                    <p className="text-sm text-white/40">
                      Save product first to upload files
                    </p>
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
                <h3 className="text-lg font-light text-white">
                  Product Gallery
                </h3>
                {!isNew && (
                  <span className="text-xs text-white/40">
                    Drag to reorder • First image = thumbnail
                  </span>
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
                    <SortableContext
                      items={imageItems.map((i) => i.id)}
                      strategy={rectSortingStrategy}
                    >
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
              <h3 className="text-lg font-light text-white mb-4">
                Pricing & Category
              </h3>

              <div className="pt-1">
                <label className="flex items-center justify-between cursor-pointer group p-3 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/[0.02] transition-all">
                  <div className="flex flex-col">
                    <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                      Free product
                    </span>
                    <span className="text-xs text-white/40">
                      Users must sign in to download. No Paddle checkout.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    name="is_free"
                    checked={isFree}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setIsFree(next);
                      if (next) setPriceValue("0");
                    }}
                    className="accent-white w-5 h-5 rounded"
                  />
                </label>
              </div>

              <Input
                name="price"
                type="number"
                step="0.01"
                label="Price (USD)"
                value={priceValue}
                onChange={(e) => setPriceValue(e.target.value)}
                readOnly={isFree}
                required
                className={isFree ? "opacity-60 cursor-not-allowed" : undefined}
              />

              <Select
                name="category_id"
                label="Category"
                defaultValue={initialData?.category_id || ""}
                options={[
                  { value: "", label: "Select Category" },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />

              <div className="pt-4 border-t border-white/10 space-y-4">
                <h4 className="text-sm font-medium text-white">
                  Paddle Integration
                </h4>
                {isFree ? (
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10">
                    <p className="text-xs text-white/50">
                      This product is <span className="text-white">Free</span>.
                      Paddle checkout is disabled.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-white/40">
                      Paddle product and price IDs are automatically created
                      when you save the product.
                    </p>
                    {initialData?.paddle_product_id && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/10">
                          <span className="text-xs text-white/50">
                            Product ID
                          </span>
                          <code className="text-xs text-green-400 font-mono">
                            {initialData.paddle_product_id}
                          </code>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/10">
                          <span className="text-xs text-white/50">
                            Price ID
                          </span>
                          <code className="text-xs text-green-400 font-mono">
                            {initialData.paddle_price_id || "Not set"}
                          </code>
                        </div>
                      </div>
                    )}
                    {!initialData?.paddle_product_id && !isNew && (
                      <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <p className="text-xs text-yellow-400">
                          No Paddle IDs found. Save the product to auto-create
                          them.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="pt-4 border-t border-white/10">
                <label className="flex items-center justify-between cursor-pointer group p-3 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/[0.02] transition-all">
                  <div className="flex flex-col">
                    <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                      Published
                    </span>
                    <span className="text-xs text-white/40">
                      Visible in store
                    </span>
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
                {isSaving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {isSaving ? "Saving..." : "Save Product"}
              </Button>
              {!isNew && initialData?.id && (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full mt-3"
                  onClick={handleDeleteProduct}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Product"}
                </Button>
              )}
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
