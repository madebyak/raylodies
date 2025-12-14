"use client";

import { motion } from "framer-motion";

export default function HeroVideo() {
  return (
    <section className="w-full px-6 md:px-10 py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[1800px] mx-auto"
      >
        <div className="relative w-full aspect-video overflow-hidden bg-white/5">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/Hero-section-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </motion.div>
    </section>
  );
}


