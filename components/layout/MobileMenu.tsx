'use client';

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";

const CALENDLY_URL = "https://calendly.com/samuel-a-murg/free-discovery-call";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Coaching", href: "/coaching" },
  { label: "Books", href: "/books" },
  { label: "Contact", href: "/contact" },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-ink/30 z-40 md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.nav
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 h-full w-[80vw] max-w-sm bg-cream z-50 flex flex-col md:hidden shadow-2xl"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <span className="font-body text-sm text-charcoal-muted tracking-widest uppercase">
                Menu
              </span>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-charcoal-mid hover:text-charcoal transition-colors"
                aria-label="Close menu"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4L16 16M16 4L4 16" />
                </svg>
              </button>
            </div>

            <div className="flex-1 flex flex-col px-6 py-8 gap-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.4, ease: "easeOut" }}
                >
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="block py-3.5 font-heading text-xl text-charcoal hover:text-green transition-colors border-b border-border/50"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="px-6 py-8 border-t border-border"
            >
              <Link
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="block w-full bg-green text-cream text-center py-4 px-4 font-body text-xs font-medium tracking-wide hover:bg-green-hover transition-colors duration-300"
              >
                Book your free 20-minute call
              </Link>
            </motion.div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
