import type { ReactNode } from "react";
import type { GlyphId } from "@/lib/lens-check/types";

// ---------- Icons ----------

const PART_GLYPHS: Record<Exclude<GlyphId, "path" | "lens">, ReactNode> = {
  speech: (
    <>
      <path d="M5 4.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8.5L6 20v-3.5H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z" />
      <path d="M7.5 9.2h9M7.5 12h6" opacity=".6" />
    </>
  ),
  fork: (
    <>
      <path d="M12 21v-6.5" />
      <path d="M12 14.5 6.5 6.5" />
      <path d="M12 14.5 17.5 6.5" />
      <circle cx="6" cy="5" r="1.3" />
      <circle cx="18" cy="5" r="1.3" />
    </>
  ),
  ridge: (
    <>
      <path d="M4 12.5 9 6.5l3 3.2 2.2-2.4 5.8 5.2" />
      <path d="M2.5 12.5h19" />
      <path d="M6 15.6h12M8.6 18.6h6.8" opacity=".55" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m14.8 9.2-1.6 4-4 1.6 1.6-4z" />
      <path d="M12 2.5v1.8M12 19.7v1.8M2.5 12h1.8M19.7 12h1.8" opacity=".55" />
    </>
  ),
  sunrise: (
    <>
      <path d="M2.5 16.5h19" />
      <path d="M7 16.5a5 5 0 0 1 10 0" />
      <path d="M12 7v2.2M6.4 9.6l1.5 1.5M17.6 9.6l-1.5 1.5" />
      <path d="M6 19.5h12" opacity=".55" />
    </>
  ),
  circles: (
    <>
      <circle cx="9" cy="12" r="5.6" />
      <circle cx="15" cy="12" r="5.6" />
      <path d="M12 7.6v8.8" opacity=".45" />
    </>
  ),
};

const UI_ICONS = {
  lens: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5.6" opacity=".7" />
      <circle cx="12" cy="12" r="2.2" />
      <path d="M12 1.8v2.4M12 19.8v2.4M1.8 12h2.4M19.8 12h2.4" opacity=".55" />
    </>
  ),
  path: (
    <>
      <path d="M7 21c0-3 4-3.5 4-6.5S6.5 11 8 8s5-2.5 6.5-5" />
      <path d="M13 21c0-2.2 3.4-3 4-5.5" opacity=".5" />
      <circle cx="15.5" cy="2.8" r="1" />
    </>
  ),
  compass: PART_GLYPHS.compass,
  arrow: <path d="M4 12h15M14 7l5 5-5 5" />,
  back: <path d="M15 5l-7 7 7 7" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  lock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" opacity=".6" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
} as const;

export type UiIconName = keyof typeof UI_ICONS;

export function Glyph({ id }: { id: GlyphId }) {
  return <>{id === "path" || id === "lens" ? UI_ICONS[id] : (PART_GLYPHS[id] ?? UI_ICONS.lens)}</>;
}

export function Icon({ name, className = "ico" }: { name: UiIconName; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      {UI_ICONS[name]}
    </svg>
  );
}

export function GlyphIcon({ id, className = "ico" }: { id: GlyphId; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <Glyph id={id} />
    </svg>
  );
}

// An icon placed inside another SVG, centred on (0, 0).
function NestedGlyph({ id, size, strokeWidth = 1.7 }: { id: GlyphId; size: number; strokeWidth?: number }) {
  const scale = size / 24;
  return (
    <g className="ico-g" transform={`translate(${-size / 2} ${-size / 2}) scale(${scale})`}>
      <g fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Glyph id={id} />
      </g>
    </g>
  );
}

// ---------- Lens shape ----------

// Currently unused: the v0.2 questionnaire has no dimensions to chart.
export interface ShapePoint {
  id: string;
  glyph: GlyphId;
  label: string;
  score: number | null;
}

