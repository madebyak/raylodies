"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductImage } from "@/types/database";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: ProductImage[];
  thumbnail: string | null;
  title: string;
}

export default function ProductGallery({ images, thumbnail, title }: ProductGalleryProps) {
  // Use first image or thumbnail as main image
  const allImages = images.length > 0 
    ? images.map(img => img.url) 
    : thumbnail 
      ? [thumbnail] 
      : [];
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = allImages[selectedIndex] || null;

  if (allImages.length === 0) {
    return (
      <div className="space-y-4">
        <div className="aspect-[4/3] relative rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
          <span className="text-white/20">No Preview</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-[4/3] relative rounded-xl overflow-hidden bg-white/5 border border-white/10">
        <Image
          src={selectedImage!}
          alt={title}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>

      {/* Thumbnails (only show if more than 1 image) */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {allImages.map((url, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "aspect-square relative rounded-lg overflow-hidden bg-white/5 border-2 transition-all duration-200",
                selectedIndex === index
                  ? "border-white/60 ring-2 ring-white/20"
                  : "border-white/10 hover:border-white/30"
              )}
            >
              <Image
                src={url}
                alt={`${title} - Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="100px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

