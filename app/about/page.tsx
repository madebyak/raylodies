"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useInView, useAnimation } from "framer-motion";

// Dynamically import ProgressiveBlurImage to avoid SSR issues with WebGL
const ProgressiveBlurImage = dynamic(
  () => import("@/components/effects/ProgressiveBlurImage"),
  { ssr: false }
);
import { ArrowRight } from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/social";
import { Liu_Jian_Mao_Cao } from "next/font/google";
import { useEffect, useRef } from "react";
import {
  LabelReveal,
  ParagraphReveal,
  SectionReveal,
  ButtonReveal,
} from "@/components/animations/TextReveal";

const liuJianMaoCao = Liu_Jian_Mao_Cao({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// Codrops-style easing
const EASING = [0.77, 0, 0.175, 1] as const;

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

// Hero headline with word-by-word reveal
function AboutHeadline() {
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
        staggerChildren: 0.035,
        delayChildren: 0.1,
      },
    },
  };

  const wordVariants = {
    hidden: {
      y: 80,
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

  const headlineContent = [
    { text: "I'm", className: "text-white/60" },
    { text: "Ranya", className: "text-white" },
    { text: "— an AI creative director and multidisciplinary artist working at the intersection of", className: "text-white/60" },
    { text: "tech", className: "text-white" },
    { text: "and", className: "text-white/60" },
    { text: "human creativity", className: "text-white" },
    { text: ".", className: "text-white/60" },
  ];

  return (
    <h1
      ref={ref}
      className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-light leading-[1.15] tracking-tight mb-8"
    >
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

// Section heading with reveal
function SectionHeading({ children, delay = 0 }: { children: string; delay?: number }) {
  return (
    <LabelReveal delay={delay} className="text-white/40 text-sm font-light uppercase tracking-wider">
      {children}
    </LabelReveal>
  );
}

// Skills/Tools tag with staggered reveal
function TagList({ items, delay = 0 }: { items: string[]; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
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
        staggerChildren: 0.05,
        delayChildren: delay,
      },
    },
  };

  const itemVariants = {
    hidden: {
      y: 30,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: EASING,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className="flex flex-wrap gap-3"
      initial="hidden"
      animate={controls}
      variants={containerVariants}
    >
      {items.map((item) => (
        <motion.span
          key={item}
          variants={itemVariants}
          className="px-4 py-2 border border-white/10 text-white/60 text-sm font-light hover:border-white/30 hover:text-white transition-all duration-300"
        >
          {item}
        </motion.span>
      ))}
    </motion.div>
  );
}

// CTA Heading with WOW animation
function CTAHeading() {
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

  return (
    <h2 ref={ref} className="text-3xl md:text-4xl font-light text-white">
      <motion.span
        className="inline"
        initial="hidden"
        animate={controls}
        variants={containerVariants}
      >
        {["Let's", "create", "something"].map((word, i) => (
          <span key={i} className="inline-block overflow-hidden">
            <motion.span className="inline-block" variants={wordVariants}>
              {word}
              {"\u00A0"}
            </motion.span>
          </span>
        ))}
        <span className="inline-block overflow-hidden">
          <motion.span
            className={[
              liuJianMaoCao.className,
              "wow-gradient inline-block align-baseline px-1 py-2 text-4xl md:text-5xl",
            ].join(" ")}
            variants={wordVariants}
          >
            WOW
          </motion.span>
        </span>
        <span className="inline-block overflow-hidden">
          <motion.span className="inline-block" variants={wordVariants}>
            .
          </motion.span>
        </span>
      </motion.span>
    </h2>
  );
}

export default function AboutPage() {
  return (
    <section className="px-6 md:px-10 pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="max-w-[1800px] mx-auto">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-24 items-center">
          {/* Left - Main Text */}
          <div>
            <AboutHeadline />
            <ParagraphReveal
              delay={0.4}
              className="text-white/50 text-lg md:text-xl font-light leading-relaxed"
            >
              My work is rooted in crafting visual experiences that challenge the perception of how we see things and what we expect from digital art. I operate by a simple manifesto: &quot;Tech doesn&apos;t lead the process. Vision does.&quot;
            </ParagraphReveal>
          </div>

          {/* Right - Personal Image with Progressive Blur Effect */}
          <SectionReveal delay={0.2}>
            <ProgressiveBlurImage
              src="/personal-img.jpg"
              alt="Ranya - AI Creative Director"
              className="w-full max-w-md mx-auto lg:max-w-none"
              blurStrength={0.6}
              blurStart={0.4}
              blurEnd={0.95}
            />
          </SectionReveal>
        </div>

        {/* About Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 mb-24">
          {/* Story */}
          <SectionReveal delay={0.1}>
            <div className="space-y-6">
              <SectionHeading delay={0.1}>The Story</SectionHeading>
              <ParagraphReveal
                delay={0.2}
                className="text-white/70 text-base font-light leading-relaxed"
              >
                What began as a curiosity about the boundaries of AI generative art has evolved into a disciplined creative practice. My journey is not just about using new tools; it is about defining a new medium. I operate as a bridge between the raw data of artificial intelligence and the emotional resonance of traditional art.
              </ParagraphReveal>
              <ParagraphReveal
                delay={0.35}
                className="text-white/70 text-base font-light leading-relaxed"
              >
                Alongside my personal practice, I am part of MoonWhale — a creative-tech company built and powered by curious minds across design, code, AI, and more. It is an initiative where creative ideas grow into powerful digital realities. Today, my work exists to challenge the perception of how we see things, proving that in the right hands, algorithms can be as expressive as a paintbrush.
              </ParagraphReveal>
            </div>
          </SectionReveal>

          {/* Philosophy */}
          <SectionReveal delay={0.2}>
            <div className="space-y-6">
              <SectionHeading delay={0.2}>Philosophy</SectionHeading>
              <ParagraphReveal
                delay={0.3}
                className="text-white/70 text-base font-light leading-relaxed"
              >
                Symbiosis, Not Replacement. I treat AI models as creative partners rather than replacements for human creativity. My work explores the tension between algorithmic calculation and organic imperfection.
              </ParagraphReveal>
              <ParagraphReveal
                delay={0.45}
                className="text-white/70 text-base font-light leading-relaxed"
              >
                I believe the most compelling art emerges when we guide the machine with deep intention. I respect the past by applying traditional artistic principles: composition, lighting, and narrative, while embracing the infinite possibilities of tomorrow. The goal is never just aesthetics; it is about crafting a creation that connects, inspires, and stays with you.
              </ParagraphReveal>
            </div>
          </SectionReveal>

          {/* Approach */}
          <SectionReveal delay={0.3}>
            <div className="space-y-6">
              <SectionHeading delay={0.3}>Approach</SectionHeading>
              <ParagraphReveal
                delay={0.4}
                className="text-white/70 text-base font-light leading-relaxed"
              >
                Engineered Creativity. My process begins with deep technical exploration. I don&apos;t just prompt; I study the nuances of the models. I spend considerable time deconstructing the unique characteristics of each tool to develop custom workflows that unlock their full expressive potential.
              </ParagraphReveal>
              <ParagraphReveal
                delay={0.55}
                className="text-white/70 text-base font-light leading-relaxed"
              >
                Whether I am engineering a static editorial image or directing a complex motion piece, the workflow is rigorous. I combine technical expertise with artistic intuition, ensuring that technology serves the vision, not the other way around.
              </ParagraphReveal>
            </div>
          </SectionReveal>
        </div>

        {/* Skills & Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 mb-24 pt-12 border-t border-white/10">
          {/* Skills */}
          <SectionReveal delay={0.1}>
            <div className="space-y-8">
              <SectionHeading delay={0.1}>Skills & Expertise</SectionHeading>
              <TagList items={skills} delay={0.2} />
            </div>
          </SectionReveal>

          {/* Tools */}
          <SectionReveal delay={0.2}>
            <div className="space-y-8">
              <SectionHeading delay={0.2}>Tools & Technologies</SectionHeading>
              <TagList items={tools} delay={0.3} />
            </div>
          </SectionReveal>
        </div>

        {/* Connect Section */}
        <SectionReveal delay={0.1}>
          <div className="pt-12 border-t border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
              {/* CTA */}
              <div className="space-y-6">
                <CTAHeading />
                <ParagraphReveal
                  delay={0.3}
                  className="text-white/50 text-base font-light"
                >
                  Available for select projects and collaborations.
                </ParagraphReveal>
                <ButtonReveal delay={0.4}>
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
                </ButtonReveal>
              </div>

              {/* Social Links */}
              <SectionReveal delay={0.2}>
                <div className="space-y-6 md:text-right">
                  <LabelReveal
                    delay={0.3}
                    className="text-white/40 text-sm font-light uppercase tracking-wider"
                  >
                    Connect
                  </LabelReveal>
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
              </SectionReveal>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
