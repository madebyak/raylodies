"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Project } from "@/types/database";

interface FeaturedWorkProps {
  projects: Project[];
}

export default function FeaturedWork({ projects }: FeaturedWorkProps) {
  // If no featured projects from DB, show a message
  if (!projects || projects.length === 0) {
    return (
      <section className="px-6 md:px-10 py-20 md:py-32">
        <div className="max-w-[1800px] mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
            Selected Work
          </h2>
          <p className="text-white/40 text-base font-light">
            Featured projects will appear here. Mark projects as &quot;Featured&quot; in the dashboard.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 md:px-10 py-20 md:py-32">
      <div className="max-w-[1800px] mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
              Selected Work
            </h2>
            <p className="text-white/40 text-base font-light max-w-md">
              A curated selection of AI-generated images and videos, showcasing
              the possibilities of creative AI.
            </p>
          </div>
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-white/60 text-sm font-light hover:text-white transition-colors duration-300 group"
          >
            View all work
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform duration-300"
            />
          </Link>
        </motion.div>

        {/* Work Grid - Masonry Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={index === 0 ? "md:col-span-2" : ""}
            >
              <Link href={`/work/${project.slug}`} className="group block">
                <article className="space-y-4">
                  {/* Image Container */}
                  <div
                    className={`relative overflow-hidden bg-white/5 ${
                      index === 0 ? "aspect-[21/9]" : "aspect-video"
                    }`}
                  >
                    {project.thumbnail ? (
                      <Image
                        src={project.thumbnail}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        sizes={
                          index === 0
                            ? "100vw"
                            : "(max-width: 768px) 100vw, 50vw"
                        }
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white/20">
                        No thumbnail
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500" />

                    {/* Category Tag */}
                    {project.categories && (
                      <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white/80 text-xs font-light px-3 py-1 tracking-wide capitalize">
                        {project.categories.name.replace("-", " ")}
                      </span>
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
          ))}
        </div>
      </div>
    </section>
  );
}
