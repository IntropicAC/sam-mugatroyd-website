'use client';

import { useRef, useState, useLayoutEffect, useEffect, useCallback, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';

// ── Timing ──────────────────────────────────────────────────────────────────
const STEM_DUR   = 0.9;  // vertical stem draws over this many seconds
const BRANCH_DUR = 0.62; // each horizontal branch draws over this many seconds
const WORD_FADE  = 0.28; // each word's opacity transition duration
const SVG_HOLD   = 0.55; // seconds to hold SVG visible after last word appears
const SVG_FADE   = 0.75; // SVG fade-out duration

// ── Types ────────────────────────────────────────────────────────────────────
interface LineMeta {
  y: number;       // vertical mid-point of the line (px, relative to container)
  minX: number;    // left edge of first word on this line
  maxX: number;    // right edge of last word on this line
  stemFrac: number; // 0–1: fraction down the vertical stem where this line sits
}

interface WordReveal {
  idx: number;
  at: number; // seconds from animation start when this word should appear
}

// ── Layout helpers ───────────────────────────────────────────────────────────

function buildRevealData(
  spans: HTMLSpanElement[],
  cr: DOMRect,
): { lines: LineMeta[]; reveals: WordReveal[] } {
  if (!spans.length) return { lines: [], reveals: [] };

  // Group spans into lines by their top-y position (quantised to ±6 px)
  const lineMap = new Map<number, HTMLSpanElement[]>();
  spans.forEach(span => {
    const r   = span.getBoundingClientRect();
    const ry  = Math.round(r.top - cr.top);
    let key   = ry;
    for (const k of lineMap.keys()) {
      if (Math.abs(k - ry) <= 6) { key = k; break; }
    }
    if (!lineMap.has(key)) lineMap.set(key, []);
    lineMap.get(key)!.push(span);
  });

  const sorted = Array.from(lineMap.entries()).sort(([a], [b]) => a - b);
  const firstTopY = sorted[0][0];
  const lastTopY  = sorted[sorted.length - 1][0];
  const rangeH    = lastTopY - firstTopY || 1;

  const lines: LineMeta[] = sorted.map(([topY, ss]) => {
    const rects  = ss.map(s => s.getBoundingClientRect());
    const lineH  = rects[0].height;
    const xs     = rects.flatMap(r => [r.left - cr.left, r.right - cr.left]);
    return {
      y:        topY - cr.top + lineH * 0.5,
      minX:     Math.min(...xs),
      maxX:     Math.max(...xs),
      stemFrac: (topY - firstTopY) / rangeH,
    };
  });

  const reveals: WordReveal[] = [];
  sorted.forEach(([, ss], li) => {
    const line        = lines[li];
    const branchStart = STEM_DUR * line.stemFrac;
    const lineWidth   = line.maxX - line.minX || 1;
    ss.forEach(span => {
      const r  = span.getBoundingClientRect();
      const cx = (r.left + r.right) / 2 - cr.left;
      const f  = Math.max(0, Math.min(1, (cx - line.minX) / lineWidth));
      reveals.push({
        idx: parseInt(span.dataset.wi ?? '0', 10),
        at:  branchStart + BRANCH_DUR * f,
      });
    });
  });

  return { lines, reveals };
}

// ── SVG path builders ────────────────────────────────────────────────────────

function makeStemPath(lines: LineMeta[]): string {
  if (lines.length <= 1) return '';
  const x  = lines[0].minX;
  const y0 = lines[0].y - 6;
  const yn = lines[lines.length - 1].y + 6;
  const m  = (y0 + yn) / 2;
  // Gentle S-curve for organic feel
  return `M ${x} ${y0} C ${x - 2} ${m * 0.42} ${x + 1.5} ${m * 0.88} ${x} ${m} C ${x - 1.5} ${m * 1.12} ${x + 2} ${yn * 0.93} ${x} ${yn}`;
}

function makeBranchPath(line: LineMeta, li: number): string {
  const { y, minX, maxX } = line;
  const len  = maxX - minX;
  // Alternating slight bow for organic variety
  const bow  = li % 2 === 0 ? 1.6 : -1.3;
  const cp1x = minX + len * 0.3;
  const cp2x = minX + len * 0.68;
  return `M ${minX} ${y} C ${cp1x} ${y + bow} ${cp2x} ${y - bow * 0.65} ${maxX} ${y}`;
}

// ── Animated SVG path ────────────────────────────────────────────────────────

function DrawPath({
  d,
  started,
  delay,
  duration,
  strokeOpacity,
}: {
  d: string;
  started: boolean;
  delay: number;
  duration: number;
  strokeOpacity: number;
}) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke="rgb(61,89,72)"
      strokeWidth={0.65}
      strokeLinecap="round"
      strokeOpacity={strokeOpacity}
      initial={{ pathLength: 0 }}
      animate={started ? { pathLength: 1 } : { pathLength: 0 }}
      transition={{ duration, delay, ease: [0.22, 0, 0.58, 1] }}
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type SvgPhase = 'hidden' | 'visible' | 'fading';

interface BranchRevealTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function BranchRevealText({
  text,
  className = '',
  delay = 0,
}: BranchRevealTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animStarted  = useRef(false); // prevents re-measuring after animation begins

  const [layoutData, setLayoutData] = useState<{
    lines:   LineMeta[];
    reveals: WordReveal[];
    h:       number;
  }>({ lines: [], reveals: [], h: 0 });

  const [started,  setStarted]  = useState(false);
  const [svgPhase, setSvgPhase] = useState<SvgPhase>('hidden');

  const inView = useInView(containerRef, { once: true, margin: '-80px' });

  const words = useMemo(() => text.split(' '), [text]);

  // ── Measure word positions ─────────────────────────────────────────────────
  const measure = useCallback(() => {
    if (animStarted.current) return;
    const el = containerRef.current;
    if (!el) return;
    const cr    = el.getBoundingClientRect();
    const spans = Array.from(el.querySelectorAll<HTMLSpanElement>('[data-wi]'));
    const data  = buildRevealData(spans, cr);
    setLayoutData({ ...data, h: cr.height });
  }, []);

  useLayoutEffect(() => {
    measure();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, text]);

  // ── Scroll trigger ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!inView || animStarted.current) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const startAnim = () => {
      animStarted.current = true;
      setStarted(true);

      if (reduced) return; // no SVG for reduced-motion users

      setSvgPhase('visible');

      const maxAt =
        layoutData.reveals.length
          ? Math.max(...layoutData.reveals.map(r => r.at))
          : STEM_DUR + BRANCH_DUR;

      const fadeDelay = (maxAt + WORD_FADE + SVG_HOLD) * 1000;
      const tid = setTimeout(() => setSvgPhase('fading'), fadeDelay);
      return () => clearTimeout(tid);
    };

    if (delay > 0) {
      const tid = setTimeout(startAnim, delay * 1000);
      return () => clearTimeout(tid);
    }
    return startAnim() ?? undefined;
  }, [inView, delay, layoutData.reveals]);

  // ── Per-word reveal times lookup ───────────────────────────────────────────
  const revealTimes = useMemo(() => {
    const arr = new Array<number>(words.length).fill(0);
    layoutData.reveals.forEach(r => { arr[r.idx] = r.at; });
    return arr;
  }, [words.length, layoutData.reveals]);

  const { lines, h } = layoutData;
  const stemPath      = makeStemPath(lines);
  const reduced       =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* ── Word spans (always in layout flow, opacity-animated) ──── */}
      {words.map((word, i) => (
        <motion.span
          key={i}
          data-wi={String(i)}
          style={{ display: 'inline' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: started ? 1 : 0 }}
          transition={{
            duration: reduced ? 0 : WORD_FADE,
            delay:    reduced ? 0 : (revealTimes[i] ?? 0),
            ease:     'easeOut',
          }}
        >
          {word}{i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}

      {/* ── SVG branch overlay (decorative, ignored by screen readers) ── */}
      {lines.length > 0 && !reduced && (
        <motion.svg
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none overflow-visible"
          style={{ width: '100%', height: h || '100%' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: svgPhase === 'visible' ? 1 : 0 }}
          transition={{
            duration: svgPhase === 'fading' ? SVG_FADE : 0,
            ease: 'easeOut',
          }}
        >
          {/* Seed dot at the start of the first line */}
          <motion.circle
            cx={lines[0].minX}
            cy={lines[0].y}
            r={1.8}
            fill="rgb(61,89,72)"
            fillOpacity={0.28}
            initial={{ scale: 0 }}
            animate={started ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          />

          {/* Vertical stem connecting all lines */}
          {stemPath && (
            <DrawPath
              d={stemPath}
              started={started}
              delay={0}
              duration={STEM_DUR}
              strokeOpacity={0.2}
            />
          )}

          {/* Horizontal branch per line */}
          {lines.map((line, li) => (
            <DrawPath
              key={li}
              d={makeBranchPath(line, li)}
              started={started}
              delay={STEM_DUR * line.stemFrac}
              duration={BRANCH_DUR}
              strokeOpacity={Math.max(0.09, 0.17 - li * 0.008)}
            />
          ))}
        </motion.svg>
      )}
    </div>
  );
}
