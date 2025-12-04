"use client";

import Link from "next/link";
import { Instagram, Linkedin, Twitter } from "lucide-react";

const socialLinks = [
  { href: "https://instagram.com", label: "Instagram", icon: Instagram },
  { href: "https://linkedin.com", label: "LinkedIn", icon: Linkedin },
  { href: "https://twitter.com", label: "Twitter", icon: Twitter },
];

const footerLinks = [
  { href: "/work", label: "Work" },
  { href: "/store", label: "Store" },
  { href: "/about", label: "About" },
  { href: "/start-a-project", label: "Start a Project" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-black">
      <div className="max-w-[1800px] mx-auto px-6 md:px-10">
        {/* Main Footer Content */}
        <div className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              href="/"
              className="text-white text-xl font-light tracking-wide hover:opacity-70 transition-opacity duration-300"
            >
              Raylodies
            </Link>
            <p className="text-white/40 text-sm font-light leading-relaxed max-w-xs">
              AI Creative Director specializing in AI-generated images and videos.
              Pushing the boundaries of digital creativity.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="text-white/60 text-sm font-light uppercase tracking-wider">
              Navigation
            </h4>
            <nav className="flex flex-col gap-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white/40 text-sm font-light hover:text-white transition-colors duration-300 w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h4 className="text-white/60 text-sm font-light uppercase tracking-wider">
              Connect
            </h4>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-white transition-colors duration-300"
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-xs font-light">
            © {currentYear} Raylodies. All rights reserved.
          </p>
          <p className="text-white/30 text-xs font-light">
            Crafted with AI & Creativity
          </p>
        </div>
      </div>
    </footer>
  );
}

