"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Send, CheckCircle } from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/social";

const projectTypes = [
  { value: "", label: "Select project type" },
  { value: "ai-imagery", label: "AI Imagery" },
  { value: "ai-video", label: "AI Video" },
  { value: "brand-identity", label: "Brand Identity" },
  { value: "creative-direction", label: "Creative Direction" },
  { value: "consultation", label: "Consultation" },
  { value: "other", label: "Other" },
];

const budgetRanges = [
  { value: "", label: "Select budget range" },
  { value: "under-5k", label: "Under $5,000" },
  { value: "5k-10k", label: "$5,000 - $10,000" },
  { value: "10k-25k", label: "$10,000 - $25,000" },
  { value: "25k-50k", label: "$25,000 - $50,000" },
  { value: "50k-plus", label: "$50,000+" },
];

export default function StartAProjectPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    projectType: "",
    budget: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <section className="px-6 md:px-10 pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left Column - Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-12"
          >
            {/* Header */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight">
                Let&apos;s create something remarkable.
              </h1>
              <p className="text-white/50 text-lg font-light max-w-md">
                Have a project in mind? I&apos;d love to hear about it. Fill out
                the form and I&apos;ll get back to you within 48 hours.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-8 pt-8 border-t border-white/10">
              {/* Email */}
              <div className="space-y-2">
                <h3 className="text-white/40 text-sm font-light uppercase tracking-wider">
                  Email
                </h3>
                <a
                  href="mailto:hello@raylodies.com"
                  className="text-white text-lg font-light hover:text-white/70 transition-colors duration-300"
                >
                  hello@raylodies.com
                </a>
              </div>

              {/* Social */}
              <div className="space-y-4">
                <h3 className="text-white/40 text-sm font-light uppercase tracking-wider">
                  Follow
                </h3>
                <div className="flex items-center gap-6">
                  {SOCIAL_LINKS.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/40 hover:text-white transition-colors duration-300"
                      aria-label={social.label}
                    >
                      <social.icon size={22} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-3 pt-8 border-t border-white/10">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-white/60 text-sm font-light">
                Currently accepting new projects
              </span>
            </div>
          </motion.div>

          {/* Right Column - Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* Name */}
                  <Input
                    label="Name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />

                  {/* Email */}
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />

                  {/* Project Type */}
                  <Select
                    label="Project Type"
                    name="projectType"
                    options={projectTypes}
                    value={formData.projectType}
                    onChange={handleChange}
                    required
                  />

                  {/* Budget */}
                  <Select
                    label="Budget Range"
                    name="budget"
                    options={budgetRanges}
                    value={formData.budget}
                    onChange={handleChange}
                  />

                  {/* Message */}
                  <Textarea
                    label="Project Details"
                    name="message"
                    placeholder="Tell me about your project, goals, and timeline..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-white text-black text-sm font-light tracking-wide hover:bg-white/90 transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full"
                        />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send size={16} />
                      </>
                    )}
                  </motion.button>

                  <p className="text-white/30 text-xs font-light text-center">
                    I typically respond within 48 hours
                  </p>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center py-20 space-y-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                    }}
                  >
                    <CheckCircle size={64} className="text-white/80" />
                  </motion.div>
                  <h2 className="text-2xl md:text-3xl font-light text-white">
                    Message sent successfully!
                  </h2>
                  <p className="text-white/50 text-base font-light max-w-sm">
                    Thank you for reaching out. I&apos;ll review your message
                    and get back to you within 48 hours.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        projectType: "",
                        budget: "",
                        message: "",
                      });
                    }}
                    className="text-white/40 text-sm font-light hover:text-white transition-colors duration-300 mt-4"
                  >
                    Send another message
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
