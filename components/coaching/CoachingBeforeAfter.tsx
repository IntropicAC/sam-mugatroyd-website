'use client';

import FadeInView from "@/components/ui/FadeInView";
import { OnceMotion } from "@/components/ui/OnceMotion";

const before = [
  "Saying yes when you mean no",
  "Performing a slightly different version of yourself in every room",
  "Measuring your worth by what others expect of you",
  "Exhaustion that has no clear source",
  "A quiet sense that the life you are living is not quite yours",
];

const after = [
  "Saying what you actually mean",
  "Being the same person everywhere you go",
  "Measuring yourself by what is true for you",
  "Energy that comes from alignment, not effort",
  "A life that is genuinely, recognisably yours",
];

export default function CoachingBeforeAfter() {
  return (
    <section aria-label="The shift in practice" className="overflow-hidden">

      {/* Intro bar */}
      <div className="bg-cream py-10 md:py-14 px-5 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <FadeInView>
            <p className="font-body text-xs text-charcoal-muted tracking-[0.18em] uppercase mb-3">
              What changes
            </p>
          </FadeInView>
          <FadeInView delay={0.1}>
            <h2 className="font-heading text-2xl md:text-3xl text-charcoal leading-tight">
              The shift, in practice
            </h2>
          </FadeInView>
        </div>
      </div>

      {/* Two-column split — full bleed */}
      <div className="md:grid md:grid-cols-2 relative">

        {/* Left — The lens you inherited */}
        <div className="bg-cream-deep px-8 md:px-12 lg:px-16 xl:px-20 py-14 md:py-20">
          <FadeInView>
            <p className="font-body text-[10px] text-charcoal-muted tracking-[0.2em] uppercase mb-8 md:mb-10">
              The lens you inherited
            </p>
          </FadeInView>

          <div className="space-y-6">
            {before.map((item, i) => (
              <OnceMotion.div
                key={i}
                seenId={`coaching-before-${i}`}
                initial={{ opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.75, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: "-60px" }}
                className="flex items-start gap-4"
              >
                <span
                  className="flex-shrink-0 mt-3 w-3 h-px bg-charcoal-muted/40"
                  aria-hidden="true"
                />
                <p className="font-heading italic text-lg md:text-xl text-charcoal-mid leading-snug">
                  {item}
                </p>
              </OnceMotion.div>
            ))}
          </div>
        </div>

        {/* Center lens — desktop only, sits on the boundary */}
        <div
          className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          aria-hidden="true"
        >
          <OnceMotion.div
            seenId="coaching-before-after-lens"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
          >
            <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
              <circle cx="32" cy="32" r="30" stroke="#F5F0EA" strokeWidth="0.6" opacity="0.18" />
              <circle cx="32" cy="32" r="20" stroke="#F5F0EA" strokeWidth="0.5" opacity="0.18" />
              <circle cx="32" cy="32" r="11" stroke="#3D5948" strokeWidth="1.2" opacity="0.85" />
              <circle cx="32" cy="32" r="3" fill="#3D5948" opacity="0.85" />
            </svg>
          </OnceMotion.div>
        </div>

        {/* Right — The lens you choose */}
        <div className="bg-charcoal px-8 md:px-12 lg:px-16 xl:px-20 py-14 md:py-20">
          <FadeInView>
            <p className="font-body text-[10px] text-cream/35 tracking-[0.2em] uppercase mb-8 md:mb-10">
              The lens you choose
            </p>
          </FadeInView>

          <div className="space-y-6">
            {after.map((item, i) => (
              <OnceMotion.div
                key={i}
                seenId={`coaching-after-${i}`}
                initial={{ opacity: 0, x: 14 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.75, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: "-60px" }}
                className="flex items-start gap-4"
              >
                <span
                  className="flex-shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-green"
                  aria-hidden="true"
                />
                <p className="font-heading italic text-lg md:text-xl text-cream leading-snug">
                  {item}
                </p>
              </OnceMotion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
