'use client';

import { motion } from "framer-motion";
import Link from "next/link";

const CALENDLY_URL = "https://calendly.com/samuel-a-murg/free-discovery-call";

export default function CoachingFinalCTA() {
  return (
    <section
      className="relative py-24 md:py-36 px-5 md:px-8 lg:px-12 overflow-hidden"
      aria-label="Start a conversation"
    >
      {/* Lens rings — right edge */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-end pr-0 opacity-[0.035]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 300 300" className="w-56 h-56 md:w-80 md:h-80" fill="none">
          <circle cx="300" cy="150" r="280" stroke="#2A2722" strokeWidth="1" />
          <circle cx="300" cy="150" r="220" stroke="#2A2722" strokeWidth="0.5" />
          <circle cx="300" cy="150" r="160" stroke="#2A2722" strokeWidth="0.5" />
          <circle cx="300" cy="150" r="100" stroke="#2A2722" strokeWidth="0.5" />
          <circle cx="300" cy="150" r="50" stroke="#2A2722" strokeWidth="1" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="max-w-xl">

          <motion.h2
            initial={{ opacity: 0, filter: "blur(6px)", y: 8 }}
            whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 1.0, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className="font-heading text-3xl md:text-4xl lg:text-5xl text-charcoal leading-tight mb-5"
          >
            You do not have to know exactly what is wrong to start a
            conversation.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="font-body text-base text-charcoal-mid mb-10 leading-relaxed"
          >
            If something here feels familiar, the next step is simple.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-10"
          >
            <Link
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-green text-cream px-8 py-4 md:px-10 md:py-5 font-body text-sm font-medium tracking-wide hover:bg-green-hover transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green group"
            >
              Book your free 20-minute call
              <span
                className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          </motion.div>

          {/* Contact details */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col gap-1.5 pt-8 border-t border-border"
          >
            <a
              href="mailto:samuel.a.murg@gmail.com"
              className="font-body text-sm text-charcoal-mid hover:text-green transition-colors duration-300"
            >
              samuel.a.murg@gmail.com
            </a>
            <a
              href="tel:07804743725"
              className="font-body text-sm text-charcoal-mid hover:text-green transition-colors duration-300"
            >
              07804 743 725
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
