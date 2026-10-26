// The homepage hero's background: Sam's logo, drawn faintly, washes into a
// new colour from the bottom up behind a burning gold edge (the opening of
// the result reveal, without the brushstrokes). One quad, drawn only while a
// wash runs, so it costs nothing between colours. Loaded on demand by
// LensCycle.

import { compile, FRAGMENT_PRECISION, hexRgb, loadImage, NOISE, paintLuma, readPixels } from "./gl-common";

export interface LogoWash {
  // Resolves once the logo has turned this colour.
  washTo: (hex: string) => Promise<void>;
  destroy: () => void;
}

export interface LogoWashOptions {
  // How strongly the logo shows (matches the static image underneath).
  alpha: number;
  // How strongly the gold edge shows as it passes.
  edge: number;
}

const WASH_MS = 1900;

const VS = `
attribute vec2 a_q;
varying vec2 v_uv;
void main(){ v_uv = a_q; gl_Position = vec4(a_q.x * 2. - 1., 1. - a_q.y * 2., 0., 1.); }`;

// from: the colour it has now (or the logo's own colours, u_fromLogo = 1);
// to: the colour the wash brings in.
const FS = FRAGMENT_PRECISION + NOISE + `
uniform sampler2D u_tex; uniform float u_wash, u_alpha, u_edge, u_lg, u_fromLogo, u_seed; uniform vec3 u_from, u_to;
varying vec2 v_uv;
// Light strokes take the colour itself and dark ones a deeper shade of it
// (not near-black), so the colour still reads when the logo is this faint.
vec3 tint(vec3 rgb, vec3 hex){ return clamp(hex * mix(.6, 1., clamp(dot(rgb, vec3(.299, .587, .114)) / u_lg, 0., 1.)), 0., 1.); }
void main(){
  vec4 c = texture2D(u_tex, v_uv);
  if (c.a < .002) discard;
  vec3 rgb = c.rgb / c.a;
  vec3 base = mix(tint(rgb, u_from), rgb, u_fromLogo);
  float w = reveal(v_uv, u_wash, vec2(4., 7.), u_seed, .035, 1.);
  float edge = 1. - abs(w * 2. - 1.);
  float a = c.a * u_alpha;
  float g = c.a * edge * u_edge;
  vec3 col = mix(base, tint(rgb, u_to), w) * a;
  gl_FragColor = vec4(col * (1. - g) + vec3(1., .8, .38) * g, a + g * (1. - a));
}`;

const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

export async function createLogoWash(container: HTMLElement, src: string, options: LogoWashOptions): Promise<LogoWash | null> {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return null;
  const giveUp = () => {
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  };

  let img: HTMLImageElement;
  let program: ReturnType<typeof compile>;
  try {
    img = await loadImage(src);
    program = compile(gl, VS, FS);
  } catch {
    return giveUp();
  }
  const buffer = gl.createBuffer();
  const texture = gl.createTexture();
  if (!buffer || !texture) return giveUp();

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const lg = paintLuma(readPixels(img));

  let from: [number, number, number] | null = null;
  let to: [number, number, number] = [0, 0, 0];
  let progress = 0;
  let seed = 3.7;
  let raf = 0;
  let dead = false;
  let settleCurrent: (() => void) | null = null;

  const render = () => {
    if (dead) return;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(program.a.a_q);
    gl.vertexAttribPointer(program.a.a_q, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(program.u.u_tex, 0);
    gl.uniform1f(program.u.u_wash, progress);
    gl.uniform1f(program.u.u_alpha, options.alpha);
    gl.uniform1f(program.u.u_edge, options.edge);
    gl.uniform1f(program.u.u_lg, lg);
    gl.uniform1f(program.u.u_seed, seed);
    gl.uniform1f(program.u.u_fromLogo, from ? 0 : 1);
    gl.uniform3fv(program.u.u_from, from ?? to);
    gl.uniform3fv(program.u.u_to, to);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(container.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(container.clientHeight * dpr));
    render();
  };
  const observer = new ResizeObserver(resize);

  const destroy = () => {
    if (dead) return;
    cancelAnimationFrame(raf);
    observer.disconnect();
    settleCurrent?.();
    if (!gl.isContextLost()) {
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program.program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
    dead = true;
    canvas.remove();
  };
  canvas.addEventListener("webglcontextlost", destroy);

  const washTo = (hex: string) =>
    new Promise<void>((resolve) => {
      if (dead) return resolve();
      // A wash still running finishes at once, so the next starts cleanly.
      settleCurrent?.();
      cancelAnimationFrame(raf);
      to = hexRgb(hex);
      progress = 0;
      seed = 1 + Math.random() * 40;
      const started = performance.now();
      const finish = () => {
        settleCurrent = null;
        from = to;
        progress = 0;
        render();
        resolve();
      };
      settleCurrent = finish;
      const tick = (now: number) => {
        const t = Math.min(1, (now - started) / WASH_MS);
        progress = easeInOut(t);
        if (t >= 1) return finish();
        render();
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });

  container.appendChild(canvas);
  resize();
  observer.observe(container);
  return { washTo, destroy };
}
