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
      className="py-20 md:py-32 px-5 md:px-8 lg:px-12 bg-cream-deep"
      aria-label="The Shift"
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl">

          <FadeInView>
            <p className="font-body text-xs text-charcoal-muted tracking-[0.18em] uppercase mb-6">
              The Shift
            </p>
          </FadeInView>

          <FadeInView delay={0.1}>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-charcoal mb-6 leading-tight">
              The Shift
            </h2>
          </FadeInView>

          <FadeInView delay={0.18}>
            <p className="font-body text-base md:text-lg text-charcoal-mid leading-relaxed mb-12 md:mb-16">
              When you understand why people lose themselves, you start to see
              who you really are and stop losing your true self.
            </p>
          </FadeInView>

          {/* Staggered reason lines */}
          <div className="space-y-0 mb-12 md:mb-16" role="list">
            {reasons.map((reason, i) => (
              <motion.div
                key={i}
                role="listitem"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.75,
                  delay: i * 0.18,
                  ease: [0.16, 1, 0.3, 1],
                }}
                viewport={{ once: true, margin: "-60px" }}
                className="flex items-start gap-5 py-5 border-b border-border/70 last:border-b-0"
              >
                <span
                  className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-green mt-3"
                  aria-hidden="true"
                />
                <p className="font-heading italic text-xl md:text-2xl text-charcoal leading-snug">
                  {reason}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Closing paragraphs */}
          <div className="space-y-6 md:space-y-7">

            <FadeInView>
              <p className="font-body text-base text-charcoal-mid leading-relaxed">
                None of that is weakness. It is an incredibly sophisticated
                survival system that you built when you were young enough to
                believe that being yourself was a risk and that isolation or
                being seen as different would be world ending.
              </p>
            </FadeInView>

            <FadeInView delay={0.1}>
              <p className="font-heading italic text-lg text-charcoal-mid leading-snug pl-5 border-l-2 border-green/30">
                The problem is you never stopped running that very survival
                system.
              </p>
            </FadeInView>

            <FadeInView delay={0.18}>
              <p className="font-body text-base text-charcoal-mid leading-relaxed">
                When you actually understand that, not just intellectually but
                in the way that makes something click permanently into place,
                everything changes. Not because you have been given a new
                technique. But because you have seen something you cannot unsee.
              </p>
            </FadeInView>

            <FadeInView delay={0.26}>
              <p className="font-body text-base text-charcoal-mid leading-relaxed">
                You start to recognise the performance in real time. You start
                to notice the gap between what you actually think and what you
                say. You start to make choices that are yours and think freely
                for yourself.
              </p>
            </FadeInView>

            <FadeInView delay={0.34}>
              <p className="font-heading italic text-xl md:text-2xl text-green leading-snug">
                That is what this work does.
              </p>
            </FadeInView>
          </div>
        </div>
      </div>
    </section>
  );
}
