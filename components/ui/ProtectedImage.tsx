"use client";

import Image, { ImageProps } from "next/image";

/**
 * Image component with right-click and drag protection.
 * Prevents casual saving of images while keeping OG/Pinterest crawlers unaffected.
 */
export default function ProtectedImage({
  className,
  alt,
  ...props
}: ImageProps) {
  return (
    <div className="contents" onContextMenu={(e) => e.preventDefault()}>
      <Image
        {...props}
        alt={alt}
        className={`${className || ""} select-none`}
        draggable={false}
      />
    </div>
  );
}
