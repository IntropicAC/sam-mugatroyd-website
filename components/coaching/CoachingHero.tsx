'use client';

import { motion } from "framer-motion";
import Link from "next/link";

const CALENDLY_URL = "https://calendly.com/samuel-a-murg/free-discovery-call";

export default function CoachingHero() {
  return (
    <section
      className="relative min-h-dvh flex flex-col justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Warm gradient wash — no lens motif */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cream-deep/70 via-cream to-cream"
        aria-hidden="true"
      />

      {/* Fine ruled lines — like an editorial page */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent, transparent 71px, #2A2722 71px, #2A2722 72px)",
        }}
        aria-hidden="true"
      />

      {/* Animated top rule — draws in on load */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        style={{ originX: 0 }}
        className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-border"
        aria-hidden="true"
      />

      {/* Bottom gradient */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cream to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-5 md:px-8 lg:px-12 pt-20 md:pt-28 pb-10 md:pb-16">

        {/* Mobile eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="md:hidden font-body text-xs text-charcoal-muted tracking-[0.18em] uppercase mb-5"
        >
          Coaching
        </motion.p>

        {/* Editorial two-column layout — desktop */}
        <div className="md:grid md:grid-cols-12 md:gap-10 lg:gap-14 md:items-start">

          {/* Left sidebar — page label with vertical rule */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0, delay: 0.25, ease: "easeOut" }}
            className="hidden md:flex md:col-span-2 flex-col gap-1 border-r border-border/70 pr-6 pt-1"
          >
            <p className="font-body text-[10px] text-charcoal-muted tracking-[0.2em] uppercase">
              Coaching
            </p>
            <p className="font-body text-[10px] text-charcoal-muted/40 tracking-wide">
              Perception 47
            </p>
          </motion.div>

          {/* Main content */}
          <div className="md:col-span-10">

            <motion.h1
              initial={{ opacity: 0, filter: "blur(10px)", y: 6 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="font-heading font-normal text-[1.75rem] sm:text-4xl md:text-5xl lg:text-[3.5rem] text-charcoal leading-[1.18] max-w-3xl mb-5 md:mb-7"
            >
              You do not need a new mindset.
              <br />
              You need a new lens{" "}
              <em className="not-italic text-green">
                to see the world through.
              </em>
            </motion.h1>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
              style={{ originX: 0 }}
              className="h-px w-10 bg-border mb-5 md:mb-6"
              aria-hidden="true"
            />

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1, ease: "easeOut" }}
              className="font-body text-sm md:text-base text-charcoal-mid max-w-sm leading-relaxed mb-3"
            >
              Most coaches offer motivation. Techniques. Frameworks. Things you
              can apply on a good day and forget on a bad one.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.25, ease: "easeOut" }}
              className="font-heading italic text-base md:text-lg text-charcoal max-w-sm leading-snug mb-7 md:mb-9"
            >
              This is different.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.45, ease: "easeOut" }}
            >
              <Link
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-green text-cream px-7 py-3.5 md:px-8 md:py-4 font-body text-sm font-medium tracking-wide hover:bg-green-hover transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green group"
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
          </div>
        </div>
      </div>
    </section>
  );
}
