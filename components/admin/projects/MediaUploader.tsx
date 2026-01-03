"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface MediaUploaderProps {
  projectId: string;
  onUploadComplete: (
    url: string,
    type: 'image' | 'video',
    meta?: { width?: number | null; height?: number | null; poster_url?: string | null }
  ) => void;
}

export default function MediaUploader({ projectId, onUploadComplete }: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  async function getImageSize(file: File): Promise<{ width: number; height: number }> {
    try {
      const bitmap = await createImageBitmap(file);
      return { width: bitmap.width, height: bitmap.height };
    } catch {
      // Fallback: HTMLImageElement
      const url = URL.createObjectURL(file);
      try {
        const img = new Image();
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

  async function getVideoMetadataAndPoster(
    file: File
  ): Promise<{ width: number; height: number; posterBlob: Blob | null }> {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    try {
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("Failed to load video metadata"));
      });

      const width = video.videoWidth || 0;
      const height = video.videoHeight || 0;

      // Try to grab an early frame as poster (best-effort)
      let posterBlob: Blob | null = null;
      try {
        const targetTime = Number.isFinite(video.duration) && video.duration > 0 ? Math.min(0.1, video.duration / 2) : 0.1;
        video.currentTime = targetTime;
        await new Promise<void>((resolve, reject) => {
          video.onseeked = () => resolve();
          video.onerror = () => reject(new Error("Failed to seek video"));
        });

        const canvas = document.createElement("canvas");
        canvas.width = width || 1200;
        canvas.height = height || 675;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          posterBlob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob((b) => resolve(b), "image/jpeg", 0.85)
          );
        }
      } catch {
        posterBlob = null;
      }

      return { width, height, posterBlob };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    const supabase = createClient();

    try {
      for (const file of acceptedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `projects/${projectId}/media/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('public-assets')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('public-assets')
          .getPublicUrl(filePath);

        // Simple type detection based on MIME type
        const type = file.type.startsWith('video/') ? 'video' : 'image';

        if (type === "image") {
          const { width, height } = await getImageSize(file);
          onUploadComplete(publicUrl, type, { width, height });
        } else {
          const { width, height, posterBlob } = await getVideoMetadataAndPoster(file);
          let poster_url: string | null = null;

          if (posterBlob) {
            const posterName = `${Math.random().toString(36).substring(2)}.jpg`;
            const posterPath = `projects/${projectId}/posters/${posterName}`;
            const posterFile = new File([posterBlob], posterName, { type: "image/jpeg" });

            const { error: posterUploadError } = await supabase.storage
              .from("public-assets")
              .upload(posterPath, posterFile);

            if (!posterUploadError) {
              poster_url = supabase.storage.from("public-assets").getPublicUrl(posterPath).data.publicUrl;
            }
          }

          onUploadComplete(publicUrl, type, { width, height, poster_url });
        }
      }
      toast.success("Media uploaded successfully");
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error("Upload failed: " + errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [projectId, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm']
    }
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300",
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
          <Upload className="w-8 h-8 text-white/40" />
        )}
        <div className="space-y-1">
          <p className="text-sm text-white font-medium">
            {isUploading ? "Uploading..." : "Click or drag to upload media"}
          </p>
          <p className="text-xs text-white/40">
            Supports JPG, PNG, GIF, WebP, MP4, WebM (Max 50MB)
          </p>
        </div>
      </div>
    </div>
  );
}



