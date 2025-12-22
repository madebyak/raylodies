"use client";

import { motion } from "framer-motion";
import { FadeIn } from "@/components/layout/PageTransition";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/social";
import { Ms_Madi } from "next/font/google";

const msMadi = Ms_Madi({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const skills = [
  "AI Image Generation",
  "AI Video Creation",
  "Prompt Engineering",
  "Creative Direction",
  "Visual Storytelling",
  "Brand Identity",
  "Digital Art",
];

const tools = [
  "Midjourney",
  "Stable Diffusion",
  "Runway",
  "Sora",
  "ComfyUI",
  "After Effects",
  "Kling AI",
  "Veo3",
  "Higgsfield",
];

export default function AboutPage() {
  return (
    <section className="px-6 md:px-10 pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="max-w-[1800px] mx-auto">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-24 items-center">
          {/* Left - Main Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-light text-white/60 leading-[1.15] tracking-tight mb-8">
              I&apos;m <span className="text-white">Ranya</span> — an AI creative
              director and multidisciplinary artist working at the intersection of{" "}
              <span className="text-white">tech</span> and{" "}
              <span className="text-white">human creativity</span>.
            </h1>
            <p className="text-white/50 text-lg md:text-xl font-light leading-relaxed">
              My work is rooted in crafting visual experiences that challenge the
              perception of how we see things and what we expect from digital art.
              I operate by a simple manifesto:{" "}
              <span className="text-white">&quot;Tech doesn&apos;t lead the process. Vision does.&quot;</span>
            </p>
          </motion.div>

          {/* Right - Personal Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative aspect-[3/4] w-full max-w-md mx-auto lg:max-w-none overflow-hidden">
              <Image
                src="/personal-img.jpg"
                alt="Ranya - AI Creative Director"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
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
                What began as a curiosity about the boundaries of AI generative art
                has evolved into a disciplined creative practice. My journey is not
                just about using new tools; it is about defining a new medium. I
                operate as a bridge between the raw data of artificial intelligence
                and the emotional resonance of traditional art.
              </p>
              <p className="text-white/70 text-base font-light leading-relaxed">
                Alongside my personal practice, I am part of MoonWhale — a
                creative-tech company built and powered by curious minds across
                design, code, AI, and more. It is an initiative where creative ideas
                grow into powerful digital realities. Today, my work exists to
                challenge the perception of how we see things, proving that in the
                right hands, algorithms can be as expressive as a paintbrush.
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
                <span className="text-white">Symbiosis, Not Replacement.</span> I
                treat AI models as creative partners rather than replacements for
                human creativity. My work explores the tension between algorithmic
                calculation and organic imperfection.
              </p>
              <p className="text-white/70 text-base font-light leading-relaxed">
                I believe the most compelling art emerges when we guide the machine
                with deep intention. I respect the past by applying traditional
                artistic principles: composition, lighting, and narrative, while
                embracing the infinite possibilities of tomorrow. The goal is never
                just aesthetics; it is about crafting a creation that connects,
                inspires, and stays with you.
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
                <span className="text-white">Engineered Creativity.</span> My
                process begins with deep technical exploration. I don&apos;t just
                prompt; I study the nuances of the models. I spend considerable time
                deconstructing the unique characteristics of each tool to develop
                custom workflows that unlock their full expressive potential.
              </p>
              <p className="text-white/70 text-base font-light leading-relaxed">
                Whether I am engineering a static editorial image or directing a
                complex motion piece, the workflow is rigorous. I combine technical
                expertise with artistic intuition, ensuring that technology serves
                the vision, not the other way around.
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
                  Let&apos;s create something{" "}
                  <span
                    className={[
                      msMadi.className,
                      "wow-gradient inline-block align-baseline",
                    ].join(" ")}
                  >
                    WOW
                  </span>
                  .
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
                  {SOCIAL_LINKS.map((social) => (
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
