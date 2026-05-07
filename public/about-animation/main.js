/**
 * Neural Typography System — Perception 47 / Sam Murgatroyd
 *
 * Architecture overview:
 *   TextSystem    orchestrates the RAF loop, owns a flat branch list,
 *                 handles root-branch spawning and frame budget.
 *   BranchNode    grows through space by placing 2–3 char segments along a
 *                 direction vector with per-step angle drift. Stores an array
 *                 of placed segments; each is drawn with its own translate/
 *                 rotate so the text follows the path rather than sitting as
 *                 a flat line. Children branch from any existing segment.
 *   RegionTracker lightweight AABB store to prevent spawn collisions.
 *
 * Text measurement:
 *   @chenglou/pretext — prepare(text, font) → measureNaturalWidth(prepared).
 *   Cached after first call per string+font pair, so per-frame re-measurement
 *   of the same chunks costs effectively nothing.
 */

import { prepare, measureNaturalWidth } from 'https://cdn.jsdelivr.net/npm/@chenglou/pretext@0.0.6/dist/layout.js';

// ── Configuration ─────────────────────────────────────────────────────────────

const CONFIG = {
  colors: {
    root:    'rgba(245, 240, 234, {a})',
    branch1: 'rgba(208, 196, 172, {a})',
    branch2: 'rgba( 88, 128,  98, {a})',
    deep:    'rgba(148, 136, 118, {a})',
  },

  glow: {
    fresh: { color: 'rgba(255, 218, 140, 0.65)', blur: 14 },
    mid:   { color: 'rgba(180, 210, 160, 0.30)', blur:  6 },
    none:  { color: 'rgba(0,0,0,0)',              blur:  0 },
  },

  fonts: {
    root:   { weight: '400', sizes: [16, 22] },
    child:  { weight: '300', sizes: [11, 15] },
    deep:   { weight: '300', sizes: [ 9, 12] },
    family: "'Courier New', Courier, monospace",
  },

  // Path-growth parameters — the core of the new behaviour
  path: {
    chunkMin:        2,     // chars per segment (min)
    chunkMax:        3,     // chars per segment (max)
    drift:           0.07,  // max angle noise per segment (radians) — organic wobble
    spacing:         2,     // extra px gap between consecutive segments
    rootTicksPerSec: 8,     // segments added per second for root branches
    childTicksPerSec:13,    // children reveal faster (shorter text)
  },

  spawn: {
    rootInterval:    4200,
    maxActiveRoots:  5,
    childTickRange:  [700, 2600],
    childChance:     0.58,
    maxDepth:        4,
    maxChildrenBase: 3,
  },

  lifetime: {
    root:        [13000, 22000],
    child:       [ 5500, 11000],
    depthScale:  0.88,
  },

  fadeStartFraction: 0.58,
  trailAlpha:        0.11,
  branchCap:         700,
};

// ── Text content (Perception 47 / Sam Murgatroyd themed) ─────────────────────

const TEXT = {
  roots: [
    'SAM MURGATROYD',
    'PERCEPTION 47',
    'AUTHENTICITY',
    'LENS SHIFT',
    'THE AUTHOR',
    'ABOUT ME',
    'COACHING',
    'AWARENESS',
    'ALIENATED',
    'ROBINS BENCH',
  ],
  fragments: [
    'CLARITY',  'GROWTH',   'TRUTH',    'GUIDE',    'REAL',
    'SELF',     'MIND',     'SHIFT',    'OPEN',     'FREE',
    'KNOW',     'FEEL',     'SEE',      'PATH',     'ROOTS',
    'DEEP',     'LIVE',     'BRAVE',    'WHOLE',    'LIGHT',
    'SOUL',     'TRUST',    'BOLD',     'BE',       'ASK',
    'DARE',     'FIND',     'SEEK',     '47',       'LENS',
    'FOCUS',    'ALIGN',    'TRUE',     'CORE',     'RAW',
    'PURE',     'NOW',      'HERE',     'HUMAN',    'COACH',
    'VOICE',    'STORY',    'WHO',      'WHY',      'HOW',
    'WITNESS',  'EMERGE',   'WITHIN',   'BECOME',   'BELONG',
    'AUTHOR',   'WORDS',    'WRITE',    'SENSE',    'MEAN',
    'DRIFT',    'RETURN',   'OBSERVE',  'NOTICE',   'CHOICE',
    'P·47',     'CONNECT',  'ANCHOR',   'GROUND',
  ],
};

// ── Utilities ─────────────────────────────────────────────────────────────────

const rand    = (lo, hi)    => Math.random() * (hi - lo) + lo;
const rInt    = (lo, hi)    => Math.floor(rand(lo, hi + 1));
const pick    = (arr)       => arr[rInt(0, arr.length - 1)];
const clamp   = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const applyAlpha = (tpl, a) => tpl.replace('{a}', a.toFixed(3));

