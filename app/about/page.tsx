"use client";

import { motion } from "framer-motion";
import { FadeIn } from "@/components/layout/PageTransition";
import Link from "next/link";
import { ArrowRight, Instagram, Linkedin, Twitter } from "lucide-react";

const skills = [
  "AI Image Generation",
  "AI Video Creation",
  "Prompt Engineering",
  "Creative Direction",
  "Visual Storytelling",
  "Brand Identity",
  "Motion Design",
  "Digital Art",
];

const tools = [
  "Midjourney",
  "Stable Diffusion",
  "DALL-E",
  "Runway",
  "Sora",
  "ComfyUI",
  "After Effects",
  "Photoshop",
];

const socialLinks = [
  { href: "https://instagram.com", label: "Instagram", icon: Instagram },
  { href: "https://linkedin.com", label: "LinkedIn", icon: Linkedin },
  { href: "https://twitter.com", label: "Twitter", icon: Twitter },
];

export default function AboutPage() {
  return (
    <section className="px-6 md:px-10 pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="max-w-[1800px] mx-auto">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-24">
          {/* Main Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-white leading-[1.15] tracking-tight">
              Raylodies is an AI creative director and multidisciplinary artist,
              specializing in{" "}
              <span className="text-white/50">AI-generated imagery</span> and{" "}
              <span className="text-white/50">video content</span>, with a focus
              on pushing the boundaries of digital creativity.
            </h1>
          </motion.div>
        </div>

        {/* About Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 mb-24">
          {/* Story */}
          <FadeIn delay={0.1}>
            <div className="space-y-6">
              <h2 className="text-white/40 text-sm font-light uppercase tracking-wider">
                The Story
              </h2>
              <p className="text-white/70 text-base font-light leading-relaxed">
                What started as an exploration into the possibilities of AI-generated
                art has evolved into a full creative practice. Today, I work at the
                intersection of artificial intelligence and human creativity, crafting
                visual experiences that challenge perception and inspire wonder.
              </p>
              <p className="text-white/70 text-base font-light leading-relaxed">
                My approach combines technical expertise with artistic intuition,
                treating AI as a collaborative tool rather than a replacement for
                human creativity. Each project is an opportunity to discover new
                visual languages and push the medium forward.
              </p>
            </div>
          </FadeIn>

          {/* Philosophy */}
          <FadeIn delay={0.2}>
            <div className="space-y-6">
              <h2 className="text-white/40 text-sm font-light uppercase tracking-wider">
                Philosophy
              </h2>
              <p className="text-white/70 text-base font-light leading-relaxed">
                I believe that the best AI art emerges from a deep understanding of
                both the technology and traditional artistic principles. My work
                explores the tension between algorithmic precision and organic
                imperfection.
              </p>
              <p className="text-white/70 text-base font-light leading-relaxed">
                Every piece is crafted with intention, guided by a vision that
                respects the past while embracing the possibilities of tomorrow.
                The goal is always to create work that feels both familiar and
                impossibly new.
              </p>
            </div>
          </FadeIn>

          {/* Approach */}
          <FadeIn delay={0.3}>
            <div className="space-y-6">
              <h2 className="text-white/40 text-sm font-light uppercase tracking-wider">
                Approach
              </h2>
              <p className="text-white/70 text-base font-light leading-relaxed">
                My creative process begins with deep exploration and experimentation.
                I spend considerable time understanding the unique characteristics
                of each AI tool, developing custom workflows that maximize creative
                potential.
              </p>
              <p className="text-white/70 text-base font-light leading-relaxed">
                Whether creating still images or motion pieces, I focus on narrative
                and emotional resonance. Technology serves the vision, not the other
                way around.
              </p>
            </div>
          </FadeIn>
        </div>

        {/* Skills & Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 mb-24 pt-12 border-t border-white/10">
          {/* Skills */}
          <FadeIn delay={0.1}>
            <div className="space-y-8">
              <h2 className="text-white/40 text-sm font-light uppercase tracking-wider">
                Skills & Expertise
              </h2>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="px-4 py-2 border border-white/10 text-white/60 text-sm font-light hover:border-white/30 hover:text-white transition-all duration-300"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Tools */}
          <FadeIn delay={0.2}>
            <div className="space-y-8">
              <h2 className="text-white/40 text-sm font-light uppercase tracking-wider">
                Tools & Technologies
              </h2>
              <div className="flex flex-wrap gap-3">
                {tools.map((tool, index) => (
                  <motion.span
                    key={tool}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="px-4 py-2 border border-white/10 text-white/60 text-sm font-light hover:border-white/30 hover:text-white transition-all duration-300"
                  >
                    {tool}
                  </motion.span>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Connect Section */}
        <FadeIn delay={0.1}>
          <div className="pt-12 border-t border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
              {/* CTA */}
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-light text-white">
                  Let&apos;s create something extraordinary together.
                </h2>
                <p className="text-white/50 text-base font-light">
                  Available for select projects and collaborations.
                </p>
                <Link
                  href="/start-a-project"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-sm font-light tracking-wide hover:bg-white/90 transition-colors duration-300 group"
                >
                  Start a Project
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  />
                </Link>
              </div>

              {/* Social Links */}
              <div className="space-y-6 md:text-right">
                <h3 className="text-white/40 text-sm font-light uppercase tracking-wider">
                  Connect
                </h3>
                <div className="flex md:justify-end items-center gap-6">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/40 hover:text-white transition-colors duration-300"
                      aria-label={social.label}
                    >
                      <social.icon size={24} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

