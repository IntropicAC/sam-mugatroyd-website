'use client';

import Image from "next/image";
import FadeInView from "@/components/ui/FadeInView";
import { OnceMotion } from "@/components/ui/OnceMotion";

export default function CoachingWhySam() {
  return (
    <section
      className="relative overflow-hidden bg-charcoal px-5 py-16 md:px-8 md:py-28 lg:px-12"
      aria-label="Why Sam"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent, transparent 71px, #F5F0EA 71px, #F5F0EA 72px)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-5xl">
        <FadeInView>
          <p className="mb-6 font-body text-[10px] uppercase tracking-[0.22em] text-cream/35">
            Why Sam?
          </p>
        </FadeInView>

        <FadeInView>
          <h2 className="mb-8 max-w-3xl font-heading text-3xl leading-tight text-cream md:text-5xl">
            I did not learn this from a course.
          </h2>
        </FadeInView>

        <div className="flow-root max-w-4xl">
          <OnceMotion.figure
            seenId="coaching-why-sam-portrait"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-80px" }}
            className="float-right mb-5 ml-5 w-[42%] max-w-[10.5rem] md:mb-7 md:ml-8 md:w-[18rem] md:max-w-[18rem]"
          >
            <div className="overflow-hidden border border-cream/10 bg-cream/[0.04] p-2">
              <div className="relative overflow-hidden">
                <Image
                  src="/images/sam-headshot.jpg"
                  alt="Sam Murgatroyd - Mindset Coach and Author"
                  width={640}
                  height={800}
                  className="h-auto w-full object-cover object-top"
                  sizes="(max-width: 767px) 42vw, 288px"
                />
                <div
                  className="absolute inset-0 mix-blend-multiply"
                  style={{ backgroundColor: "rgba(26,40,32,0.22)" }}
                  aria-hidden="true"
                />
              </div>
            </div>
            <figcaption className="mt-3 border-t border-cream/10 pt-3 md:mt-4 md:pt-4">
              <p className="font-heading text-sm leading-snug text-cream md:text-base">
                Sam Murgatroyd
              </p>
              <p className="mt-1 font-body text-[10px] leading-snug text-cream/45 md:text-xs">
                Mindset Coach &middot; Author
              </p>
              <p className="mt-1 font-body text-[10px] leading-snug text-green-hover md:text-xs">
                Amazon Bestseller
              </p>
            </figcaption>
          </OnceMotion.figure>

          <div className="space-y-5 md:space-y-6">
            <FadeInView delay={0.08}>
              <p className="font-body text-sm leading-relaxed text-cream/58 md:text-base">
                Before coaching I spent years working in psychiatric hospitals,
                probation services, children&apos;s care homes, drug and alcohol
                rehabilitation services and SEN schools. I have worked with
                people at their lowest points and darkest times, across a wide
                range of backgrounds and experiences.
              </p>
            </FadeInView>

            <FadeInView delay={0.16}>
              <p className="font-body text-sm leading-relaxed text-cream/58 md:text-base">
                What I saw in almost all of those environments, and what I have
                seen in every person I have coached since, was the same thing.
              </p>
            </FadeInView>

            <FadeInView delay={0.24}>
              <p className="border-l-2 border-green pl-5 font-heading text-xl italic leading-snug text-cream md:text-2xl">
                People who had spent so long becoming who they thought they had
                to be that they had completely lost sight of who they actually
                were.
              </p>
            </FadeInView>

            <FadeInView delay={0.32}>
              <p className="font-body text-sm leading-relaxed text-cream/58 md:text-base">
                I have also written three books exploring this territory:
                identity, honesty, what it costs us to perform and what becomes
                possible when we stop. This work comes from somewhere real.
              </p>
            </FadeInView>

            <FadeInView delay={0.4}>
              <p className="font-heading text-lg italic leading-snug text-green-hover md:text-xl">
                That is why it lands the way it does.
              </p>
            </FadeInView>
          </div>
        </div>
      </div>
    </section>
  );
}
