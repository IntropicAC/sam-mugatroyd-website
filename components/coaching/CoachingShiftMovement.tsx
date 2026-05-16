'use client';

import { motion } from "framer-motion";
import FadeInView from "@/components/ui/FadeInView";

const reasons = [
  "There is a reason you say yes when you mean no.",
  "There is a reason you know how to read a room before you have even sat down.",
  "There is a reason the version of you at work, at home, with your parents, with your friends are all slightly different people.",
];

export default function CoachingShiftMovement() {
  return (
    <section
      className="relative py-16 md:py-28 px-5 md:px-8 lg:px-12 bg-cream-deep overflow-hidden"
      aria-label="The Shift"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.38]"
        style={{
          background:
            "radial-gradient(circle at 8% 10%, rgba(61,89,72,0.10), transparent 30%), radial-gradient(circle at 90% 64%, rgba(42,39,34,0.06), transparent 28%)",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[0.82fr_1.18fr] gap-9 md:gap-14 lg:gap-20 items-start">
          <div className="lg:sticky lg:top-28">
            <FadeInView>
              <p className="font-body text-xs text-charcoal-muted tracking-[0.18em] uppercase mb-4 md:mb-6">
                The Shift
              </p>
            </FadeInView>

            <FadeInView delay={0.1}>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-charcoal mb-4 md:mb-6 leading-tight">
                The Shift
              </h2>
            </FadeInView>

            <FadeInView delay={0.18}>
              <p className="font-body text-sm md:text-lg text-charcoal-mid leading-relaxed max-w-md">
                When you understand why people lose themselves, you start to see
                who you really are and stop losing your true self.
              </p>
            </FadeInView>
          </div>

          <div>
            <div className="grid gap-4 md:gap-5 mb-6 md:mb-8" role="list">
              {reasons.map((reason, i) => (
                <motion.div
                  key={reason}
                  role="listitem"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.75,
                    delay: i * 0.12,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  viewport={{ once: true, margin: "-60px" }}
                  className="relative overflow-hidden border border-border bg-cream/70 px-5 py-5 md:px-7 md:py-6"
                >
                  <div
                    className="absolute inset-y-0 left-0 w-1 bg-green/45"
                    aria-hidden="true"
                  />
                  <p className="font-heading italic text-lg md:text-2xl text-charcoal leading-snug pl-3 md:pl-4">
                    {reason}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-5">
              <FadeInView>
                <div className="h-full border border-border bg-cream px-5 py-6 md:px-7 md:py-8">
                  <p className="font-body text-sm md:text-base text-charcoal-mid leading-relaxed">
                    None of that is weakness. It is an incredibly sophisticated
                    survival system that you built when you were young enough to
                    believe that being yourself was a risk and that isolation or
                    being seen as different would be world ending.
                  </p>
                </div>
              </FadeInView>

              <FadeInView delay={0.1}>
                <div className="h-full border border-green/30 bg-charcoal px-5 py-6 md:px-7 md:py-8">
                  <p className="font-heading italic text-base md:text-lg text-cream/80 leading-snug pl-4 border-l-2 border-green/50 mb-6">
                    The problem is you never stopped running that very survival system.
                  </p>
                  <p className="font-body text-sm md:text-base text-cream/62 leading-relaxed">
                    When you actually understand that, not just intellectually but
                    in the way that makes something click permanently into place,
                    everything changes. Not because you have been given a new
                    technique. But because you have seen something you cannot unsee.
                  </p>
                </div>
              </FadeInView>
            </div>

            <FadeInView delay={0.18}>
              <div className="mt-5 border border-border bg-cream/70 px-5 py-6 md:px-7 md:py-8">
                <p className="font-body text-sm md:text-base text-charcoal-mid leading-relaxed mb-5">
                  You start to recognise the performance in real time. You start
                  to notice the gap between what you actually think and what you
                  say. You start to make choices that are yours and think freely
                  for yourself.
                </p>
                <p className="font-heading italic text-lg md:text-2xl text-green leading-snug">
                  That is what this work does.
                </p>
              </div>
            </FadeInView>
          </div>
        </div>
      </div>
    </section>
  );
}
