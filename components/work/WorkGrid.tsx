"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectListItem } from "@/types/database";
import CategoryFilter from "./CategoryFilter";
import WorkCard from "./WorkCard";

const categories = [
  { value: "all", label: "All" },
  { value: "ai-images", label: "AI Images" },
  { value: "ai-videos", label: "AI Videos" },
];

export default function WorkGrid({
  initialProjects,
}: {
  initialProjects: ProjectListItem[];
}) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredProjects =
    activeCategory === "all"
      ? initialProjects
      : initialProjects.filter(
          (p) =>
            p.categories?.slug === activeCategory ||
            p.categories?.name
              .toLowerCase()
              .includes(activeCategory.replace("ai-", "")),
        );

  return (
    <div className="space-y-10">
      {/* Filter */}
      <CategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="columns-1 md:columns-2 lg:columns-3 2xl:columns-4 [column-gap:1.5rem] md:[column-gap:2rem]"
        >
          {filteredProjects.map((project, index) => (
            <WorkCard key={project.id} project={project} index={index} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-20">
          <p className="text-white/40 text-lg font-light">
            No projects found in this category.
          </p>
        </div>
      )}
    </div>
  );
}
