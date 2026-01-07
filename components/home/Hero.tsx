"use client";

import Link from "next/link";
import { motion, useAnimation } from "framer-motion";
import { ArrowDown } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import {
  LabelReveal,
  ParagraphReveal,
  ButtonReveal,
} from "@/components/animations/TextReveal";

// Dynamically import ImageTrail to avoid SSR issues
const ImageTrail = dynamic(() => import("./ImageTrail"), { ssr: false });

// Codrops-style easing
const EASING = [0.77, 0, 0.175, 1] as const;

// Hero headline with word-by-word reveal supporting mixed content
function HeroHeadline() {
  const controls = useAnimation();

  useEffect(() => {
    // Trigger animation on mount
    controls.start("visible");
  }, [controls]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.3,
      },
    },
  };

  const wordVariants = {
    hidden: {
      y: 100,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: EASING,
      },
    },
  };

  // Define the headline structure with styling
  const headlineContent = [
    { text: "I craft bold visual stories at the crossroads of", className: "text-white/60" },
    { text: "AI", className: "text-white" },
    { text: "and", className: "text-white/60" },
    { text: "art", className: "text-white" },
    { text: "— transforming ideas into digital experiences for both personal and creative use.", className: "text-white/60" },
  ];

  return (
    <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-light leading-[1.1] tracking-tight mb-8">
      <motion.span
        className="inline"
        initial="hidden"
        animate={controls}
        variants={containerVariants}
      >
        {headlineContent.map((segment, segmentIndex) => (
          <span key={segmentIndex} className="inline">
            {segment.text.split(" ").map((word, wordIndex, arr) => (
              <span key={`${segmentIndex}-${wordIndex}`} className="inline-block overflow-hidden">
                <motion.span
                  className={`inline-block ${segment.className}`}
                  variants={wordVariants}
                >
                  {word}
                  {wordIndex < arr.length - 1 || segmentIndex < headlineContent.length - 1 ? "\u00A0" : ""}
                </motion.span>
              </span>
            ))}
          </span>
        ))}
      </motion.span>
    </h1>
  );
}

export default function Hero() {
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-10 pt-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none z-0" />

      {/* Image Trail Effect - Below content */}
      <ImageTrail />

      {/* Main Content - Above trail images */}
      <div className="relative z-20 max-w-[1800px] mx-auto w-full pointer-events-none">
        {/* Main Hero Content */}
        <div className="max-w-4xl">
          {/* Subtitle - Character reveal */}
          <LabelReveal
            delay={0.1}
            triggerOnLoad
            className="text-white/40 text-sm font-light tracking-widest uppercase mb-6"
          >
            AI Creative Director & Artist
          </LabelReveal>

          {/* Main Headline - Word reveal */}
          <HeroHeadline />

          {/* Description - Paragraph reveal */}
          <ParagraphReveal
            delay={0.7}
            triggerOnLoad
            className="text-white/50 text-lg md:text-xl font-light leading-relaxed max-w-2xl mb-10"
          >
            If you&apos;re here for self-expression, visual identity, or storytelling, my work is designed to spark emotion, curiosity, and connection. Through AI-generated art, I create immersive visuals that move people and expand what&apos;s possible in visual communication.
          </ParagraphReveal>

          {/* CTA Buttons - Button reveal */}
          <ButtonReveal delay={0.9} triggerOnLoad className="flex flex-wrap gap-4 pointer-events-auto">
            <Link
              href="/work"
              className="inline-flex items-center px-6 py-3 bg-white text-black text-sm font-light tracking-wide hover:bg-white/90 transition-colors duration-300"
            >
              View Work
            </Link>
            <Link
              href="/start-a-project"
              className="inline-flex items-center px-6 py-3 border border-white/20 text-white text-sm font-light tracking-wide hover:border-white/40 hover:bg-white/5 transition-all duration-300"
            >
              Start a Project
            </Link>
          </ButtonReveal>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        ref={scrollIndicatorRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2, ease: EASING }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-white/30"
        >
          <span className="text-xs font-light tracking-widest uppercase">
            Scroll
          </span>
          <ArrowDown size={16} />
        </motion.div>
      </motion.div>
    </section>
  );
}
