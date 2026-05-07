'use client';

import FadeInView from "@/components/ui/FadeInView";

export default function CoachingLensMovement() {
  return (
    <section
      className="py-20 md:py-32 px-5 md:px-8 lg:px-12"
      aria-label="You Are Not Broken"
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl">

          <FadeInView>
            <p className="font-body text-xs text-charcoal-muted tracking-[0.18em] uppercase mb-6">
              The Lens
            </p>
          </FadeInView>

          <FadeInView delay={0.1}>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-charcoal mb-12 md:mb-16 leading-tight">
              You Are Not Broken
            </h2>
          </FadeInView>

          {/* First paragraph — highlighted key phrases */}
          <FadeInView delay={0.15} className="mb-7 md:mb-9">
            <p className="font-body text-base md:text-lg leading-relaxed">
              <span className="font-heading not-italic text-charcoal">
                You are not broken.
              </span>{" "}
              <span className="text-charcoal-mid">
                You are just looking at everything through{" "}
              </span>
              <em className="font-heading not-italic text-green">
                a lens you did not choose.
              </em>
            </p>
          </FadeInView>

          <FadeInView delay={0.22} className="mb-7 md:mb-9">
            <p className="font-body text-base text-charcoal-mid leading-relaxed">
              The way you see yourself. The way you see other people. The way
              you decide what is acceptable, what is expected, what is possible
              for someone like you.
            </p>
          </FadeInView>

          <FadeInView delay={0.29} className="mb-7 md:mb-9">
            <p className="font-body text-base text-charcoal-mid leading-relaxed">
              That lens was built a long time ago out of the need to fit in, be
              liked, avoid judgment, keep people close. It made sense then. It
              is just that you have been looking through it for so long that it
              stopped feeling like a lens and started feeling like reality.
            </p>
          </FadeInView>

          {/* Pull statement */}
          <FadeInView delay={0.36} className="mb-7 md:mb-9">
            <p className="font-heading italic text-lg md:text-xl text-charcoal-mid leading-snug pl-5 border-l-2 border-green/30">
              That is the thing nobody tells you.
            </p>
          </FadeInView>

          <FadeInView delay={0.43}>
            <p className="font-body text-base text-charcoal-mid leading-relaxed">
              The exhaustion is not coming from your circumstances. It is coming
              from seeing the world in a way that was never really yours.
            </p>
          </FadeInView>
        </div>
      </div>
    </section>
  );
}
