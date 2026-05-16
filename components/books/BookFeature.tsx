'use client';

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface BookFeatureProps {
  index: number;
  title: string;
  theme: string;
  description: string;
  connectionLine: string;
  image: string;
  amazonUrl: string;
  reversed?: boolean;
}

function getBookMood(index: number) {
  if (index === 1) {
    return {
      bg: "bg-cream",
      rule: "bg-charcoal",
      wash: "rgba(42,39,34,0.055)",
    };
  }

  if (index === 2) {
    return {
      bg: "bg-cream-deep/65",
      rule: "bg-green",
      wash: "rgba(61,89,72,0.075)",
    };
  }

  return {
    bg: "bg-cream",
    rule: "bg-charcoal-mid",
    wash: "rgba(81,77,73,0.06)",
  };
}

export default function BookFeature({
  index,
  title,
  theme,
  description,
  connectionLine,
  image,
  amazonUrl,
  reversed = false,
}: BookFeatureProps) {
  const mood = getBookMood(index);

  return (
    <section
      className={`relative overflow-hidden py-16 md:py-24 lg:py-32 px-5 md:px-8 lg:px-12 ${mood.bg} border-t border-border/40`}
      aria-label={title}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.28]"
        style={{
          background:
            "linear-gradient(90deg, rgba(42,39,34,0.04) 0 1px, transparent 1px 100%)",
          backgroundSize: "72px 72px",
        }}
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute right-0 top-1/2 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full blur-3xl"
        style={{ backgroundColor: mood.wash }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-9 md:grid-cols-12 md:gap-12 lg:gap-16 md:items-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className={`md:col-span-5 ${reversed ? "md:order-last" : "md:order-first"}`}
          >
            <div className="relative mx-auto max-w-[250px] md:mx-0 md:max-w-[300px]">
              <div
                className="absolute left-5 right-3 bottom-[-16px] h-4 border-y border-charcoal/10 bg-charcoal/[0.045]"
                aria-hidden="true"
              />
              <div className="relative aspect-[2/3] overflow-hidden border border-charcoal/10 bg-cream shadow-[12px_18px_45px_rgba(42,39,34,0.16)] before:absolute before:inset-y-0 before:left-0 before:z-10 before:w-[11px] before:bg-[linear-gradient(to_right,rgba(26,24,20,0.38),rgba(255,255,255,0.14),transparent)] after:absolute after:inset-y-4 after:right-0 after:z-10 after:w-[6px] after:bg-cream/35">
                <Image
                  src={image}
                  alt={`${title} book cover`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 250px, 300px"
                />
              </div>
            </div>
          </motion.div>

          <div
            className={`md:col-span-7 ${reversed ? "md:order-first" : "md:order-last"}`}
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="font-body text-[11px] text-charcoal-muted tracking-[0.15em] uppercase mb-4"
            >
              {theme}
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-100px" }}
              className="font-heading text-3xl md:text-4xl lg:text-[2.75rem] text-charcoal leading-tight mb-5"
            >
              {title}
            </motion.h2>

            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              style={{ originX: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`h-px w-12 ${mood.rule} opacity-35 mb-6`}
              aria-hidden="true"
            />

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="border border-border bg-cream/70 px-5 py-6 md:px-7 md:py-7 mb-5"
            >
              <p className="font-body text-base text-charcoal-mid leading-relaxed">
                {description}
              </p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.48 }}
              viewport={{ once: true, margin: "-100px" }}
              className="font-heading italic text-base text-charcoal leading-snug mb-9 pl-5 border-l-2 border-green/30"
            >
              {connectionLine}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.58 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <Link
                href={amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-transparent text-green border border-green px-7 py-3.5 font-body text-sm font-medium tracking-wide hover:bg-green hover:text-cream transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green group"
              >
                Buy on Amazon
                <span
                  className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  {"\u2192"}
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
