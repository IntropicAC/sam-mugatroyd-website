'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import FadeInView from "@/components/ui/FadeInView";

function LensDivider() {
  return (
    <div
      className="flex items-center gap-4 my-16 md:my-20"
      aria-hidden="true"
    >
      <div className="flex-1 h-px bg-border" />
      <svg
        viewBox="0 0 20 20"
        className="w-3.5 h-3.5 flex-shrink-0 text-charcoal-muted opacity-40"
        fill="none"
      >
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1" />
        <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="10" cy="10" r="1.5" fill="currentColor" />
      </svg>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

export default function CoachingWhyDifferent() {
  return (
    <section
      className="py-20 md:py-32 px-5 md:px-8 lg:px-12"
      aria-label="Why this work is different"
    >
      <div className="max-w-7xl mx-auto">

        <FadeInView>
          <p className="font-body text-xs text-charcoal-muted tracking-[0.18em] uppercase mb-6">
            Why this work is different
          </p>
        </FadeInView>

        {/* ── What I Do Not Do ─────────────────────────────────── */}
        <div className="max-w-2xl">

          <FadeInView delay={0.1}>
            <h2 className="font-heading text-2xl md:text-3xl text-charcoal mb-8 leading-tight">
              What I Do Not Do
            </h2>
          </FadeInView>

          <div className="space-y-5 md:space-y-6">
            <FadeInView delay={0.15}>
              <p className="font-heading italic text-lg md:text-xl text-charcoal leading-snug">
                This is not motivation. Motivation fades.
              </p>
            </FadeInView>

            <FadeInView delay={0.22}>
              <p className="font-body text-base text-charcoal-mid leading-relaxed">
                I am not going to give you a morning routine.
              </p>
            </FadeInView>

            <FadeInView delay={0.29}>
              <p className="font-body text-base text-charcoal-mid leading-relaxed">
                I am not going to tell you to journal your limiting beliefs or
                repeat affirmations until something shifts.
              </p>
            </FadeInView>

            <FadeInView delay={0.36}>
              <p className="font-body text-base text-charcoal-mid leading-relaxed">
                I am not interested in a version of you that feels good for
                three weeks and then quietly drifts back to the same patterns
                with a different name.
              </p>
            </FadeInView>

            <FadeInView delay={0.43}>
              <p className="font-body text-base text-charcoal-mid leading-relaxed">
                What I offer is a fundamental change in how you see yourself
                and the world around you, the kind that does not wear off
                because it is not built on effort or willpower. It is built on
                understanding.
              </p>
            </FadeInView>

            <FadeInView delay={0.5}>
              <p className="font-body text-base text-charcoal-mid leading-relaxed">
                Once you see why you built the mask, you cannot pretend it is
                not there. Once you understand what is actually driving the
                people-pleasing, the overthinking and the performance, it loses
                its grip. Not because you fought it. Because you finally saw it
                clearly.
              </p>
            </FadeInView>

            <FadeInView delay={0.57}>
              <p className="font-heading italic text-lg text-charcoal-mid leading-snug pl-5 border-l-2 border-green/30">
                You cannot unlearn that kind of thing.
              </p>
            </FadeInView>
          </div>
        </div>

        <LensDivider />

        {/* ── Who Is This For? ─────────────────────────────────── */}
        <div className="max-w-2xl">

          <FadeInView>
            <h2 className="font-heading text-2xl md:text-3xl text-charcoal mb-8 leading-tight">
              Who Is This For?
            </h2>
          </FadeInView>

          <div className="space-y-5 md:space-y-6">
            <FadeInView delay={0.1}>
              <p className="font-heading italic text-lg md:text-xl text-charcoal leading-snug">
                You do not have to be falling apart for this to be for you.
              </p>
            </FadeInView>

            <FadeInView delay={0.18}>
              <p className="font-body text-base text-charcoal-mid leading-relaxed">
                Most people who work with me are functioning fine on the
                outside.
              </p>
            </FadeInView>

            <FadeInView delay={0.25}>
              <p className="font-body text-base text-charcoal-mid leading-relaxed">
                They are capable. Reliable. Well-liked. They show up.
              </p>
            </FadeInView>

            <FadeInView delay={0.32}>
              <p className="font-body text-base text-charcoal-mid leading-relaxed">
                But something underneath all of that has been subtly off for a
                long time. A sense that the life they are living was built
                around what was expected of them rather than what is actually
                true for them. A feeling that they have been so busy becoming
                someone people like and accept that they have never really
                asked who they are when no one is watching.
              </p>
            </FadeInView>

            <FadeInView delay={0.39}>
              <p className="font-body text-base text-charcoal-mid leading-relaxed">
                You do not need to be in crisis to want something more honest
                than this.
              </p>
            </FadeInView>

            <FadeInView delay={0.46}>
              <p className="font-heading italic text-lg text-charcoal-mid leading-snug pl-5 border-l-2 border-green/30">
                You just need to be ready to look at things differently.
              </p>
            </FadeInView>
          </div>
        </div>

        <LensDivider />

        {/* ── Why Sam? ─────────────────────────────────────────── */}
        <div>
          <FadeInView>
            <h2 className="font-heading text-2xl md:text-3xl text-charcoal mb-8 leading-tight">
              Why Sam?
            </h2>
          </FadeInView>

          <div className="md:grid md:grid-cols-12 md:gap-14 md:items-start">

            {/* Portrait — stacks above text on mobile, right column on desktop */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-80px" }}
              className="mb-8 md:mb-0 md:col-span-4 md:col-start-9 md:row-start-1 md:sticky md:top-24"
            >
              <div className="relative w-40 h-52 md:w-full md:h-auto md:aspect-[3/4] overflow-hidden">
                <Image
                  src="/images/sam-headshot.jpg"
                  alt="Sam Murgatroyd — Authenticity Coach and Author"
                  fill
                  className="object-cover object-top grayscale-[15%]"
                  sizes="(max-width: 768px) 160px, 25vw"
                />
                <div
                  className="absolute inset-0 bg-green/5 mix-blend-multiply"
                  aria-hidden="true"
                />
              </div>
              <div className="mt-4">
                <p className="font-heading text-sm text-charcoal leading-snug">
                  Sam Murgatroyd
                </p>
                <p className="font-body text-xs text-charcoal-mid mt-0.5">
                  Authenticity Coach and Author
                </p>
                <p className="font-body text-xs text-green mt-1">
                  Amazon Bestselling Author
                </p>
              </div>
            </motion.div>

            {/* Body text */}
            <div className="max-w-2xl md:col-span-8 md:col-start-1 md:row-start-1 space-y-5 md:space-y-6">

              <FadeInView>
                <p className="font-heading italic text-lg md:text-xl text-charcoal leading-snug">
                  I did not learn this from a course.
                </p>
              </FadeInView>

              <FadeInView delay={0.1}>
                <p className="font-body text-base text-charcoal-mid leading-relaxed">
                  Before coaching I spent years working in psychiatric
                  hospitals, probation services, children's care homes, drug
                  and alcohol rehabilitation services and SEN schools. I have
                  worked with people at their lowest points and darkest times,
                  and across such a wide range of backgrounds and experiences
                  that I have developed a genuine understanding of the many
                  different ways people see themselves and the world around
                  them.
                </p>
              </FadeInView>

              <FadeInView delay={0.18}>
                <p className="font-body text-base text-charcoal-mid leading-relaxed">
                  What I saw in almost all of those environments, and what I
                  have seen in every person I have coached since, was the same
                  thing.
                </p>
              </FadeInView>

              <FadeInView delay={0.25}>
                <p className="font-heading italic text-lg text-charcoal-mid leading-snug pl-5 border-l-2 border-green/30">
                  People who had spent so long becoming who they thought they
                  had to be that they had completely lost sight of who they
                  actually were.
                </p>
              </FadeInView>

              <FadeInView delay={0.32}>
                <p className="font-body text-base text-charcoal-mid leading-relaxed">
                  I have also written three books exploring exactly this
                  territory. Identity, honesty, what it costs us to perform and
                  what becomes possible when we stop. Not because I figured it
                  out from the outside. Because I lived it from the inside.
                </p>
              </FadeInView>

              <FadeInView delay={0.39}>
                <p className="font-heading italic text-lg text-green leading-snug">
                  This work comes from somewhere real. That is why it lands the
                  way it does.
                </p>
              </FadeInView>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
