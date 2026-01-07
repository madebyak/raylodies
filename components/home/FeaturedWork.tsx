"use client";

import { motion, useInView, useAnimation } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProjectListItem } from "@/types/database";
import WorkCard from "@/components/work/WorkCard";
import { useEffect, useRef } from "react";
import { LabelReveal, ParagraphReveal, ButtonReveal } from "@/components/animations/TextReveal";

// Codrops-style easing
const EASING = [0.77, 0, 0.175, 1] as const;

interface FeaturedWorkProps {
  projects: ProjectListItem[];
}

// Section heading with word reveal
function SectionHeading() {
  const ref = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  };

  const wordVariants = {
    hidden: {
      y: 60,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: EASING,
      },
    },
  };

  const words = ["Selected", "Work"];

  return (
    <h2 ref={ref} className="text-3xl md:text-4xl font-light text-white mb-4">
      <motion.span
        className="inline"
        initial="hidden"
        animate={controls}
        variants={containerVariants}
      >
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden">
            <motion.span className="inline-block" variants={wordVariants}>
              {word}
              {i < words.length - 1 ? "\u00A0" : ""}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </h2>
  );
}

export default function FeaturedWork({ projects }: FeaturedWorkProps) {
  // If no featured projects from DB, show a message
  if (!projects || projects.length === 0) {
    return (
      <section className="px-6 md:px-10 py-20 md:py-32">
        <div className="max-w-[1800px] mx-auto text-center">
          <SectionHeading />
          <ParagraphReveal className="text-white/40 text-base font-light">
            Featured projects will appear here. Mark projects as &quot;Featured&quot; in the dashboard.
          </ParagraphReveal>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 md:px-10 py-20 md:py-32">
      <div className="max-w-[1800px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
          <div>
            <SectionHeading />
            <ParagraphReveal
              delay={0.2}
              className="text-white/40 text-base font-light max-w-md"
            >
              Directed visual narratives spanning commercial projects and experimental concepts.
            </ParagraphReveal>
          </div>
          <ButtonReveal delay={0.3}>
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
          </ButtonReveal>
        </div>

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
