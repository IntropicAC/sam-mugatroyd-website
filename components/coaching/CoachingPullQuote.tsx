'use client';

import { motion } from "framer-motion";

export default function CoachingPullQuote() {
  return (
    <section
      className="relative py-24 md:py-40 px-5 md:px-8 lg:px-12 overflow-hidden"
      style={{ backgroundColor: "#1A2820" }}
      aria-label="What this work does"
    >
      {/* Concentric lens rings */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 600 600" className="w-[340px] h-[340px] md:w-[520px] md:h-[520px]" fill="none">
          <circle cx="300" cy="300" r="290" stroke="#F5F0EA" strokeWidth="0.5" />
          <circle cx="300" cy="300" r="220" stroke="#F5F0EA" strokeWidth="0.5" />
          <circle cx="300" cy="300" r="150" stroke="#F5F0EA" strokeWidth="0.5" />
          <circle cx="300" cy="300" r="80" stroke="#F5F0EA" strokeWidth="1" />
          <circle cx="300" cy="300" r="20" stroke="#F5F0EA" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="relative max-w-4xl mx-auto text-center">

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ originX: 0.5, backgroundColor: "rgba(61,89,72,0.6)" }}
          className="h-px w-12 mx-auto mb-12 md:mb-16"
          aria-hidden="true"
        />

        <motion.p
          initial={{ opacity: 0, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] text-cream leading-[1.4]"
        >
          What I do changes the way you see the world
        </motion.p>

        <motion.p
          initial={{ opacity: 0, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="font-heading italic text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] text-green-hover leading-[1.4]"
        >
          and in turn changes the world you see.
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ originX: 0.5, backgroundColor: "rgba(61,89,72,0.6)" }}
          className="h-px w-12 mx-auto mt-12 md:mt-16 mb-8"
          aria-hidden="true"
        />

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="font-body text-xs text-cream/30 tracking-[0.15em] uppercase"
        >
          Once that shift happens, you cannot unsee it.
        </motion.p>
      </div>
    </section>
  );
}
