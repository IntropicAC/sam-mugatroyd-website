'use client';

import { motion } from "framer-motion";
import FadeInView from "@/components/ui/FadeInView";

const stages = [
  {
    number: "1",
    title: "The Conversation",
    description:
      "A free 20-minute call. No pitch, no agenda. Just an honest conversation about where you are and whether this feels right.",
  },
  {
    number: "2",
    title: "The Lens Work",
    description:
      "We examine the lens you have been looking through — where it came from, what it has cost you, and why it made complete sense at the time.",
  },
  {
    number: "3",
    title: "The Shift",
    description:
      "Something clicks into place. Not a technique you apply on a good day — a genuine, permanent change in how you see yourself and the world.",
  },
  {
    number: "4",
    title: "The Integration",
    description:
      "The shift becomes how you live. You make choices that are yours. You stop performing. You stop losing yourself in the process.",
  },
];

export default function CoachingJourneyTimeline() {
  return (
    <section
      className="py-20 md:py-32 px-5 md:px-8 lg:px-12 bg-cream overflow-hidden"
      aria-label="The coaching journey"
    >
      <div className="max-w-7xl mx-auto">

        <FadeInView>
          <p className="font-body text-xs text-charcoal-muted tracking-[0.18em] uppercase mb-6">
            The Journey
          </p>
        </FadeInView>

        <FadeInView delay={0.1}>
          <h2 className="font-heading text-3xl md:text-4xl text-charcoal mb-16 md:mb-24 leading-tight max-w-lg">
            What the work actually looks like
          </h2>
        </FadeInView>

        {/* ── Desktop horizontal timeline ─────────────────────── */}
        <div className="hidden md:block relative">

          {/* Track line */}
          <div
            className="absolute top-[22px] left-[22px] right-[22px] h-px bg-border"
            aria-hidden="true"
          >
            <motion.div
              className="h-full bg-green/50 origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-80px" }}
            />
          </div>

          <div className="grid grid-cols-4 gap-10">
            {stages.map((stage, i) => (
              <motion.div
                key={stage.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.85,
                  delay: 0.3 + i * 0.18,
                  ease: [0.16, 1, 0.3, 1],
                }}
                viewport={{ once: true, margin: "-80px" }}
              >
                {/* Node */}
                <motion.div
                  className="w-11 h-11 rounded-full border border-green bg-cream flex items-center justify-center mb-8 relative z-10"
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.5 + i * 0.2,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  viewport={{ once: true }}
                >
                  <span className="font-heading text-sm text-green leading-none">
                    {stage.number}
                  </span>
                </motion.div>

                <h3 className="font-heading text-lg text-charcoal mb-3 leading-snug">
                  {stage.title}
                </h3>
                <p className="font-body text-sm text-charcoal-mid leading-relaxed">
                  {stage.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Mobile vertical timeline ────────────────────────── */}
        <div className="md:hidden relative pl-12">

          {/* Vertical track */}
          <div
            className="absolute left-[18px] top-1 bottom-1 w-px bg-border"
            aria-hidden="true"
          >
            <motion.div
              className="w-full bg-green/50 origin-top"
              style={{ height: "100%" }}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              transition={{ duration: 2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-60px" }}
            />
          </div>

          <div className="space-y-12">
            {stages.map((stage, i) => (
              <motion.div
                key={stage.number}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.75,
                  delay: i * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                viewport={{ once: true, margin: "-60px" }}
                className="relative"
              >
                {/* Node */}
                <div className="absolute -left-12 top-0 w-9 h-9 rounded-full border border-green bg-cream flex items-center justify-center">
                  <span className="font-heading text-sm text-green leading-none">
                    {stage.number}
                  </span>
                </div>

                <h3 className="font-heading text-lg text-charcoal mb-2 leading-snug">
                  {stage.title}
                </h3>
                <p className="font-body text-sm text-charcoal-mid leading-relaxed">
                  {stage.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
