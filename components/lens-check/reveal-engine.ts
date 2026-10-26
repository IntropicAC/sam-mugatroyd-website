// The result reveal: Sam's logo washes into the archetype's colour, breaks into
// brushstrokes and paints itself into the character. Plain WebGL, loaded on
// demand by ArchetypeReveal. It runs once (about seven seconds), hands over to
// the static images and then releases the GPU context, so nothing keeps
// running on the page afterwards.

import { STAGE, type Rect } from "@/lib/lens-check/mascots";
import { compile, FRAGMENT_PRECISION, hexRgb, loadImage, luma, NOISE, paintLuma, readPixels } from "./gl-common";

export interface RevealTarget {
  src: string;
  rect: Rect;
  // Height of the glowing prop in the image, 0 (top) to 1 (bottom).
  anchorV: number;
}

export interface RevealOptions {
  container: HTMLElement;
  logo: { src: string; rect: Rect };
  // The colour the logo washes into (the main archetype's body colour).
  hex: string;
  targets: RevealTarget[];
  // The canvas is showing the logo; the static logo can hide.
  onStart: () => void;
  // The painting has reached this character's prop, so its light comes on with it.
  onGlow: (index: number) => void;
  // The characters are complete enough for the title to arrive.
  onDone: () => void;
  // Finished (or failed): show the static images. The canvas is removed shortly after.
  onEnd: () => void;
}

// Playback speed for the whole timeline below: 0.66 runs it at two-thirds
// speed, so the 4.55s timeline takes about 6.9s. Raise it to speed up.
const SPEED = 0.66;
// Timeline in seconds at speed 1. The logo is already painted when it begins.
const T = {
  wash: [0.25, 1.25],
  swap: [1.35, 1.6],
  flight: [1.45, 4.1],
  // The painting (with its shading and glow) comes in as the strokes land,
  // top first, rather than after them.
  reveal: [2.75, 4.2],
  fade: [4.0, 4.5],
  done: 4.1,
  end: 4.55,
} as const;
const CX = 400;
const CY = 505;
// Spread of particle start times, as a share of the flight.
const SPREAD = 0.38;

const prog = (t: number, [a, b]: readonly [number, number]) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const easeInOutInverse = (y: number) => (y < 0.5 ? Math.sqrt(y / 2) : 1 - Math.sqrt((1 - y) / 2));

// When the painting's ragged wipe (reveal() in the shader, soft edge 0.06)
// passes a point this far down the image, on average.
function revealTime(v: number) {
  const k = 0.55 * v + 0.45 * 0.45;
  const progress = Math.min(1, (k + 0.06 + 0.05) / 1.22);
  return T.reveal[0] + easeInOutInverse(progress) * (T.reveal[1] - T.reveal[0]);
}

const QUAD_VS = `
attribute vec2 a_q;
uniform vec4 u_rect; uniform vec2 u_res;
varying vec2 v_uv;
void main(){ v_uv = a_q; vec2 p = u_rect.xy + a_q * u_rect.zw; vec2 c = p / u_res * 2. - 1.; gl_Position = vec4(c.x, -c.y, 0., 1.); }`;

// kind 0: the logo, with its colour wash and gold leading edge. kind 1: a character painting in.
const QUAD_FS = FRAGMENT_PRECISION + NOISE + `
uniform sampler2D u_tex; uniform float u_show, u_wash, u_alpha, u_lg, u_kind; uniform vec3 u_hex;
varying vec2 v_uv;
void main(){
  vec4 c = texture2D(u_tex, v_uv);
  if (c.a < .002) discard;
  vec3 rgb = c.rgb / c.a;
  float m = 1.;
  if (u_kind < .5) {
    float L = dot(rgb, vec3(.299, .587, .114));
    vec3 tinted = clamp(u_hex * (L / u_lg), 0., 1.);
    float w = reveal(v_uv, u_wash, vec2(4., 7.), 3.7, .025, 1.);
    float edge = 1. - abs(w * 2. - 1.);
    rgb = mix(rgb, tinted, w) + vec3(1., .8, .38) * edge * .75;
  } else {
    m = reveal(v_uv, u_show, vec2(6., 8.), 9.1, .06, 0.);
  }
  float a = c.a * m * u_alpha;
  gl_FragColor = vec4(min(rgb, 1.) * a, a);
}`;

