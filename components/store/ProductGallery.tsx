"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ProductImage } from "@/types/database";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

interface ProductGalleryProps {
  images: ProductImage[];
  thumbnail: string | null;
  title: string;
}

export default function ProductGallery({ images, thumbnail, title }: ProductGalleryProps) {
  const allImages = useMemo(() => {
    const urls: string[] = [];
    if (thumbnail) urls.push(thumbnail);
    for (const img of images) urls.push(img.url);
    // de-dupe while preserving order
    return urls.filter((u, i) => urls.indexOf(u) === i);
  }, [images, thumbnail]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const selectedImage = allImages[selectedIndex] || null;

  const hasNav = allImages.length > 1;

  function prev() {
    setSelectedIndex((i) => (i - 1 + allImages.length) % allImages.length);
  }

  function next() {
    setSelectedIndex((i) => (i + 1) % allImages.length);
  }

  useEffect(() => {
    if (!isLightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (!hasNav) return;
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLightboxOpen, hasNav, allImages.length]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isLightboxOpen]);

  if (allImages.length === 0) {
    return (
      <div className="space-y-4">
        <div className="aspect-[4/3] relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
          <span className="text-white/20">No Preview</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      {/* Main Image */}
      <div className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 group">
        <div className="aspect-[4/3] relative">
          <Image
            src={selectedImage!}
            alt={title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
        </div>

        {/* Subtle gradient for controls */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Arrows */}
        {hasNav && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 border border-white/10 text-white/90 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/75"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 border border-white/10 text-white/90 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/75"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Counter */}
        {hasNav && (
          <div className="absolute bottom-3 right-3 text-[11px] tracking-wide text-white/80 bg-black/60 border border-white/10 px-2.5 py-1 rounded-full">
            {selectedIndex + 1} / {allImages.length}
          </div>
        )}

        {/* Expand */}
        <button
          type="button"
          aria-label="View larger"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/60 border border-white/10 text-white/90 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/75"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      {/* Thumbnails (only show if more than 1 image) */}
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {allImages.map((url, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative flex-none w-24 aspect-[4/3] rounded-xl overflow-hidden bg-white/5 border-2 transition-all duration-200",
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
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="absolute inset-0 flex items-center justify-center p-6 md:p-10">
            <div
              className="relative w-full max-w-6xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Close"
                onClick={() => setIsLightboxOpen(false)}
                className="absolute -top-12 right-0 p-2 rounded-full bg-black/60 border border-white/10 text-white/90 hover:bg-black/75"
              >
                <X size={18} />
              </button>

              <div className="relative w-full aspect-[16/10] md:aspect-[16/9] rounded-2xl overflow-hidden bg-black border border-white/10">
                <Image
                  src={selectedImage!}
                  alt={title}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>

              {hasNav && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={prev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 border border-white/10 text-white/90 hover:bg-black/75"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 border border-white/10 text-white/90 hover:bg-black/75"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



