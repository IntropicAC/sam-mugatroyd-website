'use client';

import Link from "next/link";
import { OnceMotion } from "@/components/ui/OnceMotion";

const CALENDLY_URL = "https://calendly.com/samuel-a-murg/free-discovery-call";

export default function FinalCTA() {
  return (
    <section
      className="relative py-24 md:py-36 px-5 md:px-8 lg:px-12 overflow-hidden"
      aria-label="Book a call"
    >
      {/* Subtle background texture — concentric rings */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-end pr-0 md:pr-8 opacity-[0.03]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 300 300" className="w-64 h-64 md:w-96 md:h-96">
          <circle cx="300" cy="150" r="280" stroke="#2A2722" strokeWidth="1" fill="none" />
          <circle cx="300" cy="150" r="220" stroke="#2A2722" strokeWidth="0.5" fill="none" />
          <circle cx="300" cy="150" r="160" stroke="#2A2722" strokeWidth="0.5" fill="none" />
          <circle cx="300" cy="150" r="100" stroke="#2A2722" strokeWidth="0.5" fill="none" />
          <circle cx="300" cy="150" r="50" stroke="#2A2722" strokeWidth="1" fill="none" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="max-w-xl">
          <OnceMotion.p
            seenId="home-final-cta-eyebrow"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true, margin: "-120px" }}
            className="font-body text-xs text-charcoal-muted tracking-[0.18em] uppercase mb-8"
          >
            Start here
          </OnceMotion.p>

          <OnceMotion.h2
            seenId="home-final-cta-heading"
            initial={{ opacity: 0, filter: "blur(6px)", y: 8 }}
            whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 1.0, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-120px" }}
            className="font-heading text-3xl md:text-4xl lg:text-5xl text-charcoal leading-tight mb-6"
          >
            You do not have to know exactly what is wrong to start a conversation.
          </OnceMotion.h2>

          <OnceMotion.p
            seenId="home-final-cta-body"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
            viewport={{ once: true, margin: "-120px" }}
            className="font-body text-base text-charcoal-mid mb-10 leading-relaxed"
          >
            If something here feels familiar, the next step is simple.
          </OnceMotion.p>

          <OnceMotion.div
            seenId="home-final-cta-button"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
            viewport={{ once: true, margin: "-120px" }}
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
          </OnceMotion.div>
        </div>
      </div>
    </section>
  );
}
