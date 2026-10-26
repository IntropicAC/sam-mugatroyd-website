// The painted archetype characters and where they sit on the result stage.
// Images live in public/images/lens-check/mascots (600–900px WebP, made from
// the archetype kit). hex is each character's body colour, which the logo
// washes into; anchor is the prop that glows at the end (lantern, crown,
// constellation...) and bottom the lowest row of paint, both in image pixels.
// size trims a character that still looks heavier than the rest once fitted
// (broad, solid shapes read as bigger); 1 when left out.

export interface Mascot {
  slug: string;
  hex: string;
  w: number;
  h: number;
  anchor: [number, number];
  bottom: number;
  size?: number;
}

// Every character fits a frame of this shape (width / height), centred in
// it, so broad characters don't come out far larger than tall, narrow ones
// and all of them sit in the same place (homepage hero and result stage).
export const FIGURE_ASPECT = 640 / 820;

export const MASCOTS: Record<string, Mascot> = {
  lighthouse: { slug: "lighthouse", hex: "#2F735B", w: 600, h: 900, anchor: [114, 329], bottom: 833 },
  loyal_guard: { slug: "loyal-guard", hex: "#7F9265", w: 600, h: 900, anchor: [249, 311], bottom: 889 },
  navigator: { slug: "navigator", hex: "#3B9996", w: 844, h: 900, anchor: [468, 482], bottom: 862 },
  waymaker: { slug: "waymaker", hex: "#478364", w: 600, h: 900, anchor: [437, 400], bottom: 852 },
  wandering_scholar: { slug: "wandering-scholar", hex: "#5983B3", w: 888, h: 900, anchor: [442, 420], bottom: 887, size: 0.96 },
  observer: { slug: "observer", hex: "#477A92", w: 600, h: 900, anchor: [499, 190], bottom: 851 },
  storm_watcher: { slug: "storm-watcher", hex: "#627C8C", w: 600, h: 900, anchor: [492, 120], bottom: 863 },
  alchemist: { slug: "alchemist", hex: "#666DA4", w: 600, h: 900, anchor: [357, 305], bottom: 860 },
  reluctant_hero: { slug: "reluctant-hero", hex: "#BA7049", w: 600, h: 900, anchor: [275, 343], bottom: 855 },
  sleeping_giant: { slug: "sleeping-giant", hex: "#A88542", w: 855, h: 900, anchor: [332, 369], bottom: 879, size: 0.95 },
  hesitant_believer: { slug: "hesitant-believer", hex: "#C89461", w: 600, h: 900, anchor: [279, 294], bottom: 854 },
  method_actor: { slug: "method-actor", hex: "#B96D88", w: 600, h: 900, anchor: [501, 190], bottom: 874 },
  heir: { slug: "heir", hex: "#914F68", w: 600, h: 900, anchor: [293, 44], bottom: 889 },
  undercurrent: { slug: "undercurrent", hex: "#795F89", w: 900, h: 750, anchor: [367, 459], bottom: 715 },
};

export const mascotSrc = (mascot: Mascot) => `/images/lens-check/mascots/${mascot.slug}.webp`;

export function mascotsFor(ids: string[]): Mascot[] {
  return ids.map((id) => MASCOTS[id]).filter((mascot): mascot is Mascot => Boolean(mascot));
}

// Sam's logo standing upright: the part map's sideways artwork turned back.
export const LOGO_ART = { src: "/images/lens-check/logo-upright.webp", w: 407, h: 800 };

// Stage coordinates: a 4:5 box, 800 x 1000 units, shared by the static images
// and the WebGL animation so they line up exactly.
export const STAGE = { w: 800, h: 1000 };

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  // Image pixels to stage units.
  s: number;
}

function fit(w: number, h: number, boxW: number, boxH: number, cx: number, cy: number, size = 1): Rect {
  const s = Math.min(boxW / w, boxH / h) * size;
  return { x: cx - (w * s) / 2, y: cy - (h * s) / 2, w: w * s, h: h * s, s };
}

export const LOGO_RECT = fit(LOGO_ART.w, LOGO_ART.h, 330, 600, 400, 505);

// One character fills the stage; a mixed result shares it between two or three.
export function mascotRects(mascots: Mascot[]): Rect[] {
  if (mascots.length <= 1) return mascots.map((m) => fit(m.w, m.h, 640, 820, 400, 505, m.size));
  if (mascots.length === 2) return mascots.map((m, i) => fit(m.w, m.h, 390, 700, i === 0 ? 202 : 598, 505, m.size));
  const centres: [number, number][] = [[400, 265], [215, 745], [585, 745]];
  return mascots.slice(0, 3).map((m, i) => fit(m.w, m.h, 330, 470, centres[i][0], centres[i][1], m.size));
}

// The lowest paint on the stage (characters, or the logo when there are
// none), in stage units, so the title can sit just below it.
export function paintedBottom(mascots: Mascot[], rects: Rect[]) {
  if (mascots.length === 0) return LOGO_RECT.y + LOGO_RECT.h;
  return Math.max(...mascots.map((mascot, i) => rects[i].y + mascot.bottom * rects[i].s));
}

// Absolute placement inside the stage, as percentages.
export function stagePlacement(rect: Rect) {
  return {
    left: `${(rect.x / STAGE.w) * 100}%`,
    top: `${(rect.y / STAGE.h) * 100}%`,
    width: `${(rect.w / STAGE.w) * 100}%`,
    height: `${(rect.h / STAGE.h) * 100}%`,
  };
}

// Where a character's prop glows, sized to the character.
export function glowPlacement(mascot: Mascot, rect: Rect) {
  return {
    left: `${((rect.x + mascot.anchor[0] * rect.s) / STAGE.w) * 100}%`,
    top: `${((rect.y + mascot.anchor[1] * rect.s) / STAGE.h) * 100}%`,
    width: `${(rect.w / STAGE.w) * 60}%`,
  };
}
