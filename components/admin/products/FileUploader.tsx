"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileIcon,
  Loader2,
  CheckCircle,
  Trash2,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  deleteProductFile,
  replaceProductFilePath,
} from "@/actions/product-editor";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface FileUploaderProps {
  productId: string;
  currentFile: string | null;
}

export default function FileUploader({
  productId,
  currentFile,
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localFile, setLocalFile] = useState<string | null>(currentFile);

  function sanitizeFileName(name: string): string {
    const trimmed = name.trim();
    // Replace spaces with dashes and strip characters that are commonly problematic in paths
    return trimmed
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-");
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setIsUploading(true);
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append("file", file);

      try {
        // Upload directly from the browser to Supabase Storage to avoid Server Action payload limits.
        const supabase = createClient();
        const safeName = sanitizeFileName(file.name || "product-file");
        const random = Math.random().toString(36).slice(2);
        const filePath = `products/${productId}/${Date.now()}-${random}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-files")
          .upload(filePath, file, { upsert: false });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        const res = await replaceProductFilePath(productId, filePath);
        if (res.error) throw new Error(res.error);

        setLocalFile(filePath);
        toast.success("File uploaded successfully");
      } catch (error: unknown) {
        console.error(error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        toast.error("Upload failed: " + errorMessage);
      } finally {
        setIsUploading(false);
      }
    },
    [productId],
  );

  const onRemove = useCallback(async () => {
    if (!localFile) return;
    const ok = window.confirm(
      "Remove the current digital file?\n\nThis will delete it from storage and clear it from the product.",
    );
    if (!ok) return;
    setIsDeleting(true);
    try {
      const res = await deleteProductFile(productId);
      if (res.error) throw new Error(res.error);
      if ((res as { warning?: string }).warning) {
        toast.warning(
          `File cleared, but storage delete failed: ${(res as { warning?: string }).warning}`,
        );
      } else {
        toast.success("File removed");
      }
      setLocalFile(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error(`Failed to remove file: ${msg}`);
    } finally {
      setIsDeleting(false);
    }
  }, [localFile, productId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "application/zip": [".zip"],
      "application/x-rar-compressed": [".rar"],
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "video/mp4": [".mp4"],
      "video/quicktime": [".mov"],
      "video/webm": [".webm"],
    },
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 relative overflow-hidden",
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
              {isUploading
                ? "Uploading..."
                : localFile
                  ? "Upload / Replace Digital File"
                  : "Upload Digital File"}
            </p>
            <p className="text-xs text-white/40">
              Drag & drop or click to browse. Uploading a new file will replace
              the current one.
            </p>
          </div>
        </div>
      </div>

      {localFile && (
        <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="p-2 bg-green-500/20 rounded-full text-green-400">
            <FileIcon size={16} />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm text-white font-medium truncate">
              {localFile.split("/").pop()}
            </p>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <CheckCircle size={10} />
              Ready for download
            </p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-[11px] text-white/40 font-mono truncate">
                {localFile}
              </p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(localFile);
                    toast.success("Path copied");
                  } catch {
                    toast.error("Failed to copy");
                  }
                }}
                className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                title="Copy storage path"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemove}
            disabled={isDeleting || isUploading}
            className="p-2 rounded-md hover:bg-white/10 text-white/60 hover:text-red-300 transition-colors disabled:opacity-40"
            title="Remove file"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
