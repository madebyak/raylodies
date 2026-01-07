"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface ProductImageUploaderProps {
  productId: string;
  onUploadComplete: (url: string) => void;
}

export default function ProductImageUploader({
  productId,
  onUploadComplete,
}: ProductImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsUploading(true);
      const supabase = createClient();

      try {
        for (const file of acceptedFiles) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `products/${productId}/images/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("public-assets")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("public-assets").getPublicUrl(filePath);

          onUploadComplete(publicUrl);
        }
        toast.success("Image uploaded successfully");
      } catch (error: unknown) {
        console.error(error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        toast.error("Upload failed: " + errorMessage);
      } finally {
        setIsUploading(false);
      }
    },
    [productId, onUploadComplete],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300",
        isDragActive
          ? "border-blue-500 bg-blue-500/10"
          : "border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.04]",
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        {isUploading ? (
          <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
        ) : (
          <Upload className="w-8 h-8 text-white/40" />
        )}
        <div className="space-y-1">
          <p className="text-sm text-white font-medium">
            {isUploading ? "Uploading..." : "Click or drag to upload images"}
          </p>
          <p className="text-xs text-white/40">
            Supports JPG, PNG, GIF, WebP (Max 10MB)
          </p>
        </div>
      </div>
    </div>
  );
}
