"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";

const baseNavLinks = [
  { href: "/work", label: "Work" },
  { href: "/store", label: "Store" },
  { href: "/about", label: "About" },
  { href: "/start-a-project", label: "Start a Project" },
];

// easeInOutQuint easing function
const easeInOutQuint = [0.83, 0, 0.17, 1] as const;

interface NavLinkProps {
  href: string;
  label: string;
  isActive: boolean;
  showIcon?: boolean;
}

function NavLink({ href, label, isActive, showIcon }: NavLinkProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Link content wrapper - moves up on hover */}
      <motion.span
        className="inline-flex items-center gap-1.5 text-sm font-light text-white"
        animate={{
          y: isHovered ? -2 : 0,
        }}
        transition={{
          duration: 0.4,
          ease: easeInOutQuint,
        }}
      >
        {showIcon && (
          <UserRound size={16} strokeWidth={1} className="text-white" />
        )}
        {label}
      </motion.span>

      {/* Underline - reveals left to right on hover */}
      <motion.span
        className="absolute left-0 bottom-[-4px] h-[2px] bg-accent"
        initial={{ width: isActive ? "100%" : "0%" }}
        animate={{
          width: isHovered || isActive ? "100%" : "0%",
        }}
        transition={{
          duration: 0.4,
          ease: easeInOutQuint,
        }}
        style={{ originX: 0 }}
      />
    </Link>
  );
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const userLink = user
    ? { href: "/account", label: "Account", isUserLink: true }
    : { href: "/login", label: "Sign In", isUserLink: false };

  const navLinks = [
    ...baseNavLinks.map((link) => ({ ...link, isUserLink: false })),
    userLink,
  ];

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-black/80 backdrop-blur-md border-b border-white/5"
          : "bg-transparent",
      )}
    >
      <nav className="max-w-[1800px] mx-auto px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-white hover:opacity-70 transition-opacity duration-300 flex items-center"
          aria-label="Raylodies"
        >
          <span className="sr-only">Raylodies</span>
          <Image
            src="/white-logo.svg"
            alt=""
            width={320}
            height={80}
            className="h-10 md:h-12 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              isActive={pathname === link.href}
              showIcon={link.isUserLink && user !== null}
            />
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-white p-2 hover:opacity-70 transition-opacity"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden bg-black/95 backdrop-blur-md border-b border-white/5 overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-5">
              {/* Nav Links */}
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "inline-flex items-center gap-2 text-lg font-light transition-colors duration-300",
                      pathname === link.href
                        ? "text-white"
                        : "text-white hover:text-white/80",
                    )}
                  >
                    {link.isUserLink && user && (
                      <UserRound
                        size={18}
                        strokeWidth={1}
                        className="text-white"
                      />
                    )}
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
