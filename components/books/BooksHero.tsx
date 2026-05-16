'use client';

import Image from "next/image";
import { motion } from "framer-motion";

export default function BooksHero() {
  return (
    <section
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-cream"
      aria-label="Books hero"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cream-deep/55 via-cream to-cream"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.038]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent, transparent 71px, #2A2722 71px, #2A2722 72px)",
        }}
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -left-32 top-1/3 h-72 w-72 rounded-full bg-green/8 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-charcoal/[0.04] blur-3xl"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.1, ease: "easeOut" }}
        className="pointer-events-none absolute inset-4 border border-charcoal/12 md:inset-8 lg:inset-10"
        aria-hidden="true"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, delay: 0.4, ease: "easeOut" }}
        className="pointer-events-none absolute inset-6 border border-charcoal/8 md:inset-12 lg:inset-14"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-2xl px-8 py-16 text-center md:px-12 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
          className="mx-auto mb-10 flex w-fit items-center justify-center md:mb-14"
        >
          <Image
            src="/images/perception-47-logo.png"
            alt="Perception 47"
            width={56}
            height={56}
            className="h-10 w-auto opacity-80 md:h-12"
            priority
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
          className="font-body text-[10.5px] tracking-[0.32em] uppercase text-charcoal-muted mb-8 md:mb-10"
        >
          Books · The Collection
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, filter: "blur(12px)", y: 6 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 1.3, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-heading font-normal text-[clamp(2.2rem,8.4vw,3.75rem)] leading-[1.06] text-charcoal mb-9 md:mb-11"
        >
          Three books.{" "}
          <em className="italic text-green">
            One question running through all of them.
          </em>
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.1, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mb-8 h-px w-14 bg-charcoal/30 md:mb-10"
          aria-hidden="true"
        />

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.2, ease: "easeOut" }}
          className="font-body text-[15px] md:text-base text-charcoal-mid leading-relaxed mb-7 md:mb-8 max-w-md mx-auto"
        >
          Identity, honesty, belonging, performance — and what becomes
          possible when we stop living as the version of ourselves the
          world taught us to be.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.35, ease: "easeOut" }}
          className="font-heading italic text-[16px] md:text-lg text-charcoal/85 leading-snug max-w-sm mx-auto"
        >
          The books sit behind the coaching. They are where much of it began.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 1.65 }}
          className="mt-10 flex flex-col items-center gap-2 md:mt-14"
        >
          <span className="font-body text-[10px] tracking-[0.3em] uppercase text-charcoal-muted/80">
            Sam Murgatroyd
          </span>
          <span className="h-2 w-px bg-charcoal-muted/40" aria-hidden="true" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.8 }}
        className="pointer-events-none absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <span className="font-body text-[9.5px] tracking-[0.3em] uppercase text-charcoal-muted/70">
          Read on
        </span>
        <motion.span
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="block h-4 w-px bg-charcoal-muted/50"
        />
      </motion.div>
    </section>
  );
}
