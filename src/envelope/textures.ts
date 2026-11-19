import * as THREE from 'three';
import { BRAND, ENV } from './config';

/* Procedural textures drawn on canvas: kraft paper, letter paper, wax relief.
   Nothing is downloaded, so the whole scene ships as code. */

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

export const rng = (seed: number) => {
  let v = seed * 9301 + 49297;
  return () => (v = (v * 16807) % 2147483647) / 2147483647;
};

function noise(ctx: CanvasRenderingContext2D, size: number, cells: number, alpha: number, r: () => number) {
  const n = canvas(cells, cells);
  const nc = n.getContext('2d')!;
  const d = nc.createImageData(cells, cells);
  for (let i = 0; i < cells * cells; i++) {
    const v = (r() * 255) | 0;
    d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v;
    d.data[i * 4 + 3] = 255;
  }
  nc.putImageData(d, 0, 0);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(n, 0, 0, size, size);
  ctx.restore();
}

/** Height map (grey canvas) to tangent-space normal map. */
function normalFrom(src: HTMLCanvasElement, strength: number) {
  const w = src.width;
  const h = src.height;
  const sd = src.getContext('2d')!.getImageData(0, 0, w, h).data;
  const out = canvas(w, h);
  const oc = out.getContext('2d')!;
  const od = oc.createImageData(w, h);
  const d = od.data;
  const hv = (x: number, y: number) => sd[(((y + h) % h) * w + ((x + w) % w)) * 4] / 255;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const nx = (hv(x - 1, y) - hv(x + 1, y)) * strength;
      const ny = (hv(x, y + 1) - hv(x, y - 1)) * strength;
      const l = Math.hypot(nx, ny, 1);
      const i = (y * w + x) * 4;
      d[i] = (nx / l * 0.5 + 0.5) * 255;
      d[i + 1] = (ny / l * 0.5 + 0.5) * 255;
      d[i + 2] = (1 / l * 0.5 + 0.5) * 255;
      d[i + 3] = 255;
    }
  oc.putImageData(od, 0, 0);
  return out;
}

export function paperCanvases(base: string, seed: number) {
  const N = 1024;
  const r = rng(seed);
  const height = canvas(N, N);
  const hc = height.getContext('2d')!;
  hc.fillStyle = '#808080';
  hc.fillRect(0, 0, N, N);
  ([[6, 0.28], [24, 0.22], [96, 0.22], [384, 0.2]] as const).forEach(([c, a]) => noise(hc, N, c, a, r));
  for (let i = 0; i < 4200; i++) {
    // fibres
    const x = r() * N, y = r() * N, a = r() * Math.PI * 2, l = 4 + r() * 24;
    hc.strokeStyle = r() < 0.5 ? `rgba(255,255,255,${0.08 + r() * 0.2})` : `rgba(0,0,0,${0.06 + r() * 0.16})`;
    hc.lineWidth = 0.5 + r() * 1.2;
    hc.beginPath();
    hc.moveTo(x, y);
    hc.quadraticCurveTo(x + Math.cos(a + 0.7) * l * 0.5, y + Math.sin(a + 0.7) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l);
    hc.stroke();
  }
  const color = canvas(N, N);
  const cc = color.getContext('2d')!;
  cc.fillStyle = base;
  cc.fillRect(0, 0, N, N);
  cc.globalCompositeOperation = 'overlay';
  cc.globalAlpha = 0.42;
  cc.drawImage(height, 0, 0);
  return { color, height, normal: normalFrom(height, 5) };
}

export function waxNormalCanvas() {
  const N = 512;
  const c = canvas(N, N);
  const x = c.getContext('2d')!;
  const g = x.createRadialGradient(N / 2, N / 2, 0, N / 2, N / 2, N / 2);
  g.addColorStop(0, '#a0a0a0');
  g.addColorStop(0.7, '#707070');
  g.addColorStop(1, '#262626');
  x.fillStyle = g;
  x.fillRect(0, 0, N, N);
  x.fillStyle = 'rgba(0,0,0,.3)'; // pressed die
  x.beginPath();
  x.arc(N / 2, N / 2, N * 0.34, 0, Math.PI * 2);
  x.fill();
  x.shadowColor = '#fff';
  x.shadowBlur = 8;
  x.strokeStyle = 'rgba(255,255,255,.55)';
  x.lineWidth = 8;
  x.beginPath();
  x.arc(N / 2, N / 2, N * 0.34, 0, Math.PI * 2);
  x.stroke();
  // Stand-in for the S symbol: replace with the symbol artwork (drawImage of the SVG) when approved.
  x.fillStyle = 'rgba(255,255,255,.6)';
  x.font = 'italic 400 220px "Playfair Display", Georgia, serif';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText('S', N / 2, N / 2 + 10);
  x.shadowBlur = 0;
  noise(x, N, 96, 0.1, rng(3));
  return normalFrom(c, 7);
}

export type LetterCopy = { kicker: string; title: string; body: string };

export function letterCanvas(copy: LetterCopy, paperHeight: HTMLCanvasElement) {
  const cw = 2048;
  const ch = Math.round((cw * ENV.LH) / ENV.LW);
  const c = canvas(cw, ch);
  const x = c.getContext('2d')! as CanvasRenderingContext2D & { letterSpacing?: string };
  x.fillStyle = BRAND.parchment;
  x.fillRect(0, 0, cw, ch);
  x.globalCompositeOperation = 'soft-light';
  x.globalAlpha = 0.35;
  x.drawImage(paperHeight, 0, 0, cw, cw);
  x.globalCompositeOperation = 'source-over';
  x.globalAlpha = 1;
  const pad = cw * 0.085;
  x.fillStyle = BRAND.carbon;
  x.font = '500 34px Poppins, Arial, sans-serif';
  x.letterSpacing = '5px';
  x.fillText(copy.kicker.toUpperCase(), pad, pad + 40);
  x.font = '400 132px "Playfair Display", Georgia, serif';
  x.letterSpacing = '0px';
  x.fillText(copy.title, pad, pad + 220);
  x.fillStyle = BRAND.antiqueBrass;
  x.fillRect(pad, pad + 290, cw - pad * 2, 3);
  x.fillStyle = BRAND.carbon;
  x.font = '400 42px Poppins, Arial, sans-serif';
  // wrap the body to about 60% of the sheet
  const max = cw * 0.62;
  const lines: string[] = [];
  let line = '';
  for (const word of copy.body.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (x.measureText(next).width > max && line) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  lines.slice(0, 6).forEach((l, i) => x.fillText(l, pad, pad + 390 + i * 66));
  return c;
}

/** Canvas → texture. World-mapped textures cover the whole envelope in shape coordinates. */
export function toTexture(c: HTMLCanvasElement, opts: { srgb?: boolean; worldSpan?: number; anisotropy?: number } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (opts.srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = opts.anisotropy ?? 8;
  if (opts.worldSpan) {
    t.repeat.set(1 / opts.worldSpan, 1 / opts.worldSpan);
    t.offset.set(0.5, 0.5);
  }
  return t;
}

