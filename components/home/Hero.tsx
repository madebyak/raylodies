"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-10 pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

      <div className="max-w-[1800px] mx-auto w-full">
        {/* Main Hero Content */}
        <div className="max-w-4xl">
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/40 text-sm font-light tracking-widest uppercase mb-6"
          >
            AI Creative Director & Artist
          </motion.p>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-light text-white/60 leading-[1.1] tracking-tight mb-8"
          >
            I craft bold visual stories at the crossroads of{" "}
            <span className="text-white">AI</span> and{" "}
            <span className="text-white">art</span> — transforming ideas into
            digital experiences for both personal and creative use.
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/50 text-lg md:text-xl font-light leading-relaxed max-w-2xl mb-10"
          >
            If you&apos;re here for self-expression, visual identity, or
            storytelling, my work is designed to spark emotion, curiosity, and
            connection. Through AI-generated art, I create immersive visuals that
            move people and expand what&apos;s possible in visual communication.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap gap-4"
          >
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
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
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

