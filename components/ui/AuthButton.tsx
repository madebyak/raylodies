"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "group relative w-full overflow-hidden rounded-lg border border-white/20 bg-white px-6 py-3.5 text-base font-medium text-black transition-all duration-300",
          "hover:border-[var(--color-accent)]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-white/20",
          className,
        )}
        {...props}
      >
        {/* Purple background that slides up on hover */}
        <span
          className="absolute inset-0 bg-[var(--color-accent)] translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-disabled:group-hover:translate-y-full"
          aria-hidden="true"
        />

        {/* Text content */}
        <span className="relative z-10 transition-colors duration-300 group-hover:text-white group-disabled:group-hover:text-black">
          {children}
        </span>
      </button>
    );
  },
);

AuthButton.displayName = "AuthButton";

export default AuthButton;
