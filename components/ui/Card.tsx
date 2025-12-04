"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CardProps {
  href: string;
  image: string;
  title: string;
  subtitle?: string;
  tag?: string;
  aspectRatio?: "square" | "video" | "portrait";
  className?: string;
}

export default function Card({
  href,
  image,
  title,
  subtitle,
  tag,
  aspectRatio = "video",
  className,
}: CardProps) {
  const aspectRatios = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
  };

  return (
    <Link href={href} className={cn("group block", className)}>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-4"
      >
        {/* Image Container */}
        <div
          className={cn(
            "relative overflow-hidden bg-white/5",
            aspectRatios[aspectRatio]
          )}
        >
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />

          {/* Tag */}
          {tag && (
            <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white/80 text-xs font-light px-3 py-1 tracking-wide">
              {tag}
            </span>
          )}

          {/* View Indicator */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <span className="text-white text-sm font-light tracking-wider border border-white/30 px-4 py-2 backdrop-blur-sm bg-black/30">
              View
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-1">
          <h3 className="text-white text-base font-light group-hover:text-white/80 transition-colors duration-300">
            {title}
          </h3>
          {subtitle && (
            <p className="text-white/40 text-sm font-light">{subtitle}</p>
          )}
        </div>
      </motion.article>
    </Link>
  );
}

