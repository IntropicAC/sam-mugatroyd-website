'use client';

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { OnceMotion } from "@/components/ui/OnceMotion";

const STEPS = [
  {
    title: "Notice the terrain",
    body:
      "The patterns stop looking random once you can see what they were built to protect.",
  },
  {
    title: "Name the old route",
    body: "Fitting in, being liked, avoiding judgment. It made sense then.",
  },
  {
    title: "Choose from here",
    body:
      "The work is not fixing damage. It is finding the place that is actually yours.",
  },
];

type Pt = { x: number; y: number };

// Smooth cubic curves with vertical-tangent control points keep the trace
// feeling deliberate rather than like a zigzag.
function buildPath(points: Pt[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    const dy = cur.y - prev.y;
    const c1 = { x: prev.x, y: prev.y + dy * 0.55 };
    const c2 = { x: cur.x, y: cur.y - dy * 0.45 };
    d +=
      ` C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)},` +
      ` ${c2.x.toFixed(1)} ${c2.y.toFixed(1)},` +
      ` ${cur.x.toFixed(1)} ${cur.y.toFixed(1)}`;
  }
  return d;
}

function FocusMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="0.55" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="0.55" opacity="0.7" />
      <path d="M12 2.8V6M12 18v3.2M2.8 12H6M18 12h3.2" stroke="currentColor" strokeWidth="0.65" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.15" fill="currentColor" />
    </svg>
  );
}

