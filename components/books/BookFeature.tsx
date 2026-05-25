'use client';

import Image from "next/image";
import Link from "next/link";
import { OnceMotion } from "@/components/ui/OnceMotion";
import FadeInView from "@/components/ui/FadeInView";

interface BookFeatureProps {
  title: string;
  themes: string[];
  forWhom: string;
  paragraphs: string[];
  pullQuote: string;
  coverImage: string;
  coverAlt: string;
  amazonUrl: string;
  reversed?: boolean;
  seenIdPrefix: string;
}

export default function BookFeature({
  title,
  themes,
  forWhom,
  paragraphs,
  pullQuote,
  coverImage,
  coverAlt,
  amazonUrl,
  reversed = false,
  seenIdPrefix,
}: BookFeatureProps) {
  return (
    <section
      className="relative px-5 py-12 md:px-8 md:py-20 lg:px-12 lg:py-24"
      aria-label={`Book — ${title}`}
    >
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 md:gap-12 lg:gap-16 items-center md:grid-cols-12">
          {/* COVER COLUMN */}
          <OnceMotion.div
            seenId={`${seenIdPrefix}-cover`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-80px" }}
            className={`md:col-span-5 ${
              reversed ? "md:order-2 md:col-start-8" : "md:order-1"
            }`}
          >
            <div className="relative mx-auto w-[10rem] sm:w-[12rem] md:w-auto md:max-w-[18rem]">
              {/* Outer border frame */}
              <div
                className="absolute -inset-2.5 md:-inset-3 border border-charcoal/10"
                aria-hidden="true"
              />

              {/* Soft tonal glow behind cover */}
              <div
                className={`pointer-events-none absolute h-28 w-28 md:h-44 md:w-44 rounded-full bg-green/15 blur-3xl ${
                  reversed
                    ? "-right-6 -bottom-6"
                    : "-left-6 -bottom-6"
                }`}
                aria-hidden="true"
              />

              {/* Cover */}
              <div className="relative aspect-[2/3] overflow-hidden bg-surface shadow-[0_20px_45px_-25px_rgba(42,39,34,0.5)]">
                <Image
                  src={coverImage}
                  alt={coverAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 12rem, (max-width: 1280px) 30vw, 288px"
                />
              </div>

              {/* Caption ribbon under cover */}
              <div className="mt-3 flex items-center justify-between border-t border-charcoal/10 pt-2">
                <p className="font-body text-[9px] tracking-[0.22em] uppercase text-charcoal-muted">
                  Sam Murgatroyd
                </p>
                <p className="font-body text-[9px] tracking-[0.22em] uppercase text-green">
                  On Amazon
                </p>
              </div>
            </div>
          </OnceMotion.div>

          {/* TEXT COLUMN */}
          <div
            className={`md:col-span-7 ${
              reversed
                ? "md:order-1 md:col-start-1 md:row-start-1"
                : "md:order-2"
            }`}
          >
            {/* Theme strip */}
            <FadeInView>
              <div className="flex flex-wrap gap-x-2 gap-y-1 mb-3 md:mb-4">
                {themes.map((theme, i) => (
                  <span
                    key={theme}
                    className="font-body text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-charcoal-muted"
                  >
                    {theme}
                    {i < themes.length - 1 && (
                      <span
                        className="ml-2 text-charcoal/25"
                        aria-hidden="true"
                      >
                        /
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </FadeInView>

            {/* Title */}
            <OnceMotion.h2
              seenId={`${seenIdPrefix}-title`}
              initial={{ opacity: 0, filter: "blur(10px)", y: 12 }}
              whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 1.1, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-80px" }}
              className="font-heading text-charcoal leading-[1.04] tracking-[-0.015em] text-[clamp(1.75rem,5.5vw,3rem)] mb-3 md:mb-4"
            >
              {title}
            </OnceMotion.h2>

            {/* "For" line */}
            <FadeInView delay={0.1}>
              <p className="font-heading italic text-sm md:text-base text-green leading-snug mb-5 md:mb-6">
                {forWhom}
              </p>
            </FadeInView>

            {/* Body paragraphs */}
            <div className="space-y-3 md:space-y-4">
              {paragraphs.map((p, i) => (
                <FadeInView key={i} delay={0.18 + i * 0.08}>
                  <p className="font-body text-sm md:text-[0.95rem] text-charcoal-mid leading-[1.7]">
                    {p}
                  </p>
                </FadeInView>
              ))}
            </div>

            {/* Pull quote */}
            <OnceMotion.figure
              seenId={`${seenIdPrefix}-pullquote`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.95, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-80px" }}
              className="mt-6 md:mt-8 border-l-2 border-green pl-4 md:pl-6"
            >
              <blockquote className="font-heading italic text-base md:text-lg text-charcoal leading-[1.45]">
                &ldquo;{pullQuote}&rdquo;
              </blockquote>
              <figcaption className="mt-2 font-body text-[9px] md:text-[10px] tracking-[0.22em] uppercase text-charcoal-muted">
                From {title}
              </figcaption>
            </OnceMotion.figure>

            {/* CTA */}
            <FadeInView delay={0.25}>
              <div className="mt-6 md:mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
                <Link
                  href={amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 border border-charcoal text-charcoal px-5 py-2.5 md:px-6 md:py-3 font-body text-xs md:text-sm font-medium tracking-wide hover:bg-charcoal hover:text-cream transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green"
                  aria-label={`Find ${title} on Amazon`}
                >
                  Find on Amazon
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
                <span className="font-body text-[11px] md:text-xs text-charcoal-muted italic">
                  Paperback &middot; Kindle
                </span>
              </div>
            </FadeInView>
          </div>
        </div>
      </div>
    </section>
  );
}
