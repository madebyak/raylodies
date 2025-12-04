"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Play } from "lucide-react";
import { getProjectBySlug, projects } from "@/lib/data";
import { notFound } from "next/navigation";

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  // Get next and previous projects
  const currentIndex = projects.findIndex((p) => p.slug === slug);
  const nextProject = projects[(currentIndex + 1) % projects.length];
  const prevProject =
    projects[(currentIndex - 1 + projects.length) % projects.length];

  return (
    <section className="px-6 md:px-10 pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="max-w-[1800px] mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-white/50 text-sm font-light hover:text-white transition-colors duration-300 mb-12"
          >
            <ArrowLeft size={16} />
            Back to Work
          </Link>
        </motion.div>

        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 md:mb-16"
        >
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-white/40 text-sm font-light capitalize">
              {project.category.replace("-", " ")}
            </span>
            <span className="text-white/20">•</span>
            <span className="text-white/40 text-sm font-light">
              {project.year}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6">
            {project.title}
          </h1>
          <p className="text-white/50 text-lg md:text-xl font-light max-w-3xl leading-relaxed">
            {project.description}
          </p>
        </motion.div>

        {/* Media Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6 md:space-y-8 mb-20"
        >
          {project.media.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative aspect-video bg-white/5 overflow-hidden"
            >
              {item.type === "image" ? (
                <Image
                  src={item.url}
                  alt={`${project.title} - ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src={item.url}
                    alt={`${project.title} - ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="relative z-10 w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 cursor-pointer hover:bg-white/20 transition-colors duration-300">
                    <Play size={32} className="text-white fill-white ml-1" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Project Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="border-t border-white/10 pt-12"
        >
          <div className="grid grid-cols-2 gap-6">
            {/* Previous */}
            <Link
              href={`/work/${prevProject.slug}`}
              className="group text-left"
            >
              <span className="text-white/30 text-xs font-light uppercase tracking-wider">
                Previous
              </span>
              <h3 className="text-white text-lg md:text-xl font-light mt-2 group-hover:text-white/70 transition-colors duration-300">
                {prevProject.title}
              </h3>
            </Link>

            {/* Next */}
            <Link
              href={`/work/${nextProject.slug}`}
              className="group text-right"
            >
              <span className="text-white/30 text-xs font-light uppercase tracking-wider">
                Next
              </span>
              <h3 className="text-white text-lg md:text-xl font-light mt-2 group-hover:text-white/70 transition-colors duration-300">
                {nextProject.title}
              </h3>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

