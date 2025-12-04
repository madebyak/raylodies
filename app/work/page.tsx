"use client";

import { motion } from "framer-motion";
import WorkGrid from "@/components/work/WorkGrid";

export default function WorkPage() {
  return (
    <section className="px-6 md:px-10 pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="max-w-[1800px] mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 md:mb-16"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6">
            Work
          </h1>
          <p className="text-white/50 text-lg md:text-xl font-light max-w-2xl">
            A collection of AI-generated images and videos, exploring the
            boundaries of digital creativity and artificial intelligence.
          </p>
        </motion.div>

        {/* Work Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <WorkGrid />
        </motion.div>
      </div>
    </section>
  );
}

