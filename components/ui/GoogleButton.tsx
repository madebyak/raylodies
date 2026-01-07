"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GoogleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

const GoogleButton = forwardRef<HTMLButtonElement, GoogleButtonProps>(
  ({ className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "group relative w-full overflow-hidden rounded-lg border border-white/20 bg-white px-6 py-3.5 text-base font-medium text-black transition-all duration-300",
          "hover:bg-white/90",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        )}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-3">
          {/* Google "G" Logo - Official colors */}
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            className="shrink-0 transition-transform duration-300 group-hover:scale-110"
            aria-hidden="true"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>

          <span className="text-black transition-colors duration-300">
            {children || "Continue with Google"}
          </span>
        </span>
      </button>
    );
  },
);

GoogleButton.displayName = "GoogleButton";

export default GoogleButton;
