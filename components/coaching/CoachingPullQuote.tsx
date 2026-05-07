'use client';

import { motion } from "framer-motion";

export default function CoachingPullQuote() {
  return (
    <section
      className="py-16 md:py-24 px-5 md:px-8 lg:px-12 bg-cream-deep border-t border-b border-border"
      aria-label="What this work does"
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl">

          {/* Opening mark */}
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="block font-heading text-5xl md:text-6xl text-green/25 leading-none mb-3 select-none"
            aria-hidden="true"
          >
            &ldquo;
          </motion.span>

          <motion.p
            initial={{ filter: "blur(8px)", opacity: 0 }}
            whileInView={{ filter: "blur(0px)", opacity: 1 }}
            transition={{ duration: 1.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className="font-heading text-2xl md:text-3xl text-charcoal leading-[1.45]"
          >
            What I do changes the way you see the world and in turn changes the
            world you see.
          </motion.p>

          <motion.p
            initial={{ filter: "blur(8px)", opacity: 0 }}
            whileInView={{ filter: "blur(0px)", opacity: 1 }}
            transition={{ duration: 1.3, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className="font-heading italic text-2xl md:text-3xl text-green leading-[1.45] mt-2"
          >
            Once that shift happens, you cannot unsee it.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="font-body text-sm text-charcoal-muted mt-7 leading-relaxed"
          >
            That is not a promise. It is just how it works.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
