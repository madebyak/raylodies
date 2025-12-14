"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileIcon, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadProductFile } from "@/actions/product-editor";
import { toast } from "sonner";

interface FileUploaderProps {
  productId: string;
  currentFile: string | null;
}

export default function FileUploader({ productId, currentFile }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setIsUploading(true);
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await uploadProductFile(productId, formData);
      if (result.error) throw new Error(result.error);
      
      toast.success("File uploaded successfully");
    } catch (error: any) {
      console.error(error);
      toast.error("Upload failed: " + error.message);
    } finally {
      setIsUploading(false);
    }
  }, [productId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar']
    }
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors relative overflow-hidden",
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
              {isUploading ? "Uploading..." : "Upload Digital Product (.zip)"}
            </p>
            <p className="text-xs text-white/40">
              Drag & drop or click to browse
            </p>
          </div>
        </div>
      </div>

      {currentFile && (
        <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="p-2 bg-green-500/20 rounded-full text-green-400">
            <FileIcon size={16} />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm text-white font-medium truncate">
              {currentFile.split('/').pop()}
            </p>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <CheckCircle size={10} />
              Ready for download
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
