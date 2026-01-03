"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { ProjectListItem } from "@/types/database";

interface WorkCardProps {
  project: ProjectListItem;
  index: number;
}

export default function WorkCard({ project, index }: WorkCardProps) {
  // Determine if it's a video based on category or media type
  // For now, simple check on category slug
  const isVideo = project.categories?.slug === "ai-videos";
  const fallbackW = 1200;
  const fallbackH = 675;
  const w = project.thumbnail_width ?? fallbackW;
  const h = project.thumbnail_height ?? fallbackH;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="[break-inside:avoid] mb-6 md:mb-8"
    >
      <Link href={`/work/${project.slug}`} className="group block">
        <article className="space-y-4">
          {/* Image Container */}
          <div className="relative overflow-hidden bg-white/5">
            {project.thumbnail ? (
              <Image
                src={project.thumbnail}
                alt={project.title}
                width={w}
                height={h}
                className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 bg-white/5 flex items-center justify-center text-white/20">
                No Thumbnail
              </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500" />

            {/* Category Tag */}
            {project.categories && (
              <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white/80 text-xs font-light px-3 py-1 tracking-wide capitalize">
                {project.categories.name}
              </span>
            )}

            {/* Video Indicator */}
            {isVideo && (
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm p-2 rounded-full">
                <Play size={14} className="text-white fill-white" />
              </div>
            )}

            {/* View Indicator */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <span className="text-white text-sm font-light tracking-wider border border-white/30 px-4 py-2 backdrop-blur-sm bg-black/30">
                View Project
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-white text-lg font-light group-hover:text-white/80 transition-colors duration-300">
                {project.title}
              </h3>
              <p className="text-white/40 text-sm font-light mt-1">
                {project.year}
              </p>
            </div>
            <ArrowRight
              size={18}
              className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all duration-300 mt-1"
            />
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
