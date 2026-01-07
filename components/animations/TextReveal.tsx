"use client";

import { motion, useInView, useAnimation, Variants } from "framer-motion";
import { useEffect, useRef, ReactNode } from "react";

// Codrops-style easing curves
const EASING = {
  // Primary reveal easing - smooth and elegant
  reveal: [0.77, 0, 0.175, 1] as const, // easeInOutQuart
  // Secondary easing for subtle movements
  smooth: [0.16, 1, 0.3, 1] as const, // easeOutExpo
};

// Animation configuration
const CONFIG = {
  // Duration for each element
  duration: 0.8,
  // Stagger delay between elements
  staggerDelay: 0.035,
  // Y offset for slide-up effect
  yOffset: 100,
};

interface TextRevealProps {
  children: string;
  className?: string;
  /** Delay before animation starts (seconds) */
  delay?: number;
  /** Animation type: 'lines' splits by line breaks, 'words' by spaces, 'chars' by character */
  splitBy?: "lines" | "words" | "chars";
  /** If true, animates on page load. If false, animates when scrolled into view */
  triggerOnLoad?: boolean;
  /** Custom stagger delay between elements */
  staggerDelay?: number;
  /** Custom animation duration */
  duration?: number;
}

// Line/Word reveal with clip-path and transform
function RevealElement({
  children,
  delay,
  duration,
  isInView,
  triggerOnLoad,
}: {
  children: ReactNode;
  delay: number;
  duration: number;
  isInView: boolean;
  triggerOnLoad: boolean;
}) {
  const controls = useAnimation();

  useEffect(() => {
    if (triggerOnLoad || isInView) {
      controls.start("visible");
    }
  }, [controls, isInView, triggerOnLoad]);

  const variants: Variants = {
    hidden: {
      y: CONFIG.yOffset,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration,
        delay,
        ease: EASING.reveal,
      },
    },
  };

  return (
    <span className="inline-block overflow-hidden">
      <motion.span
        className="inline-block"
        initial="hidden"
        animate={controls}
        variants={variants}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function TextReveal({
  children,
  className = "",
  delay = 0,
  splitBy = "words",
  triggerOnLoad = false,
  staggerDelay = CONFIG.staggerDelay,
  duration = CONFIG.duration,
}: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-10%",
  });

  // Split text based on type
  const elements = splitText(children, splitBy);

  // We use a wrapper div for ref tracking, then render the semantic tag inside
  return (
    <span ref={ref} className={className}>
      {elements.map((element, index) => (
        <RevealElement
          key={index}
          delay={delay + index * staggerDelay}
          duration={duration}
          isInView={isInView}
          triggerOnLoad={triggerOnLoad}
        >
          {element}
          {splitBy === "words" && index < elements.length - 1 ? "\u00A0" : ""}
        </RevealElement>
      ))}
    </span>
  );
}

// Split text helper
function splitText(
  text: string,
  splitBy: "lines" | "words" | "chars",
): string[] {
  switch (splitBy) {
    case "lines":
      return text.split("\n").filter(Boolean);
    case "chars":
      return text.split("");
    case "words":
    default:
      return text.split(" ").filter(Boolean);
  }
}

// Enhanced heading reveal with support for mixed content (spans with different colors)
interface HeadingRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  triggerOnLoad?: boolean;
  staggerDelay?: number;
  as?: "h1" | "h2" | "h3" | "h4";
}

export function HeadingReveal({
  children,
  className = "",
  delay = 0,
  triggerOnLoad = false,
  staggerDelay = 0.05,
  as: Tag = "h1",
}: HeadingRevealProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-10%",
  });
  const controls = useAnimation();

  useEffect(() => {
    if (triggerOnLoad || isInView) {
      controls.start("visible");
    }
  }, [controls, isInView, triggerOnLoad]);

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const childVariants: Variants = {
    hidden: {
      y: CONFIG.yOffset,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: CONFIG.duration,
        ease: EASING.reveal,
      },
    },
  };

  return (
    <Tag ref={ref} className={className}>
      <motion.span
        className="inline"
        initial="hidden"
        animate={controls}
        variants={containerVariants}
      >
        {processChildren(children, childVariants)}
      </motion.span>
    </Tag>
  );
}

