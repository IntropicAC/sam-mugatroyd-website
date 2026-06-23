'use client';

import Link from "next/link";
import VideoEmbed from "@/components/ui/VideoEmbed";
import { OnceMotion } from "@/components/ui/OnceMotion";
import { INTRO_VIDEO, INTRO_VIDEO_TRANSCRIPT } from "@/lib/site";

export default function MeetSamSection() {
  return (
    <section
      className="bg-cream-deep px-5 pb-10 pt-20 md:px-8 md:pb-14 md:pt-28 lg:px-12"
      aria-label="Meet Sam — short introduction video"
    >
      <div className="mx-auto max-w-4xl">
        {/* Eyebrow */}
        <OnceMotion.p
          seenId="home-meet-sam-eyebrow"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center font-body text-xs uppercase tracking-[0.22em] text-charcoal-muted"
        >
          Two-minute introduction
        </OnceMotion.p>

        {/* Heading */}
        <OnceMotion.h2
          seenId="home-meet-sam-heading"
          initial={{ opacity: 0, filter: "blur(8px)", y: 8 }}
          whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto mt-5 max-w-2xl text-center font-heading text-3xl font-normal leading-tight text-charcoal md:text-5xl"
        >
          Hear it from Sam.
        </OnceMotion.h2>

        {/* Sub */}
        <OnceMotion.p
          seenId="home-meet-sam-sub"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto mt-5 max-w-xl text-center font-body text-base leading-relaxed text-charcoal-mid"
        >
          A short introduction to the work, who it is for, and the lens shift at
          the heart of the coaching.
        </OnceMotion.p>

        {/* Video */}
        <OnceMotion.div
          seenId="home-meet-sam-video"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-80px" }}
          className="mt-10 md:mt-14"
        >
          <VideoEmbed
            youtubeId={INTRO_VIDEO.youtubeId}
            title={INTRO_VIDEO.title}
            thumbnailUrl={INTRO_VIDEO.posterImage}
          />
        </OnceMotion.div>

        {/* Collapsible transcript — good for SEO and accessibility */}
        <OnceMotion.div
          seenId="home-meet-sam-transcript"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          viewport={{ once: true, margin: "-60px" }}
          className="mt-8 md:mt-10"
        >
          <details className="group border-t border-border pt-5">
            <summary className="flex cursor-pointer list-none items-center justify-between font-body text-xs uppercase tracking-[0.2em] text-charcoal-muted transition-colors hover:text-charcoal">
              <span>Read the transcript</span>
              <span
                aria-hidden="true"
                className="ml-3 inline-block transition-transform duration-300 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="mt-5 space-y-4 font-body text-sm leading-relaxed text-charcoal-mid md:text-base">
              {INTRO_VIDEO_TRANSCRIPT.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </details>
        </OnceMotion.div>

        <OnceMotion.div
          seenId="home-meet-sam-about-cta"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: "easeOut" }}
          viewport={{ once: true, margin: "-60px" }}
          className="mt-8 text-center"
        >
          <Link
            href="/about"
            className="inline-flex min-h-11 items-center justify-center border border-border px-6 py-3 font-body text-sm font-medium tracking-wide text-charcoal transition-colors duration-300 hover:border-charcoal hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green"
          >
            Learn more about Sam
          </Link>
        </OnceMotion.div>
      </div>
    </section>
  );
}
