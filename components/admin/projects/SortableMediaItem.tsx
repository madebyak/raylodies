"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, GripVertical, Image as ImageIcon, Video } from "lucide-react";
import Image from "next/image";
import { ProjectMedia } from "@/types/database";

interface SortableMediaItemProps {
  id: string;
  item: ProjectMedia;
  onRemove: (id: string) => void;
}

export default function SortableMediaItem({ id, item, onRemove }: SortableMediaItemProps) {
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
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative aspect-square bg-[#0a0a0a] rounded-lg border border-white/10 overflow-hidden"
    >
      {/* Media Preview */}
      {item.type === 'image' ? (
        <Image
          src={item.url}
          alt="Media"
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-black">
          <Video className="text-white/40 mb-2" size={24} />
          <video 
            src={item.url} 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            muted
            loop
            playsInline
          />
        </div>
      )}

      {/* Drag Handle Overlay */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors cursor-grab active:cursor-grabbing flex items-center justify-center opacity-0 group-hover:opacity-100"
      >
        <GripVertical className="text-white/80" />
      </div>

      {/* Type Badge */}
      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[10px] text-white/80 font-medium flex items-center gap-1">
        {item.type === 'image' ? <ImageIcon size={10} /> : <Video size={10} />}
        {item.type === 'image' ? 'IMG' : 'VID'}
      </div>

      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(id);
        }}
        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 text-white/80 hover:text-white rounded-md backdrop-blur-sm transition-colors z-10"
      >
        <X size={12} />
      </button>
    </div>
  );
}

