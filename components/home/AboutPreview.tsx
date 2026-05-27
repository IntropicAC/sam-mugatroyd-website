'use client';

import Image from "next/image";
import FadeInView from "@/components/ui/FadeInView";
import BranchRevealText from "@/components/ui/BranchRevealText";
import CTAButton from "@/components/ui/CTAButton";
import { OnceMotion } from "@/components/ui/OnceMotion";

const bioParagraphs = [
  `Sam grew up feeling like he never quite fit in. He saw the world differently to the people around him and spent years wondering if that was something to fix. That outsider perspective eventually became the lens at the heart of his work.`,
  `Psychiatric hospitals, probation services, children’s care homes, drug and alcohol rehabilitation. Years spent alongside people at their lowest points. What he saw across all of it was the same pattern: people who had lost sight of who they actually were.`,
];

const closingLine = `The books came from that place. The coaching came from that place. All of it is rooted in something lived, not something learned from a textbook.`;

export default function AboutPreview() {
  return (
    <section className="pt-10 pb-20 md:pt-14 md:pb-28 px-5 md:px-8 lg:px-12" aria-label="About Sam">
      <div className="max-w-7xl mx-auto">

        {/* ── Mobile: byline header ─────────────────────────────────── */}
        <OnceMotion.div
          seenId="home-about-mobile-byline"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-80px" }}
          className="flex items-end gap-5 mb-10 md:hidden"
        >
          {/* Small portrait */}
          <div className="relative w-24 h-32 flex-shrink-0 overflow-hidden">
            <Image
              src="/images/sam-headshot.jpg"
              alt="Sam Murgatroyd"
              fill
              className="object-cover object-top grayscale-[15%]"
              sizes="96px"
            />
            <div className="absolute inset-0 bg-green/5 mix-blend-multiply" aria-hidden="true" />
          </div>

          {/* Name block */}
          <div>
            <p className="font-body text-xs text-charcoal-muted tracking-[0.18em] uppercase mb-2">
              About Sam
            </p>
            <h2 className="font-heading text-2xl text-charcoal leading-tight">
              Sam Murgatroyd
            </h2>
            <p className="font-body text-sm text-charcoal-mid mt-1">
              Life Coach and Author
            </p>
            <p className="font-body text-xs text-green mt-1">
              Amazon Bestselling Author
            </p>
          </div>
        </OnceMotion.div>

        {/* ── Two-column grid (desktop only layout) ────────────────── */}
        <div className="md:grid md:grid-cols-12 md:gap-16 md:items-start">

          {/* Desktop left column — sticky portrait */}
          <OnceMotion.div
            seenId="home-about-desktop-portrait"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-120px" }}
            className="hidden md:block md:col-span-4 lg:col-span-3 md:sticky md:top-24"
          >
            <div className="relative w-full aspect-[3/4] overflow-hidden">
              <Image
                src="/images/sam-headshot.jpg"
                alt="Sam Murgatroyd — Life Coach and Author"
                fill
                className="object-cover object-top grayscale-[15%]"
                sizes="(max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-green/5 mix-blend-multiply" aria-hidden="true" />
            </div>

            {/* Name block under image on desktop */}
            <div className="mt-5">
              <h2 className="font-heading text-xl text-charcoal">Sam Murgatroyd</h2>
              <p className="font-body text-sm text-charcoal-mid mt-1">
                Life Coach and Author
              </p>
              <p className="font-body text-xs text-green mt-1.5">
                Amazon Bestselling Author
              </p>
            </div>
          </OnceMotion.div>

          {/* Right column — eyebrow + bio + CTA (all viewports on mobile, right col on desktop) */}
          <div className="md:col-span-8 lg:col-span-9">

            {/* Eyebrow — desktop only (mobile eyebrow is in the byline header above) */}
            <FadeInView>
              <p className="hidden md:block font-body text-xs text-charcoal-muted tracking-[0.18em] uppercase mb-8">
                About Sam
              </p>
            </FadeInView>

            {/* Bio paragraphs */}
            <div className="space-y-5 md:space-y-6">
              {bioParagraphs.map((para, i) => (
                <BranchRevealText
                  key={i}
                  text={para}
                  className={`font-body leading-relaxed block ${
                    i === 0
                      ? "text-base md:text-[1.05rem] text-charcoal"
                      : "text-base text-charcoal-mid"
                  }`}
                />
              ))}
            </div>

            {/* Closing paragraph — styled as a pull statement */}
            <div className="mt-8 pt-8 border-t border-border">
              <BranchRevealText
                text={closingLine}
                className="font-heading italic text-lg md:text-xl text-charcoal leading-snug block"
              />
            </div>

            <FadeInView delay={0.15} className="mt-8">
              <CTAButton href="/about" variant="ghost">
                Learn more about Sam
              </CTAButton>
            </FadeInView>
          </div>
        </div>

      </div>
    </section>
  );
}
