"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProjectListItem } from "@/types/database";
import WorkCard from "@/components/work/WorkCard";

interface FeaturedWorkProps {
  projects: ProjectListItem[];
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
              Directed visual narratives spanning commercial projects and experimental concepts.
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

        {/* Work Grid - Masonry (no forced cropping) */}
        <div className="columns-1 md:columns-2 [column-gap:1.5rem] md:[column-gap:2rem]">
          {projects.map((project, index) => (
            <WorkCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
