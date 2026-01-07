"use client";

import {
  forwardRef,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const baseInputStyles = `
  w-full bg-white/[0.03] border border-white/20 rounded-lg text-white placeholder:text-white/50 placeholder:text-base
  font-light transition-all duration-300
  focus:border-white/40 focus:bg-white/[0.05] focus:outline-none focus:ring-0
  hover:border-white/30 hover:bg-white/[0.04]
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-white text-sm font-light">{label}</label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={cn(
              baseInputStyles,
              "px-4 py-3.5 text-base",
              isPassword && "pr-12",
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors duration-200"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff size={18} strokeWidth={1.5} />
              ) : (
                <Eye size={18} strokeWidth={1.5} />
              )}
            </button>
          )}
        </div>
        {error && <p className="text-red-400 text-xs font-light">{error}</p>}
      </div>
    );
  },
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
            className,
          )}
          {...props}
        />
        {error && <p className="text-red-400 text-xs font-light">{error}</p>}
      </div>
    );
  },
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
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            baseInputStyles,
            "px-4 py-3 pr-10 text-sm appearance-none cursor-pointer",
            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[#0a0a0a] text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
        {/* Dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-white/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {error && <p className="text-red-400 text-xs font-light">{error}</p>}
    </div>
  );
});

Select.displayName = "Select";

export default Input;
