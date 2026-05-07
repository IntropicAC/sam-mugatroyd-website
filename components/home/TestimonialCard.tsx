'use client';

import { useState } from "react";
import { motion } from "framer-motion";

interface TestimonialCardProps {
  name: string;
  excerpt: string;
  fullText: string;
}

export default function TestimonialCard({
  name,
  excerpt,
  fullText,
}: TestimonialCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = fullText.length > excerpt.length;

  return (
    <div className="border border-border p-7 md:p-9 bg-cream-deep flex flex-col">
      {/* Quote mark */}
      <div
        className="font-heading text-5xl text-green/25 leading-none mb-4 select-none"
        aria-hidden="true"
      >
        &ldquo;
      </div>

      <div className="flex-1">
        {/*
          Single motion.div with layout — Framer Motion uses FLIP to animate
          the height change when the text content switches, so the container
          grows/shrinks smoothly rather than snapping.
        */}
        <motion.div
          layout
          transition={{ layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
          className="overflow-hidden"
        >
          <p className="font-body text-sm text-charcoal-mid leading-relaxed">
            {expanded ? fullText : excerpt}
          </p>
        </motion.div>

        {isLong && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-4 font-body text-xs text-green hover:text-green-hover transition-colors duration-300 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
          >
            {expanded ? "Read less" : "Read more"}
          </button>
        )}
      </div>

      <div className="mt-6 pt-5 border-t border-border/60">
        <p className="font-heading text-sm text-charcoal">{name}</p>
      </div>
    </div>
  );
}
