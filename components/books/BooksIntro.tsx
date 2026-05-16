'use client';

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import FadeInView from "@/components/ui/FadeInView";

const mobileCards = [
  {
    key: "heading",
    content: (
      <>
        <p className="font-body text-xs text-charcoal-muted tracking-[0.18em] uppercase mb-5">
          The Work
        </p>
        <h2 className="font-heading text-2xl text-charcoal leading-tight">
          Books that shift the way you see
        </h2>
      </>
    ),
  },
  {
    key: "territory",
    content: (
      <p className="font-body text-base text-charcoal-mid leading-relaxed">
        Each book explores a different part of the same territory: the cost of
        performance, the ache of not belonging, and the quiet freedom that comes
        from seeing yourself clearly.
      </p>
    ),
  },
  {
    key: "not-self-help",
    content: (
      <p className="font-body text-base text-charcoal-mid leading-relaxed">
        They are not traditional self-help books. There are no steps, systems,
        or slogans. They are written to provoke thought, pull you from what you
        think you know, and offer a way of looking at things that once seen,
        stays seen.
      </p>
    ),
  },
];

function MobileWorkCard({
  children,
  isLast = false,
}: {
  children: React.ReactNode;
  isLast?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.72,
    margin: "0px 0px -12% 0px",
  });
  const textDelay = 0;
  const borderDelay = 0.62;
  const topDuration = 0.95;
  const sideDelay = borderDelay + 0.72;
  const sideDuration = 1.2;
  const bottomDelay = sideDelay + 0.9;
  const connectorDelay = bottomDelay + 0.72;
  const drawEase = [0.16, 1, 0.3, 1] as const;

  return (
    <div ref={ref} className="relative">
      <div className="relative bg-cream/75 px-5 py-6">
        <motion.div
          className="absolute left-1/2 top-0 h-[2px] w-1/2 origin-left bg-green"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isInView ? 1 : 0 }}
          transition={{ duration: topDuration, delay: borderDelay, ease: drawEase }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute right-1/2 top-0 h-[2px] w-1/2 origin-right bg-green"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isInView ? 1 : 0 }}
          transition={{ duration: topDuration, delay: borderDelay, ease: drawEase }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute left-0 top-0 h-full w-[2px] origin-top bg-green"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: isInView ? 1 : 0 }}
          transition={{ duration: sideDuration, delay: sideDelay, ease: drawEase }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute right-0 top-0 h-full w-[2px] origin-top bg-green"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: isInView ? 1 : 0 }}
          transition={{ duration: sideDuration, delay: sideDelay, ease: drawEase }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] w-1/2 origin-left bg-green"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isInView ? 1 : 0 }}
          transition={{ duration: 0.95, delay: bottomDelay, ease: drawEase }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute bottom-0 right-0 h-[2px] w-1/2 origin-right bg-green"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isInView ? 1 : 0 }}
          transition={{ duration: 0.95, delay: bottomDelay, ease: drawEase }}
          aria-hidden="true"
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: isInView ? 1 : 0,
            y: isInView ? 0 : 10,
          }}
          transition={{
            duration: 0.58,
            delay: textDelay,
            ease: "easeOut",
          }}
          className="relative"
        >
          {children}
        </motion.div>
      </div>

      {!isLast && (
        <motion.div
          className="mx-auto h-16 w-[2px] origin-top bg-green/55"
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{
            scaleY: isInView ? 1 : 0,
            opacity: isInView ? 1 : 0,
          }}
          transition={{
            duration: 1.05,
            delay: connectorDelay,
            ease: drawEase,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default function BooksIntro() {
  return (
    <section
      className="py-16 md:py-24 px-5 md:px-8 lg:px-12"
      aria-label="About the books"
    >
      <div className="max-w-7xl mx-auto">
        <div className="md:hidden">
          <div className="space-y-0">
            {mobileCards.map((card, index) => (
              <MobileWorkCard
                key={card.key}
                isLast={index === mobileCards.length - 1}
              >
                {card.content}
              </MobileWorkCard>
            ))}
          </div>
        </div>

        <div className="hidden max-w-2xl md:block">
          <FadeInView>
            <p className="font-body text-xs text-charcoal-muted tracking-[0.18em] uppercase mb-6">
              The Work
            </p>
          </FadeInView>

          <FadeInView delay={0.1}>
            <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl text-charcoal mb-7 leading-tight">
              Books that shift the way you see
            </h2>
          </FadeInView>

          <FadeInView delay={0.18}>
            <p className="font-body text-base text-charcoal-mid leading-relaxed mb-5">
              Each book explores a different part of the same territory: the
              cost of performance, the ache of not belonging, and the quiet
              freedom that comes from seeing yourself clearly.
            </p>
          </FadeInView>

          <FadeInView delay={0.26}>
            <p className="font-body text-base text-charcoal-mid leading-relaxed">
              They are not traditional self-help books. There are no steps,
              systems, or slogans. They are written to provoke thought, pull you
              from what you think you know, and offer a way of looking at things
              that once seen, stays seen.
            </p>
          </FadeInView>
        </div>
      </div>
    </section>
  );
}
