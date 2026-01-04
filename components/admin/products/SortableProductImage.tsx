"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, GripVertical } from "lucide-react";
import Image from "next/image";
import { ProductImage } from "@/types/database";

interface SortableProductImageProps {
  id: string;
  item: ProductImage;
  onRemove: (id: string) => void;
}

export default function SortableProductImage({ id, item, onRemove }: SortableProductImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10 ${
        isDragging ? "opacity-50 ring-2 ring-blue-500" : ""
      }`}
    >
      <Image
        src={item.url}
        alt="Product image"
        fill
        className="object-cover"
        sizes="150px"
      />
      
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 p-1.5 bg-black/60 rounded-md text-white/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={14} />
      </button>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(id)}
        className="absolute top-2 right-2 p-1.5 bg-red-500/80 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
      >
        <X size={14} />
      </button>

      {/* First image indicator */}
      {item.display_order === 0 && (
        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-blue-500/80 rounded text-[10px] text-white font-medium">
          Thumbnail
        </div>
      )}
    </div>
  );
}



