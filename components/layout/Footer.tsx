"use client";

import Link from "next/link";
import { SOCIAL_LINKS } from "@/lib/social";

const footerLinks = [
  { href: "/work", label: "Work" },
  { href: "/store", label: "Store" },
  { href: "/about", label: "About" },
  { href: "/start-a-project", label: "Start a Project" },
];

const legalLinks = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/refund", label: "Refunds" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-black">
      <div className="max-w-[1800px] mx-auto px-6 md:px-10">
        {/* Main Footer Content */}
        <div className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              href="/"
              className="text-white text-xl font-light tracking-wide hover:opacity-70 transition-opacity duration-300"
            >
              Raylodies
            </Link>
            <p className="text-white/40 text-sm font-light leading-relaxed max-w-xs">
              Not just art. A mindset of believing that something beautiful can
              grow out of nothing.
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
              {SOCIAL_LINKS.map((social) => (
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

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-white/60 text-sm font-light uppercase tracking-wider">
              Legal
            </h4>
            <nav className="flex flex-col gap-2">
              {legalLinks.map((link) => (
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
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-xs font-light">
            © {currentYear} Raylodies. All rights reserved.
          </p>
          <p className="text-white/30 text-xs font-light">
            <span>Crafted with AI & Creativity</span>
            <span className="mx-2 text-white/20">•</span>
            <a
              href="https://www.moonswhale.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/50 transition-colors"
            >
              Powered by MoonWhale
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

