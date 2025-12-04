"use client";

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const baseInputStyles = `
  w-full bg-transparent border border-white/10 text-white placeholder:text-white/30
  font-light transition-all duration-300
  focus:border-white/30 focus:outline-none focus:ring-0
  hover:border-white/20
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-white/60 text-sm font-light">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(baseInputStyles, "px-4 py-3 text-sm", className)}
          {...props}
        />
        {error && (
          <p className="text-red-400 text-xs font-light">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-white/60 text-sm font-light">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            baseInputStyles,
            "px-4 py-3 text-sm min-h-[150px] resize-none",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-red-400 text-xs font-light">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export const Select = forwardRef<
  HTMLSelectElement,
  InputHTMLAttributes<HTMLSelectElement> & {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
  }
>(({ className, label, error, options, ...props }, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-white/60 text-sm font-light">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          baseInputStyles,
          "px-4 py-3 text-sm appearance-none cursor-pointer bg-black",
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-black">
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-400 text-xs font-light">{error}</p>
      )}
    </div>
  );
});

Select.displayName = "Select";

export default Input;

