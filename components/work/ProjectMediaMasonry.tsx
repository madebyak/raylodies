"use client";

import { ProjectMedia } from "@/types/database";
import ProtectedImage from "@/components/ui/ProtectedImage";

interface ProjectMediaMasonryProps {
  media: ProjectMedia[];
  projectTitle: string;
  fallbackPoster?: string | null;
}

function VideoPlayer({
  url,
  poster,
  width,
  height,
}: {
  url: string;
  poster?: string | null;
  width?: number | null;
  height?: number | null;
}) {
  const isPortrait = width && height && height > width;

  return (
    <div
      className={`w-full ${isPortrait ? "mx-auto max-w-[560px]" : ""}`}
      style={
        width && height ? { aspectRatio: `${width} / ${height}` } : undefined
      }
    >
      <video
        src={url}
        poster={poster || undefined}
        className="w-full h-full object-contain bg-black rounded-lg"
        controls
        loop
        playsInline
      />
    </div>
  );
}

function MediaItem({
  item,
  projectTitle,
  fallbackPoster,
  index,
}: {
  item: ProjectMedia;
  projectTitle: string;
  fallbackPoster?: string | null;
  index: number;
}) {
  const isPortrait =
    item.width && item.height && item.height > item.width;

  if (item.type === "video") {
    return (
      <div className="break-inside-avoid mb-4 md:mb-6">
        <div className="rounded-lg overflow-hidden bg-white/5">
          <VideoPlayer
            url={item.url}
            poster={item.poster_url || fallbackPoster}
            width={item.width}
            height={item.height}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="break-inside-avoid mb-4 md:mb-6">
      <div className="rounded-lg overflow-hidden bg-white/5">
        <ProtectedImage
          src={item.url}
          alt={`${projectTitle} - Image ${index + 1}`}
          width={item.width || 1920}
          height={item.height || 1080}
          className={`w-full h-auto object-cover ${
            isPortrait ? "mx-auto max-w-[560px]" : ""
          }`}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={index === 0}
        />
      </div>
    </div>
  );
}

export default function ProjectMediaMasonry({
  media,
  projectTitle,
  fallbackPoster,
}: ProjectMediaMasonryProps) {
  if (media.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-white/40 text-lg font-light">
          No media available for this project.
        </p>
      </div>
    );
  }

  return (
    <div className="columns-1 md:columns-2 gap-4 md:gap-6">
      {media.map((item, index) => (
        <MediaItem
          key={item.id}
          item={item}
          projectTitle={projectTitle}
          fallbackPoster={fallbackPoster}
          index={index}
        />
      ))}
    </div>
  );
}

