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
  const num = String(index).padStart(2, "0");
  const sectionBg = index % 2 === 0 ? "bg-cream-deep/50" : "bg-cream";

  return (
    <section
      className={`py-16 md:py-24 lg:py-32 px-5 md:px-8 lg:px-12 ${sectionBg} border-t border-border/40`}
      aria-label={title}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 lg:gap-16 md:items-center">

          {/* Cover image */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className={`md:col-span-4 ${reversed ? "md:order-last" : "md:order-first"}`}
          >
            <div className="relative aspect-[2/3] w-full max-w-[220px] mx-auto md:mx-0 md:max-w-[260px] shadow-[6px_12px_32px_rgba(42,39,34,0.13)] hover:shadow-[8px_16px_40px_rgba(42,39,34,0.18)] transition-shadow duration-500">
              <Image
                src={image}
                alt={`${title} — book cover`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 220px, 260px"
              />
            </div>
          </motion.div>

          {/* Content */}
          <div
            className={`md:col-span-8 ${reversed ? "md:order-first" : "md:order-last"}`}
          >
            {/* Book number */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              viewport={{ once: true, margin: "-100px" }}
              className="font-body text-[11px] text-charcoal-muted/40 tracking-[0.3em] mb-4"
              aria-hidden="true"
            >
              {num}
            </motion.p>

            {/* Theme label */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="font-body text-[11px] text-charcoal-muted tracking-[0.15em] uppercase mb-4"
            >
              {theme}
            </motion.p>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-100px" }}
              className="font-heading text-3xl md:text-4xl lg:text-[2.75rem] text-charcoal leading-tight mb-5"
            >
              {title}
            </motion.h2>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              style={{ originX: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="h-px w-8 bg-border mb-6"
              aria-hidden="true"
            />

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="font-body text-base text-charcoal-mid leading-relaxed mb-7"
            >
              {description}
            </motion.p>

            {/* Connection line — italic pull quote with left rule */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.48 }}
              viewport={{ once: true, margin: "-100px" }}
              className="font-heading italic text-base text-charcoal leading-snug mb-9 pl-5 border-l-2 border-green/30"
            >
              {connectionLine}
            </motion.p>

            {/* CTA */}
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
