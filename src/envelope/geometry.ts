import * as THREE from 'three';
import { ENV } from './config';

export const V = (x: number, y: number) => new THREE.Vector2(x, y);

const toward = (a: THREE.Vector2, b: THREE.Vector2, d: number) => {
  const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy);
  return V(a.x + (dx / l) * d, a.y + (dy / l) * d);
};

/** Triangle with a softly rounded tip: envelope flaps. */
export function tri(a: THREE.Vector2, tip: THREE.Vector2, b: THREE.Vector2, r: number) {
  const s = new THREE.Shape();
  const A = toward(tip, a, r), B = toward(tip, b, r);
  s.moveTo(a.x, a.y);
  s.lineTo(A.x, A.y);
  s.quadraticCurveTo(tip.x, tip.y, B.x, B.y);
  s.lineTo(b.x, b.y);
  s.closePath();
  return s;
}

export function rect(w: number, h: number) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, -h / 2);
  s.lineTo(w / 2, -h / 2);
  s.lineTo(w / 2, h / 2);
  s.lineTo(-w / 2, h / 2);
  s.closePath();
  return s;
}

/** Thin paper sheet with a hairline bevel so edges catch the light. */
export const paper = (shape: THREE.Shape, depth: number = ENV.T, bevel = 0.0012) =>
  new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 28 });

/** Wax seal: an irregular poured disc, plus left/right halves that share one jagged crack. */
export function sealGeometries() {
  const R = ENV.SR;
  const n = 96;
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = R * (1 + 0.05 * Math.sin(3 * a + 1) + 0.035 * Math.sin(7 * a + 2) + 0.02 * Math.sin(13 * a) + 0.06 * Math.max(0, Math.sin(a * 2 - 2.4)) ** 6);
    pts.push(V(Math.cos(a) * rr, Math.sin(a) * rr));
  }
  const top = pts[n / 4], bot = pts[(3 * n) / 4];
  const crack: THREE.Vector2[] = [];
  for (let i = 1; i < 9; i++) {
    const t = i / 9;
    crack.push(V((i % 2 ? 1 : -1) * (0.008 + 0.012 * Math.sin(i * 1.7)), top.y + (bot.y - top.y) * t));
  }
  const left: THREE.Vector2[] = [], right: THREE.Vector2[] = [];
  for (let i = n / 4; i <= (3 * n) / 4; i++) left.push(pts[i]);
  left.push(...crack.slice().reverse());
  for (let i = (3 * n) / 4; i <= n + n / 4; i++) right.push(pts[i % n]);
  right.push(...crack);
  const o = { depth: 0.016, bevelEnabled: true, bevelThickness: 0.014, bevelSize: 0.016, bevelSegments: 8, curveSegments: 12 };
  return {
    whole: new THREE.ExtrudeGeometry(new THREE.Shape(pts), o),
    left: new THREE.ExtrudeGeometry(new THREE.Shape(left), o),
    right: new THREE.ExtrudeGeometry(new THREE.Shape(right), o),
  };
}
