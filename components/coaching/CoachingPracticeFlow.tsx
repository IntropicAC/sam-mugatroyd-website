'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import FadeInView from "@/components/ui/FadeInView";
import {
  hasSeenAnimationForPath,
  useElementIntroAnimation,
} from "@/components/layout/PageAnimationProvider";

const steps = [
  {
    number: "01",
    label: "Notice",
    title:
      "The first shift is not fixing yourself. It is noticing the system you have been living from.",
    body: "The patterns stop feeling random once you can see what they were built to protect.",
    items: [
      "You say yes when you mean no.",
      "You read the room before you know what you want.",
      "You become a slightly different person depending on who is in front of you.",
    ],
    dark: false,
  },
  {
    number: "02",
    label: "Reframe",
    title: "What changes is the place you are choosing from.",
    body: "The work moves you from performing for approval to making choices that actually fit.",
    items: [
      "Saying what is true without turning it into a performance.",
      "Making decisions from what actually fits.",
      "No longer needing to act like someone else.",
    ],
    dark: false,
  },
  {
    number: "03",
    label: "What this is not",
    title: "This is not motivation dressed up as transformation.",
    body: "The work is understanding. Once you see why the mask was built, you stop needing to fight it.",
    items: [
      "No morning routine to force into your life.",
      "No affirmations that feel good for a week and then disappear.",
      "No pretending the same patterns have changed because they have a better name.",
    ],
    dark: true,
  },
  {
    number: "04",
    label: "Who it is for",
    title: "You do not have to be falling apart to want something more honest.",
    body: "This is for capable people who are ready for something more honest than performing.",
    items: [
      "You are capable, reliable and functioning, but something underneath feels off.",
      "You are tired of being liked for a version of yourself you keep having to maintain.",
      "You do not need to be in crisis. You just need to be ready to look honestly.",
    ],
    dark: false,
  },
];

interface StepData {
  number: string;
  label: string;
  title: string;
  body: string;
  items: string[];
  dark: boolean;
}

// Tuned for an editorial, unhurried feel — not neon, not techy.
const BORDER_RADIUS = 6;
const BORDER_DURATION = 2.8;
const CONNECTOR_DURATION = 1.1;
const BORDER_STROKE_WIDTH = 2;
const CONNECTOR_STROKE_WIDTH = 2;
const BORDER_EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];
const LIGHT_STROKE = "rgba(42,39,34,0.38)";
const DARK_STROKE = "rgba(250,248,245,0.78)";
const CONNECTOR_COLOR = "#B6AC9D";

/* ──────────────────────────────────────────────────────────────────────────
 * AnimatedBorderCard
 *
 * Reusable wrapper that draws its own border with two SVG paths starting
 * from the top-centre. The left path runs anti-clockwise to bottom-centre;
 * the right path runs clockwise to bottom-centre. Both use pathLength 0→1
 * so they appear to splash outward from the top of the card and meet at
 * the bottom.
 *
 * The card measures its own size (ResizeObserver) so the corner arcs stay
 * visually round at any width/height. Card content is rendered above the
 * SVG via z-index — drop your existing markup in as children.
 * ────────────────────────────────────────────────────────────────────── */
