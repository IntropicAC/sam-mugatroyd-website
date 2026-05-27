'use client';

import Link from "next/link";
import Image from "next/image";
import { OnceMotion } from "@/components/ui/OnceMotion";

const CALENDLY_URL = "https://calendly.com/samuel-a-murg/free-discovery-call";

function AmazonBestsellerBadge() {
  return (
    <OnceMotion.div
      seenId="home-amazon-bestseller-badge"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 1.5, ease: "easeOut" }}
      className="mt-5 flex items-center gap-3"
    >
      <div className="h-px w-6 bg-border" aria-hidden="true" />
      <span className="font-body text-[10px] tracking-[0.22em] uppercase text-charcoal-muted">
        Bestselling Author on
      </span>
      <svg
        viewBox="0 0 72 28"
        className="h-[20px] w-auto"
        fill="none"
        aria-label="Amazon"
        xmlns="http://www.w3.org/2000/svg"
      >
        <text
          x="1"
          y="16"
          fontSize="16"
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight="600"
          fill="#2A2722"
          letterSpacing="0.5"
        >
          amazon
        </text>
        {/* Arc from under first "a" to end of "z" */}
        <OnceMotion.path
          seenId="home-amazon-bestseller-smile"
          d="M3 21 Q22 28 41 21"
          stroke="#FF9900"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, delay: 1.9, ease: [0.16, 1, 0.3, 1] }}
        />
        <OnceMotion.path
          seenId="home-amazon-bestseller-arrow"
          d="M36 18.5 L41 21 L37 24.5"
          stroke="#FF9900"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 3.65, ease: "easeOut" }}
        />
      </svg>
    </OnceMotion.div>
  );
}

export default function Hero() {
  return (
    <section
      className="relative min-h-dvh flex flex-col justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Background logo motif */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.06]"
        aria-hidden="true"
      >
        <div className="w-[80vw] max-w-xl relative aspect-square">
          <Image
            src="/images/perception-47-logo.png"
            alt=""
            fill
            className="object-contain"
            sizes="(max-width: 768px) 80vw, 40vw"
          />
        </div>
      </div>

      {/* Gradient fade at bottom */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cream to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-5 md:px-8 lg:px-12 pt-20 pb-10">
        {/* Eyebrow */}
        <OnceMotion.p
          seenId="home-hero-eyebrow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="font-body text-xs text-charcoal-muted tracking-[0.18em] uppercase mb-4 md:mb-5"
        >
          Life Coaching
        </OnceMotion.p>

        {/* Headline */}
        <OnceMotion.h1
          seenId="home-hero-heading"
          initial={{ opacity: 0, filter: "blur(8px)", y: 8 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="font-heading font-normal text-[1.7rem] sm:text-4xl md:text-5xl lg:text-6xl text-charcoal leading-[1.18] max-w-3xl mb-5"
        >
          Most people are not lost.
          <br />
          They are just looking at
          <br />
          <em className="not-italic text-green">everything through a lens</em>
          <br />
          they did not choose.
        </OnceMotion.h1>

        {/* Divider */}
        <OnceMotion.div
          seenId="home-hero-divider"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
          style={{ originX: 0 }}
          className="h-px w-10 bg-border mb-4 md:mb-5"
          aria-hidden="true"
        />

        {/* Positioning line */}
        <OnceMotion.p
          seenId="home-hero-positioning"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.05, ease: "easeOut" }}
          className="font-body text-sm md:text-lg text-charcoal-mid max-w-md leading-relaxed mb-6"
        >
          I change the way people see the world and in turn change the world they see.
        </OnceMotion.p>

        {/* CTA */}
        <OnceMotion.div
          seenId="home-hero-cta"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.25, ease: "easeOut" }}
        >
          <Link
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green text-cream px-5 py-3.5 md:px-8 md:py-4 font-body text-sm font-medium tracking-wide hover:bg-green-hover transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green group"
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

        <AmazonBestsellerBadge />
      </div>
    </section>
  );
}
