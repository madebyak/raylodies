"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projects, Project } from "@/lib/data";
import CategoryFilter from "./CategoryFilter";
import WorkCard from "./WorkCard";

const categories = [
  { value: "all", label: "All" },
  { value: "ai-images", label: "AI Images" },
  { value: "ai-videos", label: "AI Videos" },
];

export default function WorkGrid() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredProjects =
    activeCategory === "all"
      ? projects
      : projects.filter((p: Project) => p.category === activeCategory);

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
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
        >
          {filteredProjects.map((project: Project, index: number) => (
            <WorkCard
              key={project.id}
              project={project}
              index={index}
              featured={index === 0 && activeCategory === "all"}
            />
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