function AnimatedBorderCard({
  active,
  dark,
  onBorderComplete,
  reduceMotion,
  children,
}: {
  active: boolean;
  dark: boolean;
  onBorderComplete?: () => void;
  reduceMotion: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const stroke = dark ? DARK_STROKE : LIGHT_STROKE;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w: W, h: H } = size;
  const R = Math.max(0, Math.min(BORDER_RADIUS, W / 2, H / 2));
  const midX = W / 2;

  // Right half: top-centre → top-right corner (arc) → bottom-right corner (arc) → bottom-centre
  const rightPath =
    W > 0 && H > 0
      ? `M ${midX} 0 L ${W - R} 0 A ${R} ${R} 0 0 1 ${W} ${R} L ${W} ${H - R} A ${R} ${R} 0 0 1 ${W - R} ${H} L ${midX} ${H}`
      : "";
  // Left half: top-centre → top-left corner (arc) → bottom-left corner (arc) → bottom-centre
  const leftPath =
    W > 0 && H > 0
      ? `M ${midX} 0 L ${R} 0 A ${R} ${R} 0 0 0 0 ${R} L 0 ${H - R} A ${R} ${R} 0 0 0 ${R} ${H} L ${midX} ${H}`
      : "";

  const target = reduceMotion ? 1 : active ? 1 : 0;

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-md ${
        dark ? "bg-charcoal" : "bg-cream-deep/40"
      }`}
    >
      {W > 0 && H > 0 && (
        <svg
          className="pointer-events-none absolute inset-0"
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          aria-hidden="true"
        >
          <motion.path
            d={rightPath}
            fill="none"
            stroke={stroke}
            strokeWidth={BORDER_STROKE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: reduceMotion ? 1 : 0 }}
            animate={{ pathLength: target }}
            transition={{ duration: BORDER_DURATION, ease: BORDER_EASE }}
          />
          <motion.path
            d={leftPath}
            fill="none"
            stroke={stroke}
            strokeWidth={BORDER_STROKE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: reduceMotion ? 1 : 0 }}
            animate={{ pathLength: target }}
            transition={{ duration: BORDER_DURATION, ease: BORDER_EASE }}
            onAnimationComplete={() => {
              if (active || reduceMotion) onBorderComplete?.();
            }}
          />
        </svg>
      )}

      {/* Card content sits above the SVG border layer */}
      <div className="relative z-10 px-6 py-10 md:px-10 md:py-12">{children}</div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Connector
 *
 * Thin vertical SVG line linking the previous card's bottom-centre to the
 * next card's top-centre. Uses pathLength so it draws downward.
 * ────────────────────────────────────────────────────────────────────── */
function Connector({
  active,
  onComplete,
  reduceMotion,
}: {
  active: boolean;
  onComplete?: () => void;
  reduceMotion: boolean;
}) {
  const target = reduceMotion ? 1 : active ? 1 : 0;
  return (
    <div className="relative mx-auto h-14 w-px" aria-hidden="true">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 1 56"
        preserveAspectRatio="none"
      >
        <motion.line
          x1={0.5}
          y1={0}
          x2={0.5}
          y2={56}
          stroke={CONNECTOR_COLOR}
          strokeWidth={CONNECTOR_STROKE_WIDTH}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: reduceMotion ? 1 : 0 }}
          animate={{ pathLength: target }}
          transition={{ duration: CONNECTOR_DURATION, ease: "easeInOut" }}
          onAnimationComplete={() => {
            if (active || reduceMotion) onComplete?.();
          }}
        />
      </svg>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * FlowItem
 *
 * One row in the sequence: an incoming connector (skipped for the first
 * card) followed by the animated card. The component owns its own
 * `useInView` so it can report scroll-arrival up to the wrapper, and it
 * derives both the connector-active flag and the border-active flag from
 * the chain state passed in by the parent.
 *
 * Chain rules:
 *   - First card: border draws as soon as the card enters view.
 *   - Later cards: incoming connector starts only when (this card is in
 *     view AND previous card's border has finished). Border then starts
 *     when that connector finishes.
 * ────────────────────────────────────────────────────────────────────── */
function FlowItem({
  step,
  index,
  prevBorderDone,
  onBorderDone,
  reduceMotion,
}: {
  step: StepData;
  index: number;
  prevBorderDone: boolean;
  onBorderDone: () => void;
  reduceMotion: boolean;
}) {
  const { shouldAnimate, markSeen } = useElementIntroAnimation(
    `coaching-practice-step-${step.number}`,
  );
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapperRef, {
    once: true,
    margin: "0px 0px -12% 0px",
  });
  const [connectorDone, setConnectorDone] = useState(!shouldAnimate);

  useEffect(() => {
    if (shouldAnimate && inView) {
      markSeen();
    }
  }, [inView, markSeen, shouldAnimate]);

  const isFirst = index === 0;
  const borderActive = !shouldAnimate || (isFirst ? inView : connectorDone);
  const connectorActive =
    !shouldAnimate || (!isFirst && inView && prevBorderDone);
  const showContent = !shouldAnimate || inView;

  return (
    <div ref={wrapperRef}>
      {!isFirst && (
        <Connector
          active={connectorActive}
          onComplete={() => setConnectorDone(true)}
          reduceMotion={reduceMotion || !shouldAnimate}
        />
      )}

      <AnimatedBorderCard
        dark={step.dark}
        active={borderActive}
        onBorderComplete={onBorderDone}
        reduceMotion={reduceMotion || !shouldAnimate}
      >
        {/* ───────── existing card content (unchanged copy / classes) ───────── */}
        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 12 } : false}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <p
            className={`mb-5 font-body text-[10px] uppercase tracking-[0.22em] ${
              step.dark ? "text-green-hover" : "text-green"
            }`}
          >
            {step.number} / {step.label}
          </p>
          <h3
            className={`mb-5 font-heading text-2xl leading-tight md:text-3xl ${
              step.dark ? "text-cream" : "text-charcoal"
            }`}
          >
            {step.title}
          </h3>
          <p
            className={`mb-7 font-body text-sm leading-relaxed md:text-base ${
              step.dark ? "text-cream/62" : "text-charcoal-mid"
            }`}
          >
            {step.body}
          </p>
          <div
            className={`space-y-3 border-t pt-5 ${
              step.dark ? "border-cream/12" : "border-border"
            }`}
          >
            {step.items.map((item) => (
              <p
                key={item}
                className={`font-body text-sm leading-relaxed ${
                  step.dark ? "text-cream/50" : "text-charcoal-muted"
                }`}
              >
                — {item}
              </p>
            ))}
          </div>
        </motion.div>
        {/* ───────── end existing card content ───────── */}
      </AnimatedBorderCard>
    </div>
  );
}

export default function CoachingPracticeFlow() {
  const reduceMotion = !!useReducedMotion();
  const pathname = usePathname();

  // borderDone[i] flips true once card i's border has finished drawing.
  // Passed to card i+1 as `prevBorderDone` so it knows when to start the
  // connector that leads into it.
  const [borderDone, setBorderDone] = useState<boolean[]>(() =>
    steps.map((step) =>
      hasSeenAnimationForPath(
        pathname,
        `coaching-practice-step-${step.number}`,
      ),
    ),
  );

  const markBorderDone = useCallback((i: number) => {
    setBorderDone((prev) => {
      if (prev[i]) return prev;
      const next = prev.slice();
      next[i] = true;
      return next;
    });
  }, []);

  return (
    <section
      className="relative overflow-hidden bg-cream px-5 py-18 md:px-8 md:py-28 lg:px-12"
      aria-label="How the coaching work flows"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-border" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border" aria-hidden="true" />

      <div className="mx-auto max-w-7xl">
        {/* Section header — copy + classes unchanged */}
        <div className="mb-16 md:mb-24">
          <FadeInView>
            <p className="mb-5 font-body text-xs uppercase tracking-[0.18em] text-charcoal-muted">
              The Work
            </p>
          </FadeInView>
          <FadeInView delay={0.08}>
            <h2 className="max-w-2xl font-heading text-3xl leading-tight text-charcoal md:text-5xl">
              One clear thread, not a set of disconnected techniques.
            </h2>
          </FadeInView>
          <FadeInView delay={0.16}>
            <p className="mt-6 max-w-xl font-body text-sm leading-relaxed text-charcoal-mid md:text-base">
              We follow the pattern from where it started, to how it shows up,
              to what becomes possible once you can see it clearly.
            </p>
          </FadeInView>
        </div>

        {/* Sequenced cards joined by one continuous animated line */}
        <div className="mx-auto max-w-2xl">
          {steps.map((step, i) => (
            <FlowItem
              key={step.number}
              step={step}
              index={i}
              prevBorderDone={i === 0 ? true : borderDone[i - 1]}
              onBorderDone={() => markBorderDone(i)}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
