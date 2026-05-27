'use client';

import { OnceMotion } from "@/components/ui/OnceMotion";

export default function BooksThread() {
  return (
    <section
      className="relative overflow-hidden py-16 md:py-28 px-5 md:px-8 lg:px-12"
      style={{ backgroundColor: "#1A2820" }}
      aria-label="The thread that runs through the books"
    >
      {/* Concentric lens rings — left side */}
      <div
        className="pointer-events-none absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 600 600"
          className="w-[320px] h-[320px] md:w-[480px] md:h-[480px]"
          fill="none"
        >
          <circle cx="300" cy="300" r="290" stroke="#F5F0EA" strokeWidth="0.5" />
          <circle cx="300" cy="300" r="220" stroke="#F5F0EA" strokeWidth="0.5" />
          <circle cx="300" cy="300" r="150" stroke="#F5F0EA" strokeWidth="0.5" />
          <circle cx="300" cy="300" r="80" stroke="#F5F0EA" strokeWidth="1" />
          <circle cx="300" cy="300" r="20" stroke="#F5F0EA" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Vertical scan lines for subtle paper-like texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent, transparent 71px, #F5F0EA 71px, #F5F0EA 72px)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-4xl">
        <OnceMotion.div
          seenId="books-thread-label"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-80px" }}
          className="flex items-center gap-3 mb-6 md:mb-8"
        >
          <span className="block h-px w-10 bg-green-hover/60" aria-hidden="true" />
          <span className="font-body text-[10px] uppercase tracking-[0.3em] text-cream/45">
            The Thread
          </span>
        </OnceMotion.div>

        <OnceMotion.p
          seenId="books-thread-intro"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-80px" }}
          className="font-body text-sm md:text-base text-cream/50 leading-relaxed max-w-md mb-6 md:mb-8"
        >
          Each book reads on its own. But underneath all three, the same
          same argument keeps surfacing.
        </OnceMotion.p>

        <OnceMotion.p
          seenId="books-thread-quote-1"
          initial={{ opacity: 0, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="font-heading text-cream leading-[1.25] text-[clamp(1.5rem,4.2vw,2.5rem)] max-w-3xl"
        >
          You were not built wrong.
        </OnceMotion.p>

        <OnceMotion.p
          seenId="books-thread-quote-2"
          initial={{ opacity: 0, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="font-heading italic text-green-hover leading-[1.25] text-[clamp(1.5rem,4.2vw,2.5rem)] max-w-3xl mt-1"
        >
          You were just measured against the wrong room.
        </OnceMotion.p>

        <OnceMotion.div
          seenId="books-thread-bottom"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ originX: 0 }}
          className="mt-8 md:mt-10 h-px w-16 bg-green-hover/50"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
