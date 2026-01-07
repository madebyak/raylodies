"use client";

import { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", children, ...props },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-light transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-white text-black hover:bg-white/90 active:bg-white/80",
      secondary:
        "bg-transparent text-white border border-white/20 hover:border-white/40 hover:bg-white/5",
      ghost: "bg-transparent text-white/60 hover:text-white hover:bg-white/5",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs tracking-wide",
      md: "px-6 py-3 text-sm tracking-wide",
      lg: "px-8 py-4 text-base tracking-wide",
    };

    return (
      <motion.button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);

Button.displayName = "Button";

export default Button;
