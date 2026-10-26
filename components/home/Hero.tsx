'use client';

import { useSyncExternalStore } from "react";
import Link from "next/link";
import LensCycle, { type LensName } from "@/components/lens-check/LensCycle";
import { OnceMotion } from "@/components/ui/OnceMotion";
import { hasSavedProgress, lensCheckHref } from "@/lib/lens-check/progress";
import styles from "./Hero.module.css";

const noSubscribe = () => () => {};

// The homepage opens on the Mindset Test: a mindset's character in front of
// Sam's logo, one question, Sam's line, the way in, and coaching for those who
// already know they want it.
export default function Hero({
  statements,
  version,
  lenses,
}: {
  statements: number;
  version: string;
  lenses: LensName[];
}) {
  // Someone part-way through is offered the rest rather than a fresh start.
  const resuming = useSyncExternalStore(noSubscribe, () => hasSavedProgress(version), () => false);

  return (
    <section className={styles.hero} aria-labelledby="home-hero-heading">
      <div className={styles.inner}>
        <OnceMotion.div
          seenId="home-hero-cast"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.15, ease: "easeOut" }}
          className={styles.cast}
        >
          <LensCycle lenses={lenses} />
        </OnceMotion.div>

        <div className={styles.copy}>
          <OnceMotion.h1
            id="home-hero-heading"
            seenId="home-hero-heading"
            initial={{ opacity: 0, filter: "blur(10px)", y: 8 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 1.2, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`${styles.title} max-w-[14ch] font-heading text-[clamp(2.1rem,min(9vw,6.6dvh),3rem)] font-normal leading-[1.06] text-charcoal [text-wrap:balance] md:text-[clamp(2.6rem,min(8vw,7.4dvh),4.2rem)] lg:max-w-[19ch] lg:text-[clamp(3.2rem,min(5.4vw,9dvh),4.6rem)] lg:leading-[1.04]`}
          >
            Which <span className="text-green">mindset</span> are you living in?
          </OnceMotion.h1>

          <OnceMotion.p
            seenId="home-hero-lede"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
            className={`${styles.lede} max-w-[30rem] font-body text-base font-light leading-relaxed text-charcoal-mid [text-wrap:balance] md:text-lg lg:max-w-[32rem] lg:text-xl lg:[text-wrap:pretty]`}
          >
            Most people are not lost. They are just looking at everything through a lens they did not choose.
          </OnceMotion.p>

          <OnceMotion.div
            seenId="home-hero-cta"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1, ease: "easeOut" }}
            className={`${styles.actions} flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row lg:items-start`}
          >
            <Link
              href={lensCheckHref({ from: "home", begin: true })}
              className="group inline-flex min-h-[54px] w-full max-w-[22rem] items-center justify-center gap-3 whitespace-nowrap border border-green bg-green px-8 py-4 font-body text-[15px] font-medium tracking-wide text-cream shadow-[0_14px_30px_rgba(61,89,72,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:border-green-hover hover:bg-green-hover hover:shadow-[0_18px_36px_rgba(61,89,72,0.3)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green active:translate-y-0 sm:w-auto"
            >
              {resuming ? "Continue the Mindset Test" : "Take the Mindset Test"}
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
                &rarr;
              </span>
            </Link>
            <Link
              href="/coaching"
              className="group inline-flex min-h-[54px] w-full max-w-[22rem] items-center justify-center gap-3 whitespace-nowrap border border-green/50 bg-cream/70 px-8 py-4 font-body text-[15px] font-medium tracking-wide text-green transition-all duration-300 hover:-translate-y-0.5 hover:border-green hover:bg-green/[0.06] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green active:translate-y-0 sm:w-auto"
            >
              Explore coaching
            </Link>
          </OnceMotion.div>

          <OnceMotion.p
            seenId="home-hero-meta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.3, ease: "easeOut" }}
            className={`${styles.meta} font-body text-[12.5px] tracking-[0.02em] text-charcoal-muted`}
          >
            {`Free · ${statements} short statements · 18+ · `}
            <Link href="/privacy" className="underline decoration-border underline-offset-2 transition-colors hover:text-charcoal">
              Privacy
            </Link>
          </OnceMotion.p>
        </div>
      </div>
    </section>
  );
}