// ── Region Tracker ────────────────────────────────────────────────────────────

class RegionTracker {
  constructor(cap = 700) {
    this.cap   = cap;
    this.rects = [];
  }

  add(x, y, w, h, pad = 5) {
    if (this.rects.length >= this.cap) this.rects.shift();
    this.rects.push({ x: x - pad, y: y - pad, w: w + pad * 2, h: h + pad * 2 });
  }

  hits(x, y, w, h) {
    for (const r of this.rects) {
      if (x < r.x + r.w && x + w > r.x && y < r.y + r.h && y + h > r.y) return true;
    }
    return false;
  }
}

// ── Branch Node ───────────────────────────────────────────────────────────────
// Grows through canvas space as a sequence of placed text segments.
//
// Each update tick, 2–3 characters are taken from sourceText, measured via
// Pretext, placed at the current tip position, and the tip is advanced along
// the current angle. A small random drift is applied to the angle each step
// so paths curve organically — like roots, neurons, or veins.
//
// segments = [{ text, x, y, angle, width, born }]
//
// Each segment is drawn individually:
//   ctx.translate(seg.x, seg.y) → ctx.rotate(seg.angle) → ctx.fillText(seg.text, 0, 0)
//
// Children can branch from any existing segment (not just the tip), picked at
// random, giving the structure a tree-like quality.

class BranchNode {
  constructor({
    x, y, angle,
    text, fontSize, fontWeight,
    ticksPerSec,
    lifetime, colorTemplate, glowCfg,
    depth, startDelay,
  }) {
    // ── Growing tip state ─────────────────────────────────────────────────────
    this.tipX     = x;
    this.tipY     = y;
    this.tipAngle = angle;

    // ── Source text & placed segments ─────────────────────────────────────────
    this.sourceText = text;
    this.charIndex  = 0;      // how far into sourceText we've consumed
    this.segments   = [];     // placed segments, each with own position/angle

    // ── Appearance ────────────────────────────────────────────────────────────
    this.fontSize   = fontSize;
    this.fontWeight = fontWeight;
    this.fontStr    = `${fontWeight} ${fontSize}px ${CONFIG.fonts.family}`;
    this.colorTpl   = colorTemplate;
    this.glowCfg    = glowCfg;

    // ── Growth timing ─────────────────────────────────────────────────────────
    this.tickInterval = 1000 / ticksPerSec;
    this.tickTimer    = 0;

    // ── Lifetime & opacity ────────────────────────────────────────────────────
    this.lifetime   = lifetime;
    this.age        = 0;
    this.opacity    = 1;
    this.active     = true;
    this.startDelay = startDelay || 0;

    // ── Tree structure ────────────────────────────────────────────────────────
    this.depth    = depth;
    this.children = [];

    // ── Child-spawn state ─────────────────────────────────────────────────────
    this.childTimer    = 0;
    this.childInterval = rand(...CONFIG.spawn.childTickRange);
    this.spawnCount    = 0;
    this.maxChildren   = Math.max(0, CONFIG.spawn.maxChildrenBase - depth);
  }

  // True once the full sourceText has been placed as segments
  get fullyConsumed() { return this.charIndex >= this.sourceText.length; }

  // Current tip coordinates (used when spawning children from the tip)
  tipPosition() { return { x: this.tipX, y: this.tipY }; }

  _computeOpacity(localAge) {
    const fadeFrom = this.lifetime * CONFIG.fadeStartFraction;
    if (localAge <= fadeFrom) return 1;
    return clamp(
      1 - (localAge - fadeFrom) / (this.lifetime * (1 - CONFIG.fadeStartFraction)),
      0, 1
    );
  }

  // ── update ────────────────────────────────────────────────────────────────
  update(dt) {
    if (!this.active) return;
    this.age += dt;

    const localAge = this.age - this.startDelay;
    if (localAge < 0) return;

    this.opacity = this._computeOpacity(localAge);
    if (this.opacity <= 0 || localAge >= this.lifetime) {
      this.active = false;
      return;
    }

    // Grow: place a new 2–3 char segment on each tick
    if (!this.fullyConsumed) {
      this.tickTimer += dt;
      while (this.tickTimer >= this.tickInterval && !this.fullyConsumed) {
        this._placeNextSegment(localAge);
        this.tickTimer -= this.tickInterval;
      }
    }

    // Child timer runs as soon as there are enough segments to branch from —
    // children can split off during growth, not just after the text is done.
    if (this.segments.length >= 2) {
      this.childTimer += dt;
    }
  }

