'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { FIGURE_ASPECT, LOGO_ART, MASCOTS, mascotSrc, type Mascot } from "@/lib/lens-check/mascots";
import type { LogoWash } from "./logo-wash";

export interface LensName {
  id: string;
  title: string;
}

// Warm and cool characters take turns, so each change reads as one.
const ORDER = [
  "navigator",
  "reluctant_hero",
  "alchemist",
  "sleeping_giant",
  "lighthouse",
  "method_actor",
  "wandering_scholar",
  "hesitant_believer",
  "observer",
  "heir",
  "waymaker",
  "undercurrent",
  "storm_watcher",
  "loyal_guard",
];
// How faint the background logo is, and how brightly the gold edge burns as
// a colour climbs it.
const LOGO_ALPHA = 0.11;
const EDGE_ALPHA = 0.7;
// The first wash waits for the headline to arrive.
const FIRST_MS = 1400;
// Into each wash, the next character comes into focus as the gold edge
// passes behind it; the last one has gone by LEAVE_MS (lc-hero-unfocus).
const SWAP_MS = 1100;
const LEAVE_MS = 700;
const HOLD_MS = 4600;

type Cast = { current: number; leaving: number | null };

function Figure({ mascot, title, state, eager }: { mascot: Mascot; title: string; state: "in" | "out"; eager: boolean }) {
  const tallness = (100 * mascot.h) / mascot.w;
  // As tall as the stage, unless that would make a broad character wider than
  // the shared figure frame (the same rule as the result page) or the stage.
  const height = `min(100cqh, ${tallness.toFixed(2)}cqw, ${(tallness * FIGURE_ASPECT).toFixed(2)}cqh)`;
  return (
    <div className="lc-hero-layer" data-state={state}>
      <div
        className="lc-hero-figure"
        style={{ aspectRatio: `${mascot.w} / ${mascot.h}`, height: `calc(${height} * ${mascot.size ?? 1})` }}
      >
        {/* Trim the transparent space below the paint so the caption follows the artwork in normal flow. */}
        <div className="lc-hero-image" style={{ height: `${(mascot.bottom / mascot.h) * 100}%` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mascotSrc(mascot)} width={mascot.w} height={mascot.h} alt="" fetchPriority={eager ? "high" : undefined} />
        </div>
        <p className="lc-hero-name">
          <span>{title}</span>
        </p>
        <span
          className="lc-art-glow"
          style={{ left: `${(mascot.anchor[0] / mascot.w) * 100}%`, top: `${(mascot.anchor[1] / mascot.h) * 100}%`, width: "60%" }}
        />
      </div>
    </div>
  );
}

// The homepage hero's art. Sam's logo sits faintly behind the hero and washes
// into each lens's colour in turn, behind a burning gold edge; in front, that
// lens's character comes into focus with its name. It pauses while scrolled
// away, and with reduced motion the first character simply stays.
export default function LensCycle({ lenses }: { lenses: LensName[] }) {
  const ordered = useMemo(() => {
    const known = lenses.filter((lens) => MASCOTS[lens.id]);
    const rank = (id: string) => (ORDER.includes(id) ? ORDER.indexOf(id) : ORDER.length);
    return [...known].sort((a, b) => rank(a.id) - rank(b.id));
  }, [lenses]);
  const logoRef = useRef<HTMLDivElement>(null);
  const castRef = useRef<HTMLDivElement>(null);
  const [cast, setCast] = useState<Cast>({ current: 0, leaving: null });

  useEffect(() => {
    const logo = logoRef.current;
    const castEl = castRef.current;
    if (!logo || !castEl || ordered.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let alive = true;
    let timer = 0;
    let leaveTimer = 0;
    let inView = false;
    let pending: (() => void) | null = null;
    let wash: LogoWash | null = null;
    let index = 0;

    import("./logo-wash")
      .then(({ createLogoWash }) => createLogoWash(logo, LOGO_ART.src, { alpha: LOGO_ALPHA, edge: EDGE_ALPHA }))
      .then((created) => {
        if (!alive) return created?.destroy();
        wash = created;
        // The canvas now draws the logo; set in the same task so the two never show together.
        if (created) logo.dataset.ready = "";
      })
      .catch(() => {});

    // Steps wait while the hero is scrolled away or the tab is hidden.
    const whenShown = (step: () => void) => {
      if (inView && !document.hidden) step();
      else pending = step;
    };
    const resume = () => {
      if (!pending || !inView || document.hidden) return;
      const step = pending;
      pending = null;
      step();
    };
    const after = (ms: number, step: () => void) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => whenShown(step), ms);
    };
    const colourOf = (i: number) => MASCOTS[ordered[i].id].hex;
    const preload = (i: number) => {
      new window.Image().src = mascotSrc(MASCOTS[ordered[i % ordered.length].id]);
    };

    const next = () => {
      index = (index + 1) % ordered.length;
      const shown = index;
      void wash?.washTo(colourOf(shown));
      timer = window.setTimeout(() => {
        setCast(({ current }) => ({ current: shown, leaving: current }));
        leaveTimer = window.setTimeout(() => setCast((c) => ({ ...c, leaving: null })), LEAVE_MS);
        preload(shown + 1);
        after(HOLD_MS, next);
      }, SWAP_MS);
    };
    // The first wash brings the logo into the first character's colour.
    after(FIRST_MS, () => {
      void wash?.washTo(colourOf(0));
      preload(1);
      after(HOLD_MS, next);
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        resume();
      },
      { threshold: 0.3 },
    );
    observer.observe(castEl);
    document.addEventListener("visibilitychange", resume);

    return () => {
      alive = false;
      window.clearTimeout(timer);
      window.clearTimeout(leaveTimer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", resume);
      wash?.destroy();
      delete logo.dataset.ready;
    };
  }, [ordered]);

  if (ordered.length === 0) return null;
  const layers = [
    ...(cast.leaving !== null ? [{ index: cast.leaving, state: "out" as const }] : []),
    { index: cast.current, state: "in" as const },
  ];

  return (
    <>
      <div className="lc lc-hero-backdrop" aria-hidden="true">
        <div ref={logoRef} className="lc-hero-logo">
          {/* Plain img: the wash draws this same file. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_ART.src} alt="" style={{ opacity: LOGO_ALPHA }} />
        </div>
      </div>
      <div ref={castRef} className="lc lc-hero-cast" aria-hidden="true">
        <div className="lc-hero-stage">
          {layers.map(({ index, state }) => (
            <Figure key={ordered[index].id} mascot={MASCOTS[ordered[index].id]} title={ordered[index].title} state={state} eager={index === 0} />
          ))}
        </div>
      </div>
    </>
  );
}
