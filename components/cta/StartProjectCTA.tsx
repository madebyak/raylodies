"use client";

import Link from "next/link";
import { motion, useInView, useAnimation } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Liu_Jian_Mao_Cao } from "next/font/google";
import { useEffect, useRef } from "react";

const liuJianMaoCao = Liu_Jian_Mao_Cao({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// Codrops-style easing & easeInOutQuint for smooth button animation
const EASING = [0.77, 0, 0.175, 1] as const;
const EASE_IN_OUT_QUINT = [0.83, 0, 0.17, 1] as const;

type CTAVariant = "about" | "project";

interface StartProjectCTAProps {
  variant?: CTAVariant;
}

// Dynamic headline content based on variant
function getHeadlineContent(variant: CTAVariant) {
  if (variant === "about") {
    return {
      regularText: ["Let's", "create", "something"],
      gradientText: "WOW",
      suffix: ".",
    };
  }
  // project variant
  return {
    regularText: ["Ready", "to", "start", "your"],
    gradientText: "next project?",
    suffix: "",
  };
}

function CTAHeading({ variant }: { variant: CTAVariant }) {
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

  const content = getHeadlineContent(variant);

  return (
    <h2
      ref={ref}
      className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-light text-white leading-[1.1]"
    >
      <motion.span
        className="inline"
        initial="hidden"
        animate={controls}
        variants={containerVariants}
      >
        {content.regularText.map((word, i) => (
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
              variant === "about" ? liuJianMaoCao.className : "",
              "wow-gradient inline-block align-baseline px-1",
              variant === "about"
                ? "text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl"
                : "text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl",
            ].join(" ")}
            variants={wordVariants}
          >
            {content.gradientText}
          </motion.span>
        </span>
        {content.suffix && (
          <span className="inline-block overflow-hidden">
            <motion.span className="inline-block" variants={wordVariants}>
              {content.suffix}
            </motion.span>
          </span>
        )}
      </motion.span>
    </h2>
  );
}

function CTAButton() {
  return (
    <Link href="/start-a-project">
      <motion.span
        className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black text-base font-medium tracking-wide group cursor-pointer"
        whileHover={{
          scale: 1.02,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
        }}
        whileTap={{ scale: 0.98 }}
        transition={{
          duration: 0.4,
          ease: EASE_IN_OUT_QUINT,
        }}
      >
        Start a Project
        <motion.span
          className="inline-block"
          initial={{ x: 0 }}
          whileHover={{ x: 4 }}
          transition={{
            duration: 0.4,
            ease: EASE_IN_OUT_QUINT,
          }}
        >
          <ArrowRight size={18} strokeWidth={2} />
        </motion.span>
      </motion.span>
    </Link>
  );
}

function CTASubheading() {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  return (
    <motion.p
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      variants={{
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            delay: 0.3,
            ease: EASING,
          },
        },
      }}
      className="text-white text-lg md:text-xl lg:text-2xl font-light"
    >
      Available for select projects and collaborations.
    </motion.p>
  );
}

function CTAButtonWrapper() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      variants={{
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            delay: 0.5,
            ease: EASING,
          },
        },
      }}
    >
      <CTAButton />
    </motion.div>
  );
}

function CTAVideo() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={controls}
      variants={{
        visible: {
          opacity: 1,
          scale: 1,
          transition: {
            duration: 0.8,
            delay: 0.2,
            ease: EASING,
          },
        },
      }}
      className="relative w-full aspect-[4/3] sm:aspect-video lg:aspect-[4/3] xl:aspect-video overflow-hidden rounded-lg bg-white/5"
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/start-project-video.MP4" type="video/mp4" />
      </video>
    </motion.div>
  );
}

export default function StartProjectCTA({
  variant = "about",
}: StartProjectCTAProps) {
  return (
    <section className="border-t border-white/5 bg-black">
      <div className="px-6 md:px-10 py-16 md:py-24 lg:py-32">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-24 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8 md:space-y-10">
              <CTAHeading variant={variant} />
              <CTASubheading />
              <CTAButtonWrapper />
            </div>

            {/* Right Column - Video */}
            <div className="order-first lg:order-last">
              <CTAVideo />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