  // ── _placeNextSegment ─────────────────────────────────────────────────────
  // Core growth step: take the next chunk of chars, measure it with Pretext,
  // record a segment at the current tip, then advance the tip.
  _placeNextSegment(localAge) {
    const chunkSize = rInt(CONFIG.path.chunkMin, CONFIG.path.chunkMax);
    const text = this.sourceText.slice(this.charIndex, this.charIndex + chunkSize);
    if (!text) return;

    // Pretext measures this chunk; result is cached after the first call
    const width = measureNaturalWidth(prepare(text, this.fontStr));

    this.segments.push({
      text,
      x:     this.tipX,
      y:     this.tipY,
      angle: this.tipAngle,
      width,
      born:  localAge, // local age at placement — used for per-segment glow decay
    });

    // Advance tip: move forward by the measured chunk width plus a small gap
    const step = width + CONFIG.path.spacing;
    this.tipX += Math.cos(this.tipAngle) * step;
    this.tipY += Math.sin(this.tipAngle) * step;

    // Apply random drift so the path curves organically
    this.tipAngle += rand(-CONFIG.path.drift, CONFIG.path.drift);

    this.charIndex += chunkSize;
  }

  // ── trySpawnChild ─────────────────────────────────────────────────────────
  // Pick a random existing segment as the branch point, check for space,
  // and return a new BranchNode growing outward from that segment.
  trySpawnChild(tracker) {
    if (this.segments.length < 2)            return null;
    if (this.spawnCount >= this.maxChildren) return null;
    if (this.depth >= CONFIG.spawn.maxDepth) return null;
    if (this.childTimer < this.childInterval) return null;

    this.childTimer    = 0;
    this.childInterval = rand(...CONFIG.spawn.childTickRange);

    if (Math.random() > CONFIG.spawn.childChance) return null;

    // Branch from any segment, biased toward more recent ones for visual clarity
    const idx = rInt(Math.floor(this.segments.length * 0.3), this.segments.length - 1);
    const parentSeg = this.segments[idx];

    const childDepth = this.depth + 1;
    const fCfg       = childDepth <= 1 ? CONFIG.fonts.child : CONFIG.fonts.deep;
    const fontSize   = rInt(...fCfg.sizes);
    const fontStr    = `${fCfg.weight} ${fontSize}px ${CONFIG.fonts.family}`;
    const text       = pick(TEXT.fragments);

    // Reject if the target area is already occupied
    const estW = measureNaturalWidth(prepare(text, fontStr));
    const estH = fontSize + 4;
    if (tracker.hits(parentSeg.x, parentSeg.y - estH, estW, estH)) return null;

    // Child angle diverges from the parent segment's angle, biased perpendicular
    const sign       = Math.random() < 0.5 ? 1 : -1;
    const deviation  = rand(Math.PI / 5, Math.PI * 0.44);
    const childAngle = parentSeg.angle + sign * deviation;

    const colorTpl = childDepth % 2 === 0 ? CONFIG.colors.branch2 : CONFIG.colors.branch1;
    const glowCfg  = childDepth <= 1 ? CONFIG.glow.mid : CONFIG.glow.none;
    const [lifeLo, lifeHi] = CONFIG.lifetime.child;
    const lifetime = rand(lifeLo, lifeHi) * Math.pow(CONFIG.lifetime.depthScale, childDepth);

    this.spawnCount++;

    return new BranchNode({
      x:          parentSeg.x,
      y:          parentSeg.y,
      angle:      childAngle,
      text,
      fontSize,
      fontWeight: fCfg.weight,
      ticksPerSec: CONFIG.path.childTicksPerSec + rand(-2, 4),
      lifetime,
      colorTemplate: colorTpl,
      glowCfg,
      depth:      childDepth,
      startDelay: rand(60, 380),
    });
  }

