"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface MediaUploaderProps {
  projectId: string;
  onUploadComplete: (url: string, type: 'image' | 'video') => void;
}

export default function MediaUploader({ projectId, onUploadComplete }: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

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
        
        onUploadComplete(publicUrl, type);
      }
      toast.success("Media uploaded successfully");
    } catch (error: any) {
      console.error(error);
      toast.error("Upload failed: " + error.message);
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
        "border border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
        isDragActive 
          ? "border-blue-500 bg-blue-500/5" 
          : "border-white/10 hover:border-white/20 bg-white/[0.02]"
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
            Supports JPG, PNG, GIF, MP4 (Max 50MB)
          </p>
        </div>
      </div>
    </div>
  );
}