export default function CoachingLensMovement() {
  const reduceMotion = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  // The trace starts at the full stop of "Broken." — so we measure that
  // single glyph as our entry anchor.
  const periodRef = useRef<HTMLSpanElement>(null);
  const firstDotRef = useRef<HTMLSpanElement>(null);
  const secondDotRef = useRef<HTMLSpanElement>(null);
  const thirdDotRef = useRef<HTMLSpanElement>(null);
  const hereRef = useRef<HTMLSpanElement>(null);

  const [pathD, setPathD] = useState("");
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const measure = () => {
      const section = sectionRef.current;
      if (!section) return;
      const sb = section.getBoundingClientRect();

      const centerOf = (el: HTMLElement | null): Pt | null => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - sb.left,
          y: r.top + r.height / 2 - sb.top,
        };
      };

      // Anchor at the bottom-centre of the full stop, plus a small drop so
      // the curve visibly emerges from beneath the period rather than
      // overlapping the glyph.
      const pEl = periodRef.current;
      if (!pEl) return;
      const pr = pEl.getBoundingClientRect();
      const start: Pt = {
        x: pr.left + pr.width / 2 - sb.left,
        y: pr.bottom - sb.top + 6,
      };

      const wps = [firstDotRef, secondDotRef, thirdDotRef]
        .map((ref) => centerOf(ref.current))
        .filter((p): p is Pt => p !== null);
      const here = centerOf(hereRef.current);
      if (wps.length !== 3 || !here) return;

      setPathD(buildPath([start, ...wps, here]));
      setDims({ w: sb.width, h: sb.height });
    };

    measure();
    const t1 = window.setTimeout(measure, 120);
    const t2 = window.setTimeout(measure, 600);
    const ro = new ResizeObserver(measure);
    if (sectionRef.current) ro.observe(sectionRef.current);
    window.addEventListener("resize", measure);
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 80%", "end 30%"],
  });
  const revealPct = useTransform(scrollYProgress, [0.08, 0.92], [0, 100]);
  const revealMask = useMotionTemplate`linear-gradient(to bottom, #000 0%, #000 ${revealPct}%, transparent ${revealPct}%, transparent 100%)`;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-cream px-5 py-24 md:px-8 md:py-28"
      aria-label="You are not broken"
    >
      {/* Faint focus field */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #2A2722 0.6px, transparent 0)",
          backgroundSize: "36px 36px",
        }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-charcoal/10" aria-hidden="true" />
      <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-px bg-charcoal/10" aria-hidden="true" />

      {/* TRACE — drawn from DOM-measured anchor points */}
      {dims.w > 0 && (
        <motion.svg
          width={dims.w}
          height={dims.h}
          viewBox={`0 0 ${dims.w} ${dims.h}`}
          className="pointer-events-none absolute inset-0 z-0"
          fill="none"
          aria-hidden="true"
          style={{
            maskImage: reduceMotion ? "none" : revealMask,
            WebkitMaskImage: reduceMotion ? "none" : revealMask,
          }}
        >
          {/* Faint focus contours */}
          <g stroke="#3D5948" opacity="0.1" fill="none">
            {[0.42, 0.6, 0.78].map((frac) => {
              const y = dims.h * frac;
              return (
                <path
                  key={frac}
                  d={`M -20 ${y} C ${dims.w * 0.25} ${y - 10} ${dims.w * 0.55} ${y + 4} ${dims.w * 0.85} ${y - 4} S ${dims.w + 20} ${y + 2} ${dims.w + 40} ${y}`}
                  strokeWidth="0.6"
                />
              );
            })}
          </g>

          {/* The trace — short, soft line dashes */}
          <path
            d={pathD}
            stroke="#3D5948"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeDasharray="14 16"
            opacity="0.08"
          />
        </motion.svg>
      )}

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* FRAME HEADER */}
        <header className="flex items-end justify-between gap-6 border-b border-charcoal/10 pb-5">
          <OnceMotion.div
            seenId="coaching-lens-header-left"
            initial={{ opacity: 0, x: reduceMotion ? 0 : -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-80px" }}
            className="flex items-baseline gap-3 md:gap-4"
          >
            <span className="font-body text-[0.6rem] uppercase tracking-[0.3em] text-charcoal-muted md:text-[0.62rem]">
              The Lens
            </span>
          </OnceMotion.div>
          <OnceMotion.div
            seenId="coaching-lens-header-right"
            initial={{ opacity: 0, x: reduceMotion ? 0 : 8 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-80px" }}
            className="flex items-center gap-4 md:gap-5"
          >
            <FocusMark className="h-5 w-5 text-green/70" />
          </OnceMotion.div>
        </header>

        {/* HERO TYPOGRAPHY — centred */}
        <div className="mt-16 md:mt-20">
          <h2 className="text-center font-heading text-charcoal">
            <OnceMotion.span
              seenId="coaching-lens-title-you-are"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 20, filter: reduceMotion ? "blur(0px)" : "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-100px" }}
              className="block text-[clamp(2.75rem,10vw,6.5rem)] leading-[0.96] tracking-[-0.02em]"
            >
              You Are
            </OnceMotion.span>

            {/* "Not" — italic green, with an animated underline that
                draws in once the word is in view. */}
            <span className="block text-green">
              <OnceMotion.span
                seenId="coaching-lens-title-not"
                initial={{ opacity: 0, filter: reduceMotion ? "blur(0px)" : "blur(10px)" }}
                whileInView={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 1.1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: "-100px" }}
                className="relative inline-block text-[clamp(2.75rem,10vw,6.5rem)] italic leading-[0.96] tracking-[-0.02em]"
              >
                <span className="relative inline-block px-1 md:px-2">
                  Not
                  <OnceMotion.span
                    seenId="coaching-lens-title-strike"
                    initial={{ scaleX: reduceMotion ? 1 : 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{
                      duration: reduceMotion ? 0 : 1.8,
                      delay: 0.85,
                      ease: [0.65, 0, 0.35, 1],
                    }}
                    viewport={{ once: true, margin: "-100px" }}
                    style={{ originX: 0 }}
                    className="absolute left-[-6%] bottom-[0.01em] block h-[3px] w-[112%] origin-left rounded-full bg-green md:h-[5px]"
                    aria-hidden="true"
                  />
                </span>
              </OnceMotion.span>
            </span>

            <OnceMotion.span
              seenId="coaching-lens-title-broken"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 20, filter: reduceMotion ? "blur(0px)" : "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-100px" }}
              className="block text-[clamp(2.75rem,10vw,6.5rem)] leading-[0.96] tracking-[-0.02em]"
            >
              Broken<span ref={periodRef}>.</span>
            </OnceMotion.span>
          </h2>

          <OnceMotion.figure
            seenId="coaching-lens-quote"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-80px" }}
            className="mx-auto mt-12 max-w-[26rem] text-center md:mt-14"
          >
            <span className="mx-auto mb-4 block h-px w-10 bg-green/45" aria-hidden="true" />
            <blockquote className="font-heading text-lg italic leading-[1.4] text-charcoal-mid md:text-xl">
              The map was not wrong. It was just old.
            </blockquote>
          </OnceMotion.figure>
        </div>

        {/* REFLECTIVE BODY — single cohesive reading column */}
        <div className="mx-auto mt-24 max-w-[40rem] md:mt-28">
          <OnceMotion.div
            seenId="coaching-lens-field-note"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-80px" }}
            className="mb-6 flex items-center justify-center gap-3"
          >
            <span className="block h-px w-6 bg-green/45" aria-hidden="true" />
            <span className="font-body text-[0.6rem] uppercase tracking-[0.3em] text-green">
              Field Note — On the Lens
            </span>
            <span className="block h-px w-6 bg-green/45" aria-hidden="true" />
          </OnceMotion.div>

          <OnceMotion.p
            seenId="coaching-lens-body-1"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center font-body text-base leading-[1.8] text-charcoal-mid md:text-lg"
          >
            <span className="text-charcoal">You are just looking</span> at
            everything through a lens you did not choose. The way you see
            yourself. The way you see other people. The way you decide what is
            acceptable, what is expected, what is possible for someone like you.
          </OnceMotion.p>
          <OnceMotion.p
            seenId="coaching-lens-body-2"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className="mt-6 text-center font-body text-base leading-[1.8] text-charcoal-mid md:text-lg"
          >
            That lens was built a long time ago out of the need to fit in, be
            liked, avoid judgment, keep people close. It made sense then. It is
            just that you have been looking through it for so long that it
            stopped feeling like a lens and started feeling like reality.
          </OnceMotion.p>
        </div>

        {/* SHIFTS — text stays centred, markers alternate sides on
            BOTH mobile and desktop so the trace moves left-right. */}
        <div className="relative mx-auto mt-24 max-w-[40rem] space-y-16 md:mt-28 md:space-y-20">
          {STEPS.map((step, i) => {
            const dotOnLeft = i !== 1;
            const dotRef = i === 0 ? firstDotRef : i === 1 ? secondDotRef : thirdDotRef;
            return (
              <article key={step.title} className="relative">
                {/* Marker — never transformed. On mobile, alternates via
                    flex self-alignment; on desktop, floats outside the
                    reading column on alternating sides. */}
                <div className="flex flex-col">
                  <span
                    ref={dotRef}
                    className={`
                      relative mb-5 block h-3 w-3 md:absolute md:top-[0.55rem] md:mb-0
                      ${dotOnLeft ? "self-start" : "self-end"}
                      ${dotOnLeft
                        ? "md:left-[-3rem] lg:left-[-5rem]"
                        : "md:right-[-3rem] md:left-auto lg:right-[-5rem]"
                      }
                    `}
                    aria-hidden="true"
                  >
                    <span className="absolute -inset-[7px] rounded-full border border-green/30" />
                    <span className="absolute inset-0 rounded-full bg-green" />
                  </span>

                  <OnceMotion.div
                    seenId={`coaching-lens-step-${i}`}
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: reduceMotion ? 0 : 1,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    viewport={{ once: true, margin: "-120px" }}
                    className="flex flex-col gap-2 md:gap-3"
                  >
                    <h3 className="font-heading text-[1.75rem] leading-[1.15] text-charcoal md:text-[2rem] lg:text-[2.25rem]">
                      {step.title}
                    </h3>

                    <p className="font-body text-base leading-[1.7] text-charcoal-mid md:text-[1.0625rem]">
                      {step.body}
                    </p>
                  </OnceMotion.div>
                </div>
              </article>
            );
          })}
        </div>

        {/* CLOSING — focus point + reflection */}
        <div className="mt-24 text-center md:mt-28">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
            {!reduceMotion && (
              <OnceMotion.span
                seenId="coaching-lens-focus-pulse"
                className="absolute inset-0 rounded-full border border-green/40"
                initial={{ scale: 1, opacity: 0.45 }}
                whileInView={{ scale: [1, 2.1, 1], opacity: [0.45, 0, 0.45] }}
                seenAnimate={{ scale: 1, opacity: 0 }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }}
                seenTransition={{ duration: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                aria-hidden="true"
              />
            )}
            <OnceMotion.span
              seenId="coaching-lens-focus-ring"
              initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-100px" }}
              className="absolute inset-[18%] rounded-full border border-green/40"
              aria-hidden="true"
            />
            <span
              ref={hereRef}
              className="relative h-3 w-3 rounded-full bg-green"
              aria-hidden="true"
            />
          </div>

          <OnceMotion.div
            seenId="coaching-lens-here-label"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1.1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className="mt-4 flex items-center justify-center gap-3"
          >
            <span className="block h-px w-8 bg-green/45" aria-hidden="true" />
            <span className="font-body text-[0.62rem] uppercase tracking-[0.32em] text-green">
              Here
            </span>
            <span className="block h-px w-8 bg-green/45" aria-hidden="true" />
          </OnceMotion.div>

          <OnceMotion.p
            seenId="coaching-lens-closing"
            initial={{ opacity: 0, filter: reduceMotion ? "blur(0px)" : "blur(8px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className="mx-auto mt-10 max-w-2xl font-heading text-2xl italic leading-[1.4] text-charcoal md:text-[1.75rem] lg:text-[2rem]"
          >
            The exhaustion is not coming from your circumstances.{" "}
            <span className="text-green">
              It is coming from seeing the world in a way that was never really
              yours.
            </span>
          </OnceMotion.p>
        </div>
      </div>
    </section>
  );
}