  // ── render ────────────────────────────────────────────────────────────────
  // Draw every segment at its stored position and angle.
  // Each segment is an independent translate → rotate → fillText call.
  render(ctx, tracker) {
    if (!this.active || this.opacity <= 0 || !this.segments.length) return;
    const localAge = this.age - this.startDelay;
    if (localAge < 0) return;

    for (const seg of this.segments) {
      // Per-segment glow decays from the moment the segment was placed
      const segAge  = localAge - seg.born;
      const segGlowT = clamp(1 - segAge / 2500, 0, 1);

      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.font        = this.fontStr;

      if (segGlowT > 0.02 && this.glowCfg.blur > 0) {
        ctx.shadowColor = this.glowCfg.color;
        ctx.shadowBlur  = this.glowCfg.blur * segGlowT;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = applyAlpha(this.colorTpl, this.opacity);

      // Each segment lives at its own world position and angle
      ctx.translate(seg.x, seg.y);
      ctx.rotate(seg.angle);
      ctx.fillText(seg.text, 0, 0);

      ctx.restore();

      // Register approximate AABB of this rotated segment for overlap detection
      const cos = Math.cos(seg.angle);
      const sin = Math.sin(seg.angle);
      tracker.add(
        Math.min(seg.x, seg.x + cos * seg.width),
        Math.min(seg.y, seg.y + sin * seg.width) - this.fontSize,
        Math.abs(cos * seg.width) + this.fontSize * 0.5,
        Math.abs(sin * seg.width) + this.fontSize,
        2
      );
    }

    // Blinking caret at the growing tip while text is still being placed
    if (!this.fullyConsumed) {
      const blink = Math.floor(localAge / 400) % 2 === 0;
      if (blink) {
        ctx.save();
        ctx.globalAlpha = this.opacity * 0.7;
        ctx.fillStyle   = applyAlpha(this.colorTpl, this.opacity * 0.7);
        ctx.shadowBlur  = 0;
        ctx.translate(this.tipX, this.tipY);
        ctx.rotate(this.tipAngle);
        ctx.fillRect(0, -this.fontSize * 0.8, 1.5, this.fontSize * 0.72);
        ctx.restore();
      }
    }
  }
}

// ── Text System ───────────────────────────────────────────────────────────────

class TextSystem {
  constructor(canvas) {
    this.canvas   = canvas;
    this.ctx      = canvas.getContext('2d');
    this.branches = [];
    this.tracker  = new RegionTracker();
    this.lastTime = null;
    this.rootTimer = 0;
    this._raf     = null;

    this._sizeCanvas();
    window.addEventListener('resize', () => this._sizeCanvas());
  }

  _sizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const w   = this.canvas.clientWidth;
    const h   = this.canvas.clientHeight;
    this.canvas.width  = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.W = w;
    this.H = h;
  }

  _makeRoot() {
    const text     = pick(TEXT.roots);
    const fCfg     = CONFIG.fonts.root;
    const fontSize = rInt(...fCfg.sizes);

    let x, y, angle;
    const mode = Math.random();

    if (mode < 0.38) {
      x     = rand(this.W * 0.02, this.W * 0.12);
      y     = rand(this.H * 0.08, this.H * 0.92);
      angle = rand(-0.28, 0.28);
    } else if (mode < 0.62) {
      x     = rand(this.W * 0.88, this.W * 0.98);
      y     = rand(this.H * 0.08, this.H * 0.92);
      angle = Math.PI + rand(-0.28, 0.28);
    } else {
      x     = rand(this.W * 0.08, this.W * 0.55);
      y     = rand(this.H * 0.08, this.H * 0.92);
      angle = rand(-0.38, 0.38);
    }

    const [lifeLo, lifeHi] = CONFIG.lifetime.root;

    return new BranchNode({
      x, y, angle, text,
      fontSize,
      fontWeight:  fCfg.weight,
      ticksPerSec: CONFIG.path.rootTicksPerSec + rand(-1, 2),
      lifetime:    rand(lifeLo, lifeHi),
      colorTemplate: CONFIG.colors.root,
      glowCfg:     CONFIG.glow.fresh,
      depth:       0,
      startDelay:  0,
    });
  }

  start() {
    for (let i = 0; i < 3; i++) {
      const root = this._makeRoot();
      root.startDelay = i * 600;
      this.branches.push(root);
    }
    this._raf = requestAnimationFrame(ts => this._loop(ts));
  }

  stop() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
  }

  _loop(ts) {
    const dt      = this.lastTime ? Math.min(ts - this.lastTime, 100) : 16;
    this.lastTime = ts;
    this._update(dt);
    this._render();
    this._raf = requestAnimationFrame(t => this._loop(t));
  }

  _update(dt) {
    this.rootTimer += dt;
    const liveRoots = this.branches.filter(b => b.depth === 0 && b.active).length;
    if (this.rootTimer >= CONFIG.spawn.rootInterval && liveRoots < CONFIG.spawn.maxActiveRoots) {
      this.branches.push(this._makeRoot());
      this.rootTimer = 0;
    }

    const newChildren = [];
    for (const branch of this.branches) {
      branch.update(dt);
      if (branch.active) {
        const child = branch.trySpawnChild(this.tracker);
        if (child) {
          newChildren.push(child);
          branch.children.push(child);
        }
      }
    }

    this.branches.push(...newChildren);

    if (this.branches.length > CONFIG.branchCap) {
      this.branches = this.branches.filter(b => b.active);
    }
  }

  _render() {
    const ctx = this.ctx;

    // Translucent overlay: older segments persist as a dim trail
    ctx.fillStyle = `rgba(0,0,0,${CONFIG.trailAlpha})`;
    ctx.fillRect(0, 0, this.W, this.H);

    this.tracker = new RegionTracker();

    for (const branch of this.branches) {
      branch.render(ctx, this.tracker);
    }
  }
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas');
  const system = new TextSystem(canvas);
  system.start();
});
