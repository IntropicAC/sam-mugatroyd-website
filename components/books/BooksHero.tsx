'use client';

import Image from "next/image";
import { OnceMotion } from "@/components/ui/OnceMotion";
import FadeInView from "@/components/ui/FadeInView";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function BooksHero() {
  return (
    <section
      className="relative min-h-[100svh] lg:h-[100svh] flex flex-col justify-center overflow-hidden bg-cream px-5 md:px-8 lg:px-12 pt-20 pb-6 md:pt-24 md:pb-10"
      aria-label="Books — Sam Murgatroyd"
    >
      {/* Faint horizontal rule grid — editorial page texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent, transparent 47px, #2A2722 47px, #2A2722 48px)",
        }}
        aria-hidden="true"
      />

      {/* ── Logo watermark — large, soft, bottom-right ─────────────
          Sits well behind the type. Reads as a publisher mark. */}
      <OnceMotion.div
        seenId="books-hero-logo-watermark"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.4, delay: 0.2, ease: "easeOut" }}
        className="pointer-events-none absolute -right-[22%] -bottom-[14%] md:-right-[14%] md:-bottom-[10%] lg:-right-[18%] xl:-right-[22%] w-[80vw] max-w-[640px] aspect-square select-none"
        aria-hidden="true"
      >
        {/* Surrounding lens rings — each band a slightly different
            tonal shade, deepening toward the centre. */}
        <svg
          viewBox="0 0 600 600"
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
        >
          {/* Outermost band — palest */}
          <circle
            cx="300"
            cy="300"
            r="296"
            fill="#2A2722"
            fillOpacity="0.012"
            stroke="#2A2722"
            strokeOpacity="0.15"
            strokeWidth="0.5"
          />
          {/* Second band — a touch warmer */}
          <circle
            cx="300"
            cy="300"
            r="240"
            fill="#2A2722"
            fillOpacity="0.022"
            stroke="#2A2722"
            strokeOpacity="0.15"
            strokeWidth="0.5"
          />
          {/* Third band — deeper still */}
          <circle
            cx="300"
            cy="300"
            r="180"
            fill="#2A2722"
            fillOpacity="0.035"
            stroke="#2A2722"
            strokeOpacity="0.18"
            strokeWidth="0.5"
          />
          {/* Innermost circle — soft green tint, holds the logo */}
          <circle
            cx="300"
            cy="300"
            r="120"
            fill="#3D5948"
            fillOpacity="0.05"
            stroke="#3D5948"
            strokeOpacity="0.55"
            strokeWidth="0.6"
          />
        </svg>

        <Image
          src="/images/perception-47-logo.png"
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 80vw, 640px"
          className="object-contain opacity-[0.07] p-[32%]"
        />
      </OnceMotion.div>

      {/* ── CONTENT ─────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto w-full max-w-5xl">

        {/* ── Masthead — logo lockup left, indicator right ──────── */}
        <FadeInView>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-charcoal/15 pb-3 mb-6 md:mb-10">
            {/* Logo lockup */}
            <OnceMotion.div
              seenId="books-hero-logo-mark"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, delay: 0.1, ease: EASE }}
              className="flex items-center gap-3"
            >
              {/* Logo ringed like a press seal */}
              <div className="relative h-8 w-8 md:h-10 md:w-10 flex items-center justify-center">
                <span
                  className="absolute inset-0 rounded-full border border-green/45"
                  aria-hidden="true"
                />
                <span
                  className="absolute inset-[3px] rounded-full border border-charcoal/10"
                  aria-hidden="true"
                />
                <div className="relative h-4 w-4 md:h-5 md:w-5">
                  <Image
                    src="/images/perception-47-logo.png"
                    alt="Perception 47"
                    fill
                    sizes="20px"
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Brand text */}
              <div className="leading-tight">
                <p className="font-body text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-charcoal-muted">
                  Perception 47
                </p>
                <p className="font-heading italic text-xs md:text-sm text-charcoal/85 -mt-0.5">
                  The Library
                </p>
              </div>
            </OnceMotion.div>

            {/* Right-hand indicator */}
            <OnceMotion.p
              seenId="books-hero-masthead-right"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: EASE }}
              className="font-body text-[9px] md:text-[10px] tracking-[0.22em] uppercase text-charcoal-muted"
            >
              Three Books · Sam Murgatroyd
            </OnceMotion.p>
          </div>
        </FadeInView>

        {/* Hero title */}
        <OnceMotion.h1
          seenId="books-hero-title"
          initial={{ opacity: 0, filter: "blur(14px)", y: 10 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 1.4, delay: 0.4, ease: EASE }}
          className="font-heading text-charcoal leading-[1.05] tracking-[-0.015em] text-[clamp(1.55rem,5.8vw,3.5rem)] max-w-3xl"
        >
          The books are where{" "}
          <em className="not-italic text-green">this work</em>{" "}
          was first written down.
        </OnceMotion.h1>

        {/* Divider */}
        <OnceMotion.div
          seenId="books-hero-divider"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
          style={{ originX: 0 }}
          className="mt-4 mb-4 h-px w-12 bg-green"
          aria-hidden="true"
        />

        {/* Lede */}
        <div className="grid gap-4 md:grid-cols-12 md:gap-8">
          <OnceMotion.p
            seenId="books-hero-lede"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.4, ease: "easeOut" }}
            className="font-body text-sm md:text-base text-charcoal-mid leading-[1.6] md:col-span-7 max-w-prose"
          >
            Before there was a coaching practice, there were three quiet
            books. Each one is its own story. Together they trace the same
            underlying argument — about{" "}
            <span className="text-charcoal">identity</span>,{" "}
            <span className="text-charcoal">honesty</span>, and{" "}
            <span className="text-charcoal">what it means to belong to
            yourself first</span>.
          </OnceMotion.p>

          <OnceMotion.div
            seenId="books-hero-meta"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.55, ease: "easeOut" }}
            className="md:col-span-5 md:pl-6 md:border-l md:border-charcoal/10"
          >
            <p className="font-heading italic text-sm md:text-base text-charcoal leading-snug mb-1">
              Amazon Bestseller
            </p>
            <p className="font-body text-xs md:text-sm text-charcoal-mid leading-snug">
              Signed copies included in selected coaching packages.
            </p>
          </OnceMotion.div>
        </div>

        {/* Scroll hint */}
        <OnceMotion.div
          seenId="books-hero-scroll-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.95, ease: "easeOut" }}
          className="mt-6 md:mt-8 flex items-center gap-3"
        >
          <span className="block h-px w-8 bg-charcoal/25" aria-hidden="true" />
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-charcoal-muted">
            Begin with the first
          </p>
        </OnceMotion.div>
      </div>
    </section>
  );
}
