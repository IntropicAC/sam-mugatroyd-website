'use client';

import Image from "next/image";
import Link from "next/link";
import { OnceMotion } from "@/components/ui/OnceMotion";

const CALENDLY_URL = "https://calendly.com/samuel-a-murg/free-discovery-call";

export default function CoachingHero() {
  return (
    <section
      className="relative min-h-[100svh] lg:h-[100svh] flex flex-col justify-center overflow-hidden bg-charcoal"
      aria-label="Hero"
    >
      <div
        className="pointer-events-none absolute right-0 bottom-0 select-none overflow-hidden"
        aria-hidden="true"
      >
        <OnceMotion.span
          seenId="coaching-hero-background-number"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.2, delay: 0.3, ease: "easeOut" }}
          className="block font-heading leading-none text-cream/[0.04] translate-x-[8%] translate-y-[18%]"
          style={{ fontSize: "clamp(160px, 28vw, 420px)" }}
        >
          47
        </OnceMotion.span>
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent, transparent 71px, #F5F0EA 71px, #F5F0EA 72px)",
        }}
        aria-hidden="true"
      />

      <OnceMotion.div
        seenId="coaching-hero-top-line"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        style={{ originX: 0 }}
        className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-cream/15"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-5 md:px-8 lg:px-24 xl:px-32 pt-[clamp(5.25rem,12svh,7rem)] pb-[clamp(2rem,6svh,4rem)]">
        <div className="grid lg:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.62fr)] gap-9 lg:gap-12 xl:gap-16 items-center">
          <div>
            <OnceMotion.p
              seenId="coaching-hero-eyebrow"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
              className="font-body text-[10px] text-cream/35 tracking-[0.22em] uppercase mb-[clamp(1.25rem,4svh,2rem)]"
            >
              One-to-One Coaching · Perception 47 · Sam Murgatroyd
            </OnceMotion.p>

            <OnceMotion.h1
              seenId="coaching-hero-heading"
              initial={{ opacity: 0, filter: "blur(14px)", y: 10 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="font-heading font-normal text-[clamp(2.15rem,9.5vw,3.7rem)] lg:text-[clamp(3.5rem,7.4vh,5.05rem)] text-cream leading-[1.06] max-w-4xl mb-[clamp(1.25rem,3.5svh,2rem)]"
            >
              You do not need
              <br />a new mindset.
              <br />
              <em className="not-italic text-green-hover">
                You need a new lens.
              </em>
            </OnceMotion.h1>

            <OnceMotion.div
              seenId="coaching-hero-divider"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 1.15, ease: "easeOut" }}
              style={{ originX: 0 }}
              className="h-px w-12 bg-green mb-[clamp(1.1rem,3svh,1.75rem)]"
              aria-hidden="true"
            />

            <OnceMotion.p
              seenId="coaching-hero-copy"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.3, ease: "easeOut" }}
              className="font-body text-sm md:text-base text-cream/55 max-w-lg leading-relaxed mb-2"
            >
              Most coaches offer motivation. Techniques. Frameworks. Things you can apply on a good day and forget on a bad one.
            </OnceMotion.p>

            <OnceMotion.p
              seenId="coaching-hero-different"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.45, ease: "easeOut" }}
              className="font-heading italic text-base md:text-lg text-cream/80 mb-[clamp(1.5rem,4svh,2.5rem)]"
            >
              This is different.
            </OnceMotion.p>

            <OnceMotion.div
              seenId="coaching-hero-cta"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.65, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-5"
            >
              <Link
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-green text-cream px-7 py-3.5 md:px-8 md:py-4 font-body text-sm font-medium tracking-wide hover:bg-green-hover transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green group"
              >
                Book your free 20-minute call
                <span
                  className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
              <span className="font-body text-xs text-cream/30 tracking-wide">
                No pitch. Just a conversation.
              </span>
            </OnceMotion.div>
          </div>

          <OnceMotion.div
            seenId="coaching-hero-graphic"
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block"
            aria-hidden="true"
          >
            <div className="relative ml-auto w-full max-w-[min(430px,46vh)]">
              <div
                className="absolute -inset-5 border border-cream/10"
                aria-hidden="true"
              />
              <div
                className="absolute -right-14 -top-12 w-64 h-64 rounded-full border border-green/30"
                aria-hidden="true"
              />
              <div
                className="absolute -left-10 bottom-10 h-44 w-44 rounded-full bg-green/10 blur-2xl"
                aria-hidden="true"
              />
              <div className="relative aspect-[4/5] overflow-hidden border border-cream/10 bg-cream/[0.045]">
                <div
                  className="absolute inset-0 opacity-[0.12]"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #F5F0EA 0 1px, transparent 1px 22px)",
                  }}
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-x-8 top-8 bottom-8 border border-cream/10"
                  aria-hidden="true"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    viewBox="0 0 420 420"
                    className="absolute w-[118%] text-cream/25"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle cx="210" cy="210" r="190" stroke="currentColor" strokeWidth="0.6" opacity="0.25" />
                    <circle cx="210" cy="210" r="148" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
                    <circle cx="210" cy="210" r="106" stroke="currentColor" strokeWidth="0.7" opacity="0.36" />
                    <circle cx="210" cy="210" r="58" stroke="#4E6E5B" strokeWidth="1.4" opacity="0.85" />
                    <path d="M210 20V400M20 210H400" stroke="currentColor" strokeWidth="0.45" opacity="0.18" />
                  </svg>
                  <div className="relative h-[min(13rem,22vh)] w-[min(13rem,22vh)] rounded-full border border-green/35 bg-charcoal/70 p-9 shadow-[0_0_80px_rgba(61,89,72,0.32)]">
                    <Image
                      src="/images/perception-47-logo.png"
                      alt=""
                      fill
                      className="object-contain p-8 opacity-90"
                      sizes="208px"
                    />
                  </div>
                </div>
                <div
                  className="absolute left-8 right-8 bottom-8 h-px bg-cream/15"
                  aria-hidden="true"
                />
              </div>
            </div>
          </OnceMotion.div>
        </div>
      </div>
    </section>
  );
}