const PARTICLE_VS = NOISE + `
attribute vec2 a_p0; attribute vec2 a_p1; attribute vec3 a_c0; attribute vec3 a_c1; attribute vec2 a_s; attribute vec2 a_uv;
uniform float u_t, u_spread, u_unit, u_size, u_spin, u_swirl, u_alpha, u_show;
uniform vec2 u_res, u_center;
varying vec4 v_col; varying vec2 v_dir; varying float v_thin;
vec2 path(float t){
  float e = t < .5 ? 4. * t * t * t : 1. - pow(-2. * t + 2., 3.) / 2.;
  vec2 base = mix(a_p0, a_p1, e);
  float bump = sin(3.14159 * t);
  float ang = u_spin * bump * (.55 + .9 * a_s.y);
  vec2 r = base - u_center;
  float cs = cos(ang), sn = sin(ang);
  r = vec2(cs * r.x - sn * r.y, sn * r.x + cs * r.y) * (1. + .1 * bump * a_s.y);
  vec2 n = vec2(vnoise(base * .006 + a_s.y * 7. + t * 1.3) - .5, vnoise(base * .006 + 19.7 + t * 1.3) - .5);
  return u_center + r + n * u_swirl * bump;
}
void main(){
  float lt = clamp((u_t - a_s.x * u_spread) / (1. - u_spread), 0., 1.);
  vec2 p = path(lt);
  vec2 v = path(min(lt + .02, 1.)) - path(max(lt - .02, 0.));
  float sp = length(v);
  v_dir = sp > .01 ? v / sp : vec2(1., 0.);
  float stretch = 1. + min(sp * .17, 4.5);
  float spark = step(.93, a_s.y);
  float size = u_size * mix(1., .75, spark) * (1. + .55 * sin(3.14159 * lt));
  gl_PointSize = size * stretch * u_unit;
  v_thin = 1. / stretch;
  vec3 col = mix(a_c0, a_c1, smoothstep(.25, .85, lt));
  col = mix(col, vec3(1., .86, .5), spark * sin(3.14159 * lt) * .9);
  // Fade out once the painting has appeared underneath.
  float shown = reveal(a_uv, u_show, vec2(6., 8.), 9.1, .06, 0.);
  v_col = vec4(col, u_alpha * (1. - shown * smoothstep(.7, 1., lt)));
  vec2 c = p / u_res * 2. - 1.;
  gl_Position = vec4(c.x, -c.y, 0., 1.);
}`;

// Each particle is an elongated dab along its direction of travel, with faint bristle streaks.
const PARTICLE_FS = FRAGMENT_PRECISION + `
varying vec4 v_col; varying vec2 v_dir; varying float v_thin;
void main(){
  vec2 q = gl_PointCoord * 2. - 1.;
  vec2 r = vec2(dot(q, v_dir), dot(q, vec2(-v_dir.y, v_dir.x)));
  float d = length(vec2(r.x, r.y / v_thin));
  float a = smoothstep(1., .5, d) * (.8 + .2 * sin(r.y / v_thin * 9.)) * v_col.a;
  if (a < .003) discard;
  gl_FragColor = vec4(v_col.rgb * a, a);
}`;

// Small seeded generator, so a given result always animates the same way.
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Point = { x: number; y: number; r: number; g: number; b: number; u: number; v: number };

// Random points on the painted parts of an image, denser where the paint is solid.
function sample(px: ImageData, rect: Rect, n: number, pow: number, rand: () => number): Point[] {
  const { data, width, height } = px;
  const out: Point[] = [];
  for (let tries = 0; out.length < n && tries < n * 300; tries++) {
    const x = (rand() * width) | 0;
    const y = (rand() * height) | 0;
    const i = (y * width + x) * 4;
    const alpha = data[i + 3] / 255;
    if (alpha < 0.1 || rand() > Math.pow(alpha, pow)) continue;
    const ix = x + rand();
    const iy = y + rand();
    out.push({
      x: rect.x + ix * rect.s,
      y: rect.y + iy * rect.s,
      r: data[i] / 255,
      g: data[i + 1] / 255,
      b: data[i + 2] / 255,
      u: ix / width,
      v: iy / height,
    });
  }
  return out;
}

