'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function ChatIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14 1H2C1.45 1 1 1.45 1 2V10C1 10.55 1.45 11 2 11H5V14.5L9.5 11H14C14.55 11 15 10.55 15 10V2C15 1.45 14.55 1 14 1Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.85, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 12 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-5 z-20 flex items-center gap-2 bg-charcoal text-cream px-4 py-2.5 rounded-full shadow-lg font-body text-xs font-medium tracking-wide cursor-pointer md:right-8 md:bottom-8 md:px-5 md:py-3 md:text-sm"
          aria-label="Ask a question"
        >
          <ChatIcon />
          Have a question?
        </motion.button>
      )}
    </AnimatePresence>
  );
}
