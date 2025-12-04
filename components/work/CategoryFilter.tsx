"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: { value: string; label: string }[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 md:gap-4">
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onCategoryChange(category.value)}
          className={cn(
            "relative px-4 py-2 text-sm font-light transition-colors duration-300",
            activeCategory === category.value
              ? "text-white"
              : "text-white/40 hover:text-white/70"
          )}
        >
          {category.label}
          {activeCategory === category.value && (
            <motion.span
              layoutId="activeCategory"
              className="absolute bottom-0 left-0 right-0 h-px bg-white"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