function paintedShare(px: ImageData) {
  let painted = 0;
  let total = 0;
  for (let i = 3; i < px.data.length; i += 4 * 11) {
    total++;
    if (px.data[i] > 25) painted++;
  }
  return total ? painted / total : 0;
}

// Pair points top to top and left to left, so the paint flows rather than scatters.
function bandOrder(points: Point[]) {
  points.sort((p, q) => p.y - q.y);
  const bands = 56;
  const per = Math.ceil(points.length / bands);
  const out: Point[] = [];
  for (let b = 0; b < bands; b++) out.push(...points.slice(b * per, (b + 1) * per).sort((p, q) => p.x - q.x));
  return out;
}

export function runReveal(o: RevealOptions): (() => void) | null {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: true, alpha: true });
  if (!gl) return null;

  let cancelled = false;
  let finished = false;
  let raf = 0;
  let removeTimer = 0;
  const textures: WebGLTexture[] = [];
  const buffers: WebGLBuffer[] = [];
  const programs: WebGLProgram[] = [];

  const release = () => {
    cancelAnimationFrame(raf);
    window.clearTimeout(removeTimer);
    if (!gl.isContextLost()) {
      textures.forEach((t) => gl.deleteTexture(t));
      buffers.forEach((b) => gl.deleteBuffer(b));
      programs.forEach((p) => gl.deleteProgram(p));
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
    canvas.remove();
  };

  const glowed = o.targets.map(() => false);
  const glowAt = o.targets.map((target) => revealTime(target.anchorV));
  const glow = (i: number) => {
    if (glowed[i]) return;
    glowed[i] = true;
    o.onGlow(i);
  };

  // Every path out, including errors, ends with the static images showing.
  const finish = () => {
    if (finished) return;
    finished = true;
    o.targets.forEach((_, i) => glow(i));
    o.onDone();
    o.onEnd();
    // Keep the last frame up while the static images fade in underneath.
    removeTimer = window.setTimeout(release, 800);
  };

  canvas.addEventListener("webglcontextlost", finish);

  const texture = (img: HTMLImageElement) => {
    const t = gl.createTexture();
    if (!t) throw new Error("Could not create texture");
    textures.push(t);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  };
  const buffer = (data: Float32Array) => {
    const b = gl.createBuffer();
    if (!b) throw new Error("Could not create buffer");
    buffers.push(b);
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return b;
  };

  const setup = async () => {
    const [logoImg, ...targetImgs] = await Promise.all([loadImage(o.logo.src), ...o.targets.map((t) => loadImage(t.src))]);
    if (cancelled) return;

    const quad = compile(gl, QUAD_VS, QUAD_FS);
    const parts = compile(gl, PARTICLE_VS, PARTICLE_FS);
    programs.push(quad.program, parts.program);
    const quadBuf = buffer(new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]));
    const logoTex = texture(logoImg);
    const targetTex = targetImgs.map(texture);

    // Fewer, slightly larger strokes on small screens look the same and cost less.
    const width = o.container.clientWidth;
    const count = width < 360 ? 12000 : 17000;
    const size = 4.6 * Math.sqrt(20000 / count);

    const rand = rng(47);
    const logoPx = readPixels(logoImg);
    const logoLg = paintLuma(logoPx);

    const targetPx = targetImgs.map(readPixels);
    const weights = targetPx.map((px, i) => paintedShare(px) * o.targets[i].rect.w * o.targets[i].rect.h);
    const weightSum = weights.reduce((a, b) => a + b, 0) || 1;
    const dst = bandOrder(targetPx.flatMap((px, i) => sample(px, o.targets[i].rect, Math.round((count * weights[i]) / weightSum), 1.5, rand)));
    const src = bandOrder(sample(logoPx, o.logo.rect, count, 2, rand));
    const n = Math.min(src.length, dst.length);
    const hex = hexRgb(o.hex);
    const stride = 14;
    const f = new Float32Array(n * stride);
    for (let i = 0; i < n; i++) {
      const a = src[i];
      const b = dst[i];
      const k = Math.min(luma(a.r, a.g, a.b) / logoLg, 1.25);
      f.set(
        [
          a.x, a.y, b.x, b.y,
          Math.min(1, hex[0] * k), Math.min(1, hex[1] * k), Math.min(1, hex[2] * k),
          b.r, b.g, b.b,
          0.72 * a.v + 0.28 * rand(), rand(),
          b.u, b.v,
        ],
        i * stride,
      );
    }
    const partBuf = buffer(f);

    o.container.appendChild(canvas);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(o.container.clientWidth * dpr);
    canvas.height = Math.round(o.container.clientHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const drawQuad = (tex: WebGLTexture, rect: Rect, kind: number, show: number, wash: number, alpha: number) => {
      gl.useProgram(quad.program);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
      gl.enableVertexAttribArray(quad.a.a_q);
      gl.vertexAttribPointer(quad.a.a_q, 2, gl.FLOAT, false, 0, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(quad.u.u_tex, 0);
      gl.uniform4f(quad.u.u_rect, rect.x, rect.y, rect.w, rect.h);
      gl.uniform2f(quad.u.u_res, STAGE.w, STAGE.h);
      gl.uniform1f(quad.u.u_kind, kind);
      gl.uniform1f(quad.u.u_show, show);
      gl.uniform1f(quad.u.u_wash, wash);
      gl.uniform1f(quad.u.u_alpha, alpha);
      gl.uniform1f(quad.u.u_lg, logoLg);
      gl.uniform3fv(quad.u.u_hex, hex);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.disableVertexAttribArray(quad.a.a_q);
    };

    const layout: [string, number, number][] = [["a_p0", 2, 0], ["a_p1", 2, 2], ["a_c0", 3, 4], ["a_c1", 3, 7], ["a_s", 2, 10], ["a_uv", 2, 12]];
    const drawParticles = (flight: number, show: number, alpha: number) => {
      gl.useProgram(parts.program);
      gl.bindBuffer(gl.ARRAY_BUFFER, partBuf);
      for (const [name, sz, offset] of layout) {
        gl.enableVertexAttribArray(parts.a[name]);
        gl.vertexAttribPointer(parts.a[name], sz, gl.FLOAT, false, stride * 4, offset * 4);
      }
      gl.uniform1f(parts.u.u_t, flight);
      gl.uniform1f(parts.u.u_spread, SPREAD);
      gl.uniform1f(parts.u.u_unit, canvas.width / STAGE.w);
      gl.uniform1f(parts.u.u_size, size);
      gl.uniform1f(parts.u.u_spin, 0.8);
      gl.uniform1f(parts.u.u_swirl, 95);
      gl.uniform1f(parts.u.u_alpha, alpha);
      gl.uniform1f(parts.u.u_show, show);
      gl.uniform2f(parts.u.u_res, STAGE.w, STAGE.h);
      gl.uniform2f(parts.u.u_center, CX, CY);
      gl.drawArrays(gl.POINTS, 0, n);
      for (const [name] of layout) gl.disableVertexAttribArray(parts.a[name]);
    };

    const render = (t: number) => {
      const wash = easeInOut(prog(t, T.wash));
      const swap = prog(t, T.swap);
      const show = easeInOut(prog(t, T.reveal));
      const particles = swap * (1 - prog(t, T.fade));
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (swap < 1) drawQuad(logoTex, o.logo.rect, 0, 1, wash, 1 - easeOut(swap));
      if (show > 0) o.targets.forEach((target, i) => drawQuad(targetTex[i], target.rect, 1, show, 0, 1));
      if (particles > 0) drawParticles(prog(t, T.flight), show, particles);
    };

    render(0);
    o.onStart();
    let t = 0;
    let last = performance.now();
    let done = false;
    const tick = (now: number) => {
      if (cancelled || finished) return;
      // Capped steps: a hidden tab pauses the reveal instead of skipping it.
      t += Math.min(0.05, (now - last) / 1000) * SPEED;
      last = now;
      if (t >= T.end) {
        render(T.end);
        finish();
        return;
      }
      render(t);
      glowAt.forEach((at, i) => t >= at && glow(i));
      if (!done && t >= T.done) {
        done = true;
        o.onDone();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  };

  setup().catch(() => {
    if (!cancelled) finish();
  });

  return () => {
    cancelled = true;
    release();
  };
}
