'use client';

import { createContext, Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  glowPlacement,
  LOGO_ART,
  LOGO_RECT,
  mascotRects,
  mascotsFor,
  mascotSrc,
  paintedBottom,
  STAGE,
  stagePlacement,
} from "@/lib/lens-check/mascots";

// The images here are plain <img> on purpose: the animation draws the same
// files, so one download serves both (next/image would fetch resized copies).

const RevealContext = createContext<() => void>(() => {});

// Holds the title and the rest of the reading back until the character has
// formed. instant: nothing to animate, so show everything straight away.
export function RevealSequence({ instant, children }: { instant: boolean; children: ReactNode }) {
  const [revealed, setRevealed] = useState(instant);
  const markRevealed = useCallback(() => setRevealed(true), []);
  return (
    <RevealContext.Provider value={markRevealed}>
      <div className="lc-sequence" data-revealed={revealed ? "" : undefined}>
        {children}
      </div>
    </RevealContext.Provider>
  );
}

// Sam's logo, standing where the reveal starts. Shown while the result loads.
export function StageLogo() {
  return (
    <div className="lc-art" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="lc-art-logo" src={LOGO_ART.src} alt="" style={stagePlacement(LOGO_RECT)} />
    </div>
  );
}

type Phase = "logo" | "running" | "settled";

// The logo turns into the result's character (or characters, for a mixed
// result). The static images are server-rendered underneath, so the page
// looks right before the animation code loads, with reduced motion, and if
// WebGL isn't available.
export function RevealStage({ ids }: { ids: string[] }) {
  const idKey = ids.join(",");
  const mascots = useMemo(() => mascotsFor(idKey ? idKey.split(",") : []).slice(0, 3), [idKey]);
  const rects = useMemo(() => mascotRects(mascots), [mascots]);
  const stageRef = useRef<HTMLDivElement>(null);
  const markRevealed = useContext(RevealContext);
  const [phase, setPhase] = useState<Phase>("logo");
  // Which characters' props are lit.
  const [lit, setLit] = useState<number[]>([]);
  // The empty band under the paint, as a share of the stage height, less a
  // small gap: the title is pulled up by this much to sit just below.
  const trim = Math.max(0, (STAGE.h - paintedBottom(mascots, rects)) / STAGE.h - 0.02);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || mascots.length === 0) return;
    // With reduced motion the CSS shows the characters and reading at once.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let alive = true;
    let started = false;
    let cancel: (() => void) | null = null;
    // A gentle crossfade instead, when the animation can't run.
    const settle = () => {
      if (!alive) return;
      setLit(mascots.map((_, i) => i));
      setPhase("settled");
      markRevealed();
    };
    // Don't hold the result back on a slow connection.
    const slow = window.setTimeout(() => {
      if (started) return;
      cancel?.();
      settle();
    }, 4000);

    import("./reveal-engine")
      .then(({ runReveal }) => {
        if (!alive) return;
        cancel = runReveal({
          container: stage,
          logo: { src: LOGO_ART.src, rect: LOGO_RECT },
          hex: mascots[0].hex,
          targets: mascots.map((mascot, i) => ({ src: mascotSrc(mascot), rect: rects[i], anchorV: mascot.anchor[1] / mascot.h })),
          onStart: () => {
            started = true;
            if (alive) setPhase("running");
          },
          onGlow: (index) => alive && setLit((current) => (current.includes(index) ? current : [...current, index])),
          onDone: () => alive && markRevealed(),
          onEnd: () => alive && setPhase("settled"),
        });
        if (!cancel) settle();
      })
      .catch(settle);

    return () => {
      alive = false;
      window.clearTimeout(slow);
      cancel?.();
    };
  }, [mascots, rects, markRevealed]);

  return (
    <div
      ref={stageRef}
      className="lc-art"
      data-art={mascots.length > 0 ? "characters" : "logo"}
      data-phase={phase}
      style={{ ["--lc-art-trim" as string]: trim.toFixed(3) }}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="lc-art-logo" src={LOGO_ART.src} alt="" style={stagePlacement(LOGO_RECT)} />
      {mascots.length > 0 && (
        <div className="lc-art-float">
          {mascots.map((mascot, i) => (
            <Fragment key={mascot.slug}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="lc-art-mascot" src={mascotSrc(mascot)} alt="" fetchPriority="high" style={stagePlacement(rects[i])} />
              <span className="lc-art-glow" data-lit={lit.includes(i) ? "" : undefined} style={glowPlacement(mascot, rects[i])} />
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
