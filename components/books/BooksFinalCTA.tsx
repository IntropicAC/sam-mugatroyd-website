'use client';

import { motion } from "framer-motion";
import Link from "next/link";

const CALENDLY_URL = "https://calendly.com/samuel-a-murg/free-discovery-call";

export default function BooksFinalCTA() {
  return (
    <section
      className="relative py-24 md:py-36 px-5 md:px-8 lg:px-12 overflow-hidden"
      aria-label="Start a conversation"
    >
      {/* Subtle decorative rule — top */}
      <div className="absolute top-0 left-5 right-5 md:left-8 md:right-8 lg:left-12 lg:right-12 h-px bg-border/50" aria-hidden="true" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="max-w-xl">

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="font-body text-xs text-charcoal-muted tracking-[0.18em] uppercase mb-6"
          >
            The Next Step
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, filter: "blur(6px)", y: 8 }}
            whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 1.0, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className="font-heading text-3xl md:text-4xl lg:text-5xl text-charcoal leading-tight mb-5"
          >
            If the books speak to something you have been carrying, the next
            step is a conversation.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="font-body text-base text-charcoal-mid mb-10 leading-relaxed"
          >
            You do not have to know exactly what is wrong to start. You only
            have to recognise that something here feels familiar.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col sm:flex-row sm:items-center gap-4"
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

            <Link
              href="/coaching"
              className="font-body text-sm text-charcoal-mid hover:text-charcoal transition-colors duration-300 tracking-wide"
            >
              Explore coaching →
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
