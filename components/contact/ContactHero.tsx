'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { openSamChat } from "@/lib/sam-chat-events";

const CALENDLY_URL = "https://calendly.com/samuel-a-murg/free-discovery-call";

export default function ContactHero() {
  return (
    <section
      className="relative pt-28 pb-20 md:pt-40 md:pb-28 flex flex-col justify-center overflow-hidden"
      aria-label="Contact hero"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 45%, #EDE8DF 0%, #F5F0EA 65%, #F5F0EA 100%)",
        }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        style={{ originX: 0 }}
        className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-border"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cream to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-5 md:px-8 lg:px-12 text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="font-body text-xs text-charcoal-muted tracking-[0.2em] uppercase mb-6"
        >
          Contact / Perception 47
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, filter: "blur(10px)", y: 6 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="font-heading font-normal text-[2.15rem] sm:text-5xl md:text-[3.5rem] lg:text-[4rem] text-charcoal leading-[1.1] max-w-3xl mx-auto mb-7"
        >
          Start with a conversation.
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
          className="h-px w-10 bg-border mx-auto mb-7"
          aria-hidden="true"
        />

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1, ease: "easeOut" }}
          className="font-body text-sm md:text-base text-charcoal-mid max-w-lg mx-auto leading-relaxed mb-10"
        >
          If something here feels familiar, the next step does not need to be
          complicated. You can book a free 20-minute call, ask a question, or
          simply reach out.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
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

          <button
            type="button"
            onClick={openSamChat}
            className="inline-flex items-center justify-center px-7 py-3.5 border border-border font-body text-sm text-charcoal-mid hover:border-charcoal-mid hover:text-charcoal hover:bg-cream-deep transition-colors duration-300"
            aria-label="Ask a question using Sam AI"
          >
            Ask a question first
          </button>
        </motion.div>
      </div>
    </section>
  );
}
