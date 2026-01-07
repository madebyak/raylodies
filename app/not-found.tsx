"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 md:px-10">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <h1 className="text-8xl md:text-9xl font-light text-white/10">404</h1>
          <h2 className="text-2xl md:text-3xl font-light text-white">
            Page not found
          </h2>
          <p className="text-white/50 text-base font-light max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
          <div className="pt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white text-sm font-light tracking-wide hover:border-white/40 hover:bg-white/5 transition-all duration-300"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