export function LensShape({ points, draw = true }: { points: ShapePoint[]; draw?: boolean }) {
  const cx = 180;
  const cy = 182;
  const n = points.length;
  const placed = points.map((point, i) => {
    const angle = ((-90 + (i * 360) / n) * Math.PI) / 180;
    const r = 16 + (point.score ?? 0.5) * 92;
    return { ...point, angle, x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  });
  const perimeter = placed.reduce((sum, p, i) => {
    const next = placed[(i + 1) % placed.length];
    return sum + Math.hypot(next.x - p.x, next.y - p.y);
  }, 0);
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const a = (i / 72) * Math.PI * 2;
    const r1 = i % 6 === 0 ? 113 : 116;
    return (
      <line
        key={i}
        x1={(cx + Math.cos(a) * r1).toFixed(1)}
        y1={(cy + Math.sin(a) * r1).toFixed(1)}
        x2={(cx + Math.cos(a) * 120).toFixed(1)}
        y2={(cy + Math.sin(a) * 120).toFixed(1)}
      />
    );
  });

  return (
    <svg className={`lc-shape${draw ? " draw" : ""}`} viewBox="0 0 360 366" role="img" aria-label={`Your lens shape across ${n} directions`}>
      <g className="rings">
        <circle className="outer" cx={cx} cy={cy} r={108} />
        <circle cx={cx} cy={cy} r={80} />
        <circle cx={cx} cy={cy} r={52} />
        <circle cx={cx} cy={cy} r={24} />
      </g>
      <g className="ticks">{ticks}</g>
      {placed.map((p) => (
        <line key={`axis-${p.id}`} className="axis" x1={cx} y1={cy} x2={(cx + Math.cos(p.angle) * 108).toFixed(1)} y2={(cy + Math.sin(p.angle) * 108).toFixed(1)} />
      ))}
      <polygon
        className="poly"
        points={placed.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}
        style={{ ["--len" as string]: perimeter.toFixed(1) }}
      />
      {placed.map((p) => (
        <circle key={`v-${p.id}`} className={`vertex${p.score === null ? " unknown" : ""}`} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={p.score === null ? 4 : 3.4} />
      ))}
      {placed.map((p) => {
        const ix = cx + Math.cos(p.angle) * 142;
        const iy = cy + Math.sin(p.angle) * 142;
        const top = Math.sin(p.angle) < -0.9;
        return (
          <g key={`l-${p.id}`} transform={`translate(${ix.toFixed(1)} ${iy.toFixed(1)})`}>
            <circle className="pt-disc" r={14} />
            <g className="pt-ico">
              <NestedGlyph id={p.glyph} size={18} strokeWidth={1.6} />
            </g>
            <text className="pt-label" y={top ? -22 : 29}>
              {p.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------- Sam's logo, painted part by part ----------

// Brush paths follow each stroke of the logo artwork (turned on its side),
// in the order they are painted: three parts for the left triangle, the bar,
// then three parts for the right triangle.
const LOGO = {
  w: 340,
  h: 173,
  sides: [
    { d: "M0 87 L158 5", width: 26, node: [79, 46] },
    { d: "M151 0 L151 173", width: 24, node: [151, 81] },
    { d: "M154 167 L0 84", width: 26, node: [77, 125] },
    { d: "M178 5 L328 83", width: 26, node: [253, 44] },
    { d: "M182 0 L182 173", width: 24, node: [182, 81] },
    { d: "M176 165 L330 81", width: 26, node: [253, 123] },
  ],
  bar: { d: "M94 81 L234 81", width: 28 },
  barAfter: 3,
} as const;

function lineLength(d: string) {
  const n = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
  return Math.hypot(n[2] - n[0], n[3] - n[1]) + 2;
}

export function LogoMap({ parts, completedParts }: { parts: { glyph: GlyphId }[]; completedParts: number }) {
  const p = completedParts;
  const count = LOGO.sides.length;
  return (
    <svg className="lc-logo-map" viewBox={`0 0 ${LOGO.w} ${LOGO.h}`} role="img" aria-label={`Sam's logo, ${Math.min(p, count)} of ${count} parts painted`}>
      <defs>
        <filter id="lc-ghost" x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0.561  0 0 0 0 0.635  0 0 0 0 0.58  0 0 0 0.12 0" result="fill" />
          <feMorphology in="SourceAlpha" operator="erode" radius="1.1" result="inner" />
          <feComposite in="SourceAlpha" in2="inner" operator="out" result="edge" />
          <feColorMatrix in="edge" type="matrix" values="0 0 0 0 0.561  0 0 0 0 0.635  0 0 0 0 0.58  0 0 0 0.75 0" result="line" />
          <feMerge>
            <feMergeNode in="fill" />
            <feMergeNode in="line" />
          </feMerge>
        </filter>
        <filter id="lc-bristle" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves={2} seed={3} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={9} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <mask id="lc-paint" maskUnits="userSpaceOnUse" x="0" y="0" width={LOGO.w} height={LOGO.h}>
          <g filter="url(#lc-bristle)" fill="none" stroke="#fff" strokeLinecap="butt">
            {LOGO.sides.slice(0, Math.min(p, count)).map((side, i) => (
              <path
                key={i}
                className={`paint${i === p - 1 ? " new" : ""}`}
                d={side.d}
                strokeWidth={side.width}
                style={{ ["--len" as string]: lineLength(side.d) }}
              />
            ))}
            {p >= LOGO.barAfter && (
              <path
                className={`paint bar${p === LOGO.barAfter ? " new" : ""}`}
                d={LOGO.bar.d}
                strokeWidth={LOGO.bar.width}
                style={{ ["--len" as string]: lineLength(LOGO.bar.d) }}
              />
            )}
          </g>
        </mask>
      </defs>
      <image href="/images/lens-check/logo-side.webp" width={LOGO.w} height={LOGO.h} filter="url(#lc-ghost)" />
      <image href="/images/lens-check/logo-side.webp" width={LOGO.w} height={LOGO.h} mask="url(#lc-paint)" />
      {LOGO.sides.map((side, i) => {
        const state = i < p ? "done" : i === p ? "current" : "upcoming";
        const part = parts[i];
        return (
          <g key={i} className={`lc-lnode ${state}`} transform={`translate(${side.node[0]} ${side.node[1]})`}>
            <circle className="halo" r={14.5} />
            <circle className="disc" r={13.5} />
            {part && <NestedGlyph id={part.glyph} size={18} strokeWidth={1.9} />}
          </g>
        );
      })}
    </svg>
  );
}

// The whole logo, upright, painted on stroke by stroke with the same brush
// paths (turned with it) while the answers save. It ends on exactly the
// image the result page's reveal starts from (logo-upright.webp).
export function LogoPaint({ style }: { style?: React.CSSProperties }) {
  const strokes = [...LOGO.sides.slice(0, LOGO.barAfter), LOGO.bar, ...LOGO.sides.slice(LOGO.barAfter)];
  return (
    <svg className="lc-logo-paint" viewBox={`0 0 ${LOGO.h} ${LOGO.w}`} style={style} aria-hidden="true">
      <defs>
        <filter id="lc-up-bristle" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves={2} seed={3} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={9} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <mask id="lc-up-paint" maskUnits="userSpaceOnUse" x="0" y="0" width={LOGO.h} height={LOGO.w}>
          <g transform={`translate(${LOGO.h} 0) rotate(90)`}>
            <g filter="url(#lc-up-bristle)" fill="none" stroke="#fff" strokeLinecap="butt">
              {strokes.map((stroke, i) => (
                <path
                  key={i}
                  className="stroke"
                  d={stroke.d}
                  strokeWidth={stroke.width}
                  style={{ ["--len" as string]: lineLength(stroke.d), ["--i" as string]: i }}
                />
              ))}
            </g>
          </g>
        </mask>
      </defs>
      <image href="/images/lens-check/logo-upright.webp" width={LOGO.h} height={LOGO.w} mask="url(#lc-up-paint)" />
      {/* Brings in the few flecks of paint that sit outside the brush paths. */}
      <image className="whole" href="/images/lens-check/logo-upright.webp" width={LOGO.h} height={LOGO.w} />
    </svg>
  );
}

// ---------- Landscape strip (mist clears part by part) ----------

function Ridges() {
  return (
    <>
      <circle cx="292" cy="58" r="12" fill="var(--lc-gold)" opacity=".55" />
      <path d="M0 76 C40 62 80 58 120 66 C160 74 190 56 230 50 C270 44 320 60 400 54 L400 140 L0 140 Z" fill="var(--lc-sage)" opacity=".3" />
      <path d="M260 52 l5 -10 l5 10z M272 50 l4 -8 l4 8z M118 66 l4 -9 l4 9z" fill="var(--lc-green)" opacity=".35" />
      <path d="M0 97 C50 83 90 87 140 79 C190 71 230 91 280 85 C330 79 370 73 400 77 L400 140 L0 140 Z" fill="var(--lc-sage)" opacity=".5" />
      <path d="M0 118 C60 104 120 112 180 106 C240 100 300 116 400 108 L400 140 L0 140 Z" fill="var(--lc-green)" opacity=".42" />
      <path
        d="M214 140 C222 129 194 123 206 114 C214 108 238 106 231 99 C226 94 240 90 246 86"
        fill="none"
        stroke="var(--lc-cream-deep)"
        strokeWidth="4.5"
        strokeLinecap="round"
        opacity=".9"
      />
    </>
  );
}

export function LandscapeStrip({ clarity }: { clarity: number }) {
  return (
    <div className="lc-landscape" aria-hidden="true">
      <svg viewBox="0 0 400 140" preserveAspectRatio="xMidYMax slice">
        <defs>
          <filter id="lc-soften" x="-10%" y="-30%" width="120%" height="160%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <linearGradient id="lc-mist" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--lc-cream)" stopOpacity="1" />
            <stop offset=".55" stopColor="var(--lc-cream)" stopOpacity=".75" />
            <stop offset="1" stopColor="var(--lc-cream)" stopOpacity=".35" />
          </linearGradient>
        </defs>
        <g className="soft" filter="url(#lc-soften)" style={{ opacity: 1 - clarity * 0.6 }}>
          <Ridges />
        </g>
        <g className="sharp" style={{ opacity: clarity }}>
          <Ridges />
        </g>
        <rect className="mist" x="0" y="0" width="400" height="140" fill="url(#lc-mist)" style={{ opacity: (1 - clarity) * 0.85 }} />
      </svg>
    </div>
  );
}

// ---------- Journey rail: one tick per statement, grouped by part ----------

// Every statement has its own tick, so each answer visibly fills one. The
// gaps mark the parts, and the count above rolls on to the next number.
export function JourneyRail({
  groups,
  answered,
  qi,
  justAnswered,
  total,
  partLabel,
  partGlyph,
}: {
  groups: number[][];
  answered: boolean[];
  qi: number;
  justAnswered: number | null;
  total: number;
  partLabel: string;
  partGlyph: GlyphId;
}) {
  const shown = Math.min(qi + 1, total);
  return (
    <div className="lc-rail">
      <div className="lc-rail-head">
        <span className="lc-rail-part">
          <GlyphIcon id={partGlyph} />
          {partLabel}
        </span>
        <span className="lc-rail-count">
          <span className="sr-only">Statement </span>
          <span className="roll">
            <span key={shown} className="n">
              {shown}
            </span>
          </span>
          <span className="of">of {total}</span>
        </span>
      </div>
      <div className="lc-rail-ticks" aria-hidden="true">
        {groups.map((group, g) => (
          <span key={g} className="lc-rail-group" style={{ flexGrow: group.length }}>
            {group.map((index) => {
              const state = index === qi ? "current" : answered[index] ? "done" : "upcoming";
              return <i key={index} className={`${state}${index === justAnswered ? " new" : ""}`} />;
            })}
          </span>
        ))}
      </div>
    </div>
  );
}
