'use client';

import FadeInView from "@/components/ui/FadeInView";
import { OnceMotion } from "@/components/ui/OnceMotion";

const territories = [
  {
    title: "Overthinking",
    text: "Getting underneath the constant mental noise rather than only managing it on the surface.",
  },
  {
    title: "People pleasing",
    text: "Understanding where the habit of shaping yourself around everyone else came from.",
  },
  {
    title: "Self criticism",
    text: "Separating what is true from what is just an old, harsh internal habit.",
  },
  {
    title: "Confidence and self trust",
    text: "Building confidence through honesty rather than performance or achievement.",
  },
  {
    title: "Career and direction",
    text: "Working out what is actually true for you rather than what was expected.",
  },
  {
    title: "Burnout and exhaustion",
    text: "Exploring the kind of tiredness rest alone does not reach.",
  },
];

const outcomes = [
  {
    title: "A clearer sense of self",
    text: "Not a new identity, but a return to something that was already there.",
  },
  {
    title: "Genuine confidence",
    text: "The kind built on self trust rather than things going well.",
  },
  {
    title: "Less mental noise",
    text: "Overthinking softens as the need for pre-approval loses its grip.",
  },
  {
    title: "Better relationships",
    text: "More honest connection and less management of how you are received.",
  },
  {
    title: "A lighter daily state",
    text: "Less internal negotiation between who you are and who you feel you must be.",
  },
];

function TimelineList({
  eyebrow,
  title,
  items,
  trackId,
  itemPrefix,
}: {
  eyebrow: string;
  title: string;
  items: { title: string; text: string }[];
  trackId: string;
  itemPrefix: string;
}) {
  return (
    <div>
      <FadeInView>
        <p className="font-body text-[10px] uppercase tracking-[0.24em] text-green mb-3">
          {eyebrow}
        </p>
        <h3 className="font-heading text-xl leading-tight text-charcoal mb-8 md:text-2xl">
          {title}
        </h3>
      </FadeInView>

      {/* Mobile vertical timeline */}
      <div className="relative pl-10 md:hidden">
        <div
          className="absolute left-[7px] top-1 bottom-1 w-px bg-border"
          aria-hidden="true"
        >
          <OnceMotion.div
            seenId={`${trackId}-mobile-track`}
            className="w-full bg-green/40 origin-top"
            style={{ height: "100%" }}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            transition={{ duration: 1.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-60px" }}
          />
        </div>

        <div className="space-y-8">
          {items.map((item, i) => (
            <OnceMotion.div
              key={item.title}
              seenId={`${itemPrefix}-mobile-${i}`}
              initial={{ opacity: 0, x: 14 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.7,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              viewport={{ once: true, margin: "-50px" }}
              className="relative"
            >
              <OnceMotion.div
                seenId={`${itemPrefix}-mobile-dot-${i}`}
                className="absolute -left-10 top-[5px] w-[14px] h-[14px] rounded-full border border-green bg-cream"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.4,
                  delay: 0.15 + i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                viewport={{ once: true }}
              />
              <h4 className="font-body text-sm font-medium text-charcoal leading-snug">
                {item.title}
              </h4>
              <p className="mt-1 font-body text-xs leading-relaxed text-charcoal-mid">
                {item.text}
              </p>
            </OnceMotion.div>
          ))}
        </div>
      </div>

      {/* Desktop staggered list */}
      <div className="hidden md:block space-y-5">
        {items.map((item, i) => (
          <OnceMotion.div
            key={item.title}
            seenId={`${itemPrefix}-desktop-${i}`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.75,
              delay: 0.1 + i * 0.09,
              ease: [0.16, 1, 0.3, 1],
            }}
            viewport={{ once: true, margin: "-60px" }}
            className="border-b border-border/60 pb-5"
          >
            <h4 className="font-body text-sm font-medium text-charcoal leading-snug">
              {item.title}
            </h4>
            <p className="mt-1 font-body text-xs leading-relaxed text-charcoal-mid">
              {item.text}
            </p>
          </OnceMotion.div>
        ))}
      </div>
    </div>
  );
}

export default function CoachingTerritoriesSection() {
  return (
    <section
      className="bg-cream px-5 py-16 md:px-8 md:py-24 lg:px-12"
      aria-label="What coaching can help with"
    >
      <div className="mx-auto max-w-7xl">

        {/* Section header */}
        <div className="mb-12 md:mb-16 md:max-w-xl">
          <FadeInView>
            <p className="font-body text-xs uppercase tracking-[0.18em] text-charcoal-muted mb-5">
              The territory
            </p>
          </FadeInView>
          <OnceMotion.h2
            seenId="coaching-territories-heading"
            initial={{ opacity: 0, filter: "blur(8px)", y: 10 }}
            whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className="font-heading text-3xl leading-tight text-charcoal md:text-4xl"
          >
            The work is personal, but the patterns are familiar.
          </OnceMotion.h2>
          <FadeInView delay={0.12}>
            <p className="mt-5 font-body text-sm leading-relaxed text-charcoal-mid md:text-base">
              These are not separate problems to collect. They are usually connected
              expressions of the same deeper distance between who someone is and who
              they have learned to be.
            </p>
          </FadeInView>
        </div>

        {/* Two lists */}
        <div className="grid gap-14 md:grid-cols-2 md:gap-12 lg:gap-16">
          <TimelineList
            eyebrow="What we may work on"
            title="Where the work often begins"
            items={territories}
            trackId="territories"
            itemPrefix="territory"
          />
          <TimelineList
            eyebrow="What people take away"
            title="What tends to change"
            items={outcomes}
            trackId="outcomes"
            itemPrefix="outcome"
          />
        </div>

      </div>
    </section>
  );
}
