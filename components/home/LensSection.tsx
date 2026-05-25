'use client';

import { OnceMotion } from "@/components/ui/OnceMotion";

export default function LensSection() {
  return (
    <section
      className="relative py-24 md:py-36 overflow-hidden bg-charcoal"
      aria-label="The lens concept"
    >
      {/* Lens SVG motif — large, subtle, centred */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 400 400"
          className="w-[90vw] max-w-2xl opacity-[0.05]"
          fill="none"
        >
          <circle cx="200" cy="200" r="190" stroke="#F5F0EA" strokeWidth="1" />
          <circle cx="200" cy="200" r="150" stroke="#F5F0EA" strokeWidth="0.5" />
          <circle cx="200" cy="200" r="100" stroke="#F5F0EA" strokeWidth="0.5" />
          <circle cx="200" cy="200" r="60" stroke="#F5F0EA" strokeWidth="0.5" />
          <circle cx="200" cy="200" r="25" stroke="#F5F0EA" strokeWidth="1" />
          <line x1="200" y1="10" x2="200" y2="390" stroke="#F5F0EA" strokeWidth="0.5" />
          <line x1="10" y1="200" x2="390" y2="200" stroke="#F5F0EA" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
        <div className="max-w-xl mx-auto text-center">
          {/* Primary line — blur-to-focus on scroll */}
          <OnceMotion.p
            seenId="home-lens-primary"
            initial={{ filter: "blur(8px)", opacity: 0 }}
            whileInView={{ filter: "blur(0px)", opacity: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-140px" }}
            className="font-heading text-2xl md:text-3xl lg:text-4xl text-cream leading-snug mb-4"
          >
            The problem is not always the life you are living.
          </OnceMotion.p>

          {/* Secondary line — delayed blur-to-focus */}
          <OnceMotion.p
            seenId="home-lens-secondary"
            initial={{ filter: "blur(8px)", opacity: 0 }}
            whileInView={{ filter: "blur(0px)", opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-140px" }}
            className="font-heading italic text-2xl md:text-3xl lg:text-4xl text-green leading-snug mb-12 md:mb-16"
          >
            Sometimes it is the lens you are looking through.
          </OnceMotion.p>

          <OnceMotion.div
            seenId="home-lens-body"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7, ease: "easeOut" }}
            viewport={{ once: true, margin: "-120px" }}
            className="border-t border-cream/10 pt-10"
          >
            <p className="font-body text-sm md:text-base text-cream/60 leading-relaxed max-w-md mx-auto">
              Sam&apos;s work is not about giving people motivation that fades. It is about
              helping them understand the patterns they have been living inside for so long
              that they stopped noticing them.
            </p>
          </OnceMotion.div>
        </div>
      </div>
    </section>
  );
}
