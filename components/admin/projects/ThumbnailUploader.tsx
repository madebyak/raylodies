"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Image from "next/image";

interface ThumbnailUploaderProps {
  projectId: string;
  currentThumbnail: string | null;
  onUploadComplete: (url: string, width: number, height: number) => void;
  onRemove: () => void;
}

export default function ThumbnailUploader({
  projectId,
  currentThumbnail,
  onUploadComplete,
  onRemove,
}: ThumbnailUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentThumbnail);

  async function getImageSize(file: File): Promise<{ width: number; height: number }> {
    try {
      const bitmap = await createImageBitmap(file);
      return { width: bitmap.width, height: bitmap.height };
    } catch {
      const url = URL.createObjectURL(file);
      try {
        const img = new window.Image();
        img.src = url;
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load image"));
        });
        return { width: img.naturalWidth, height: img.naturalHeight };
      } finally {
        URL.revokeObjectURL(url);
      }
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsUploading(true);
      const supabase = createClient();

      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `thumbnail-${Date.now()}.${fileExt}`;
        const filePath = `projects/${projectId}/thumbnails/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("public-assets")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("public-assets").getPublicUrl(filePath);

        const { width, height } = await getImageSize(file);

        setPreviewUrl(publicUrl);
        onUploadComplete(publicUrl, width, height);
        toast.success("Thumbnail uploaded");
      } catch (error: unknown) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        toast.error("Upload failed: " + errorMessage);
      } finally {
        setIsUploading(false);
      }
    },
    [projectId, onUploadComplete]
  );

  const handleRemove = () => {
    setPreviewUrl(null);
    onRemove();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
  });

  if (previewUrl) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5">
        <div className="aspect-video relative">
          <Image
            src={previewUrl}
            alt="Project thumbnail"
            fill
            className="object-cover"
            sizes="400px"
          />
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-red-600/80 text-white/80 hover:text-white transition-colors"
          aria-label="Remove thumbnail"
        >
          <X size={16} />
        </button>
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <p className="text-xs text-white/80">
            Click X to remove and upload a new thumbnail
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300",
        isDragActive
          ? "border-blue-500 bg-blue-500/10"
          : "border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.04]"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        {isUploading ? (
          <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-white/40" />
          </div>
        )}
        <div className="space-y-1">
          <p className="text-sm text-white font-medium">
            {isUploading ? "Uploading..." : "Upload Thumbnail"}
          </p>
          <p className="text-xs text-white/40">
            Recommended: 16:9 ratio, 1200×675px minimum
          </p>
        </div>
      </div>
    </div>
  );
}

