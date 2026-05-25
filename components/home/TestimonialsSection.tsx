'use client';

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import FadeInView from "@/components/ui/FadeInView";
import { testimonials } from "@/lib/testimonials";

function TestimonialCard({
  quote,
  name,
  context,
}: {
  quote: string;
  name: string;
  context: string;
}) {
  return (
    <article className="relative h-full min-h-full rounded-2xl border border-border/70 bg-cream px-5 pb-7 pt-14 shadow-[0_18px_45px_rgba(42,39,34,0.08)] sm:px-6 sm:pb-8 sm:pt-16 md:px-6 md:pb-7 md:pt-14 lg:px-7">
      <span
        className="pointer-events-none absolute -top-5 left-6 flex h-14 w-14 items-center justify-center rounded-full bg-cream-deep text-green shadow-[0_14px_28px_rgba(42,39,34,0.12)] ring-1 ring-border/70 md:h-[3.25rem] md:w-[3.25rem]"
        aria-hidden="true"
      >
        <span className="font-heading text-[2.15rem] leading-none md:text-[2rem]">
          &quot;
        </span>
      </span>

      <blockquote className="flex h-full flex-col">
        <p className="font-heading text-[1.18rem] italic leading-[1.5] text-charcoal sm:text-xl md:text-[1.12rem] md:leading-[1.45] lg:text-[1.18rem]">
          {quote}
        </p>

        <footer className="mt-auto flex min-w-0 items-start gap-3 pt-8 sm:items-center sm:gap-4 md:pt-6">
          <span className="mt-3 h-px w-7 flex-shrink-0 bg-green/45 sm:mt-0 sm:w-8" aria-hidden="true" />
          <div className="min-w-0">
            <p className="break-words font-body text-sm font-medium tracking-wide text-charcoal">
              {name}
            </p>
            <p className="mt-0.5 break-words font-body text-xs text-charcoal-muted">
              {context}
            </p>
          </div>
        </footer>
      </blockquote>
    </article>
  );
}

export default function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const total = testimonials.length;

  const go = (offset: number) => setIndex((i) => (i + offset + total) % total);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragStartX(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX === null) return;
    const dist = e.clientX - dragStartX;
    if (Math.abs(dist) >= 48) go(dist < 0 ? 1 : -1);
    setDragStartX(null);
  };

  return (
    <section
      className="bg-cream-deep px-5 py-16 md:px-8 md:py-[4.5rem] lg:px-12 lg:py-20"
      aria-label="Testimonials"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 grid gap-6 md:mb-11 md:grid-cols-[minmax(0,0.75fr)_minmax(18rem,0.45fr)] md:items-end lg:mb-12">
          <div>
            <FadeInView>
              <p className="mb-4 font-body text-xs uppercase tracking-[0.18em] text-charcoal-muted">
                What people say
              </p>
            </FadeInView>
            <FadeInView delay={0.1}>
              <h2 className="max-w-2xl font-heading text-3xl leading-tight text-charcoal md:text-4xl">
                The difference a shift in perspective can make
              </h2>
            </FadeInView>
          </div>

          <FadeInView delay={0.15}>
            <p className="font-body text-sm leading-relaxed text-charcoal-mid md:text-base">
              A calm space to understand yourself more clearly, make braver decisions,
              and move forward with more trust in your own judgement.
            </p>
          </FadeInView>
        </div>

        {/* Desktop: all three cards in a grid */}
        <FadeInView delay={0.2} className="hidden overflow-visible md:block">
          <div className="grid overflow-visible gap-x-5 gap-y-10 pt-5 md:grid-cols-3 lg:gap-x-6">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
        </FadeInView>

        {/* Mobile: single-card swipe carousel */}
        <div className="md:hidden">
          <div
            className="touch-pan-y cursor-grab select-none overflow-x-clip pt-6 active:cursor-grabbing"
            aria-live="polite"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => setDragStartX(null)}
          >
            <div className="grid overflow-x-clip">
              <AnimatePresence initial={false}>
                {testimonials.map((testimonial, i) => {
                  const active = i === index;

                  return (
                    <motion.div
                      key={testimonial.name}
                      className={`col-start-1 row-start-1 min-w-0 ${
                        active ? "pointer-events-auto" : "pointer-events-none"
                      }`}
                      initial={false}
                      animate={{
                        opacity: active ? 1 : 0,
                        x: active ? 0 : i < index ? -24 : 24,
                        filter: active ? "blur(0px)" : "blur(3px)",
                      }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      aria-hidden={!active}
                    >
                      <TestimonialCard {...testimonial} />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Dot navigation */}
          <div
            className="mt-8 flex items-center justify-center gap-2"
            role="tablist"
            aria-label="Select testimonial"
          >
            {testimonials.map((t, i) => {
              const active = i === index;
              return (
                <button
                  key={t.name}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`Show testimonial from ${t.name}`}
                  onClick={() => setIndex(i)}
                  className="flex h-8 w-8 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
                >
                  <span
                    className={`block rounded-full transition-all duration-300 ${
                      active
                        ? "h-3 w-3 bg-green"
                        : "h-2.5 w-2.5 bg-charcoal/20 hover:bg-charcoal/35"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