// Process children to wrap each word in motion.span
function processChildren(children: ReactNode, variants: Variants): ReactNode {
  if (typeof children === "string") {
    return children.split(" ").map((word, i, arr) => (
      <span key={i} className="inline-block overflow-hidden">
        <motion.span className="inline-block" variants={variants}>
          {word}
          {i < arr.length - 1 ? "\u00A0" : ""}
        </motion.span>
      </span>
    ));
  }

  if (Array.isArray(children)) {
    return children.map((child, index) => (
      <span key={index} className="inline">
        {processChildren(child, variants)}
      </span>
    ));
  }

  // Handle React elements (like <span className="text-white">)
  if (
    typeof children === "object" &&
    children !== null &&
    "props" in children
  ) {
    const element = children as React.ReactElement<{
      children?: ReactNode;
      className?: string;
    }>;
    const { children: innerChildren, className, ...props } = element.props;

    if (typeof innerChildren === "string") {
      return innerChildren.split(" ").map((word, i, arr) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className={`inline-block ${className || ""}`}
            variants={variants}
            {...props}
          >
            {word}
            {i < arr.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ));
    }

    return (
      <span className="inline-block overflow-hidden">
        <motion.span
          className={`inline-block ${className || ""}`}
          variants={variants}
          {...props}
        >
          {innerChildren}
        </motion.span>
      </span>
    );
  }

  return children;
}

// Paragraph reveal - line by line with smooth animation
interface ParagraphRevealProps {
  children: string;
  className?: string;
  delay?: number;
  triggerOnLoad?: boolean;
}

export function ParagraphReveal({
  children,
  className = "",
  delay = 0,
  triggerOnLoad = false,
}: ParagraphRevealProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-10%",
  });
  const controls = useAnimation();

  useEffect(() => {
    if (triggerOnLoad || isInView) {
      controls.start("visible");
    }
  }, [controls, isInView, triggerOnLoad]);

  const variants: Variants = {
    hidden: {
      y: 40,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.7,
        delay,
        ease: EASING.reveal,
      },
    },
  };

  return (
    <motion.p
      ref={ref}
      className={className}
      initial="hidden"
      animate={controls}
      variants={variants}
    >
      {children}
    </motion.p>
  );
}

// Section reveal - for larger content blocks
interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function SectionReveal({
  children,
  className = "",
  delay = 0,
}: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-5%",
  });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  const variants: Variants = {
    hidden: {
      y: 60,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        delay,
        ease: EASING.reveal,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={controls}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

// Label/subtitle reveal with character animation
interface LabelRevealProps {
  children: string;
  className?: string;
  delay?: number;
  triggerOnLoad?: boolean;
}

export function LabelReveal({
  children,
  className = "",
  delay = 0,
  triggerOnLoad = false,
}: LabelRevealProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-10%",
  });
  const controls = useAnimation();

  useEffect(() => {
    if (triggerOnLoad || isInView) {
      controls.start("visible");
    }
  }, [controls, isInView, triggerOnLoad]);

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.02,
        delayChildren: delay,
      },
    },
  };

  const charVariants: Variants = {
    hidden: {
      y: 20,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: EASING.smooth,
      },
    },
  };

  return (
    <motion.p
      ref={ref}
      className={className}
      initial="hidden"
      animate={controls}
      variants={containerVariants}
    >
      {children.split("").map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={charVariants}
          style={{ whiteSpace: char === " " ? "pre" : "normal" }}
        >
          {char}
        </motion.span>
      ))}
    </motion.p>
  );
}

// Button reveal
interface ButtonRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  triggerOnLoad?: boolean;
}

export function ButtonReveal({
  children,
  className = "",
  delay = 0,
  triggerOnLoad = false,
}: ButtonRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-10%",
  });
  const controls = useAnimation();

  useEffect(() => {
    if (triggerOnLoad || isInView) {
      controls.start("visible");
    }
  }, [controls, isInView, triggerOnLoad]);

  const variants: Variants = {
    hidden: {
      y: 30,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        delay,
        ease: EASING.reveal,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={controls}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
