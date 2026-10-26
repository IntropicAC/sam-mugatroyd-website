// WebGL pieces shared by the result reveal (reveal-engine.ts) and the
// homepage logo wash (logo-wash.ts).

export const luma = (r: number, g: number, b: number) => 0.299 * r + 0.587 * g + 0.114 * b;
export const hexRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];

export const NOISE = `
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y); }
float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 4; i++) { v += a * vnoise(p); p = p * 2.03 + 17.1; a *= .5; } return v; }
// A wipe with a ragged, brushy edge. p runs 0..1; up = 1 wipes bottom to top.
float reveal(vec2 uv, float p, vec2 ns, float seed, float soft, float up){
  float base = mix(uv.y, 1. - uv.y, up);
  float k = mix(base, fbm(uv * ns + seed), .45);
  float pp = p * (1. + 2. * soft + .1) - soft - .05;
  return smoothstep(k - soft, k + soft, pp);
}`;

export const FRAGMENT_PRECISION = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
`;

export type Program = { program: WebGLProgram; u: Record<string, WebGLUniformLocation | null>; a: Record<string, number> };

export function compile(gl: WebGLRenderingContext, vs: string, fs: string): Program {
  const shader = (type: number, source: string) => {
    const s = gl.createShader(type);
    if (!s) throw new Error("Could not create shader");
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "Shader error");
    return s;
  };
  const program = gl.createProgram();
  if (!program) throw new Error("Could not create program");
  gl.attachShader(program, shader(gl.VERTEX_SHADER, vs));
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "Link error");
  const u: Program["u"] = {};
  const a: Program["a"] = {};
  for (let i = 0; i < gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS); i++) {
    const name = gl.getActiveUniform(program, i)?.name;
    if (name) u[name] = gl.getUniformLocation(program, name);
  }
  for (let i = 0; i < gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES); i++) {
    const name = gl.getActiveAttrib(program, i)?.name;
    if (name) a[name] = gl.getAttribLocation(program, name);
  }
  return { program, u, a };
}

export async function loadImage(src: string) {
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  await img.decode();
  return img;
}

export function readPixels(img: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("No 2D canvas");
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

// The logo's green paint (a light percentile of its solid strokes), so its
// light and dark strokes carry into a new colour.
export function paintLuma(px: ImageData) {
  const lumas: number[] = [];
  for (let i = 0; i < px.data.length; i += 4 * 7) {
    if (px.data[i + 3] > 230) lumas.push(luma(px.data[i] / 255, px.data[i + 1] / 255, px.data[i + 2] / 255));
  }
  lumas.sort((a, b) => a - b);
  return lumas[Math.floor(lumas.length * 0.9)] || 0.3;
}
