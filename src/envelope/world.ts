import * as THREE from 'three';
import gsap from 'gsap';
import { ENV, MATERIAL_COLOURS as C, LETTER_HANDOFF } from './config';
import { paper, rect, sealGeometries, tri, V } from './geometry';
import { letterCanvas, paperCanvases, rng, toTexture, waxNormalCanvas, type LetterCopy } from './textures';

/**
 * The envelope world: meshes, lights, particles and the choreography.
 * Framework-agnostic: React Three Fiber mounts `root`, calls `update()` every frame
 * and `play()` when the gate opens.
 */
export type EnvelopeWorld = ReturnType<typeof createEnvelopeWorld>;

export function createEnvelopeWorld(opts: { photo: THREE.Texture; letter: LetterCopy; anisotropy: number; pixelRatio: number; small: boolean }) {
  const { W, H, T, LW, LH, LZ, SR } = ENV;
  const root = new THREE.Group();
  const disposables: { dispose(): void }[] = [];
  const keep = <X extends { dispose(): void }>(x: X) => (disposables.push(x), x);

  /* ---------- materials ---------- */
  const kp = paperCanvases(C.kraft, 7);
  const kraft = keep(new THREE.MeshPhysicalMaterial({
    map: keep(toTexture(kp.color, { srgb: true, worldSpan: 2.4, anisotropy: opts.anisotropy })),
    normalMap: keep(toTexture(kp.normal, { worldSpan: 2.4, anisotropy: opts.anisotropy })),
    normalScale: V(0.7, 0.7), roughness: 0.88, sheen: 0.4, sheenRoughness: 0.75, sheenColor: new THREE.Color('#fff1dc'),
  }));
  const kraftIn = keep(kraft.clone());
  kraftIn.color = new THREE.Color(C.kraftInside);
  const lp = paperCanvases('#E5DDD0', 11);
  const letterMat = keep(new THREE.MeshPhysicalMaterial({
    map: keep(toTexture(letterCanvas(opts.letter, lp.height), { srgb: true, anisotropy: opts.anisotropy })),
    normalMap: keep(toTexture(lp.normal, { anisotropy: opts.anisotropy })),
    color: new THREE.Color('#cbc3b7'), normalScale: V(0.35, 0.35), roughness: 0.92, sheen: 0.15, sheenColor: new THREE.Color('#ffffff'), side: THREE.DoubleSide,
  }));
  const waxN = keep(toTexture(waxNormalCanvas(), { worldSpan: 2 * SR * 1.22 }));
  const waxMat = keep(new THREE.MeshPhysicalMaterial({
    color: C.wax, roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.28, normalMap: waxN, normalScale: V(1.1, 1.1),
    emissive: new THREE.Color(C.waxGlow), emissiveIntensity: 0,
  }));

  /* ---------- envelope ---------- */
  const mesh = (g: THREE.BufferGeometry, m: THREE.Material, z: number) => {
    keep(g);
    const o = new THREE.Mesh(g, m);
    o.position.z = z;
    o.castShadow = o.receiveShadow = true;
    return o;
  };
  const env = new THREE.Group();
  root.add(env);
  env.add(mesh(paper(rect(W, H)), kraftIn, -T));
  const letter = mesh(new THREE.PlaneGeometry(LW, LH), letterMat, LZ);
  env.add(letter);
  env.add(mesh(paper(tri(V(-W / 2, H / 2), V(0.03, -0.04), V(-W / 2, -H / 2), 0.1)), kraft, 0.016));
  env.add(mesh(paper(tri(V(W / 2, -H / 2), V(-0.03, -0.04), V(W / 2, H / 2), 0.1)), kraft, 0.017));
  env.add(mesh(paper(tri(V(W / 2, -H / 2), V(0, 0.05), V(-W / 2, -H / 2), 0.14)), kraft, 0.023));
  const flapPivot = new THREE.Group();
  flapPivot.position.set(0, H / 2, 0.03);
  env.add(flapPivot);
  flapPivot.add(mesh(paper(tri(V(-W / 2, 0), V(0, -0.6 * H), V(W / 2, 0), 0.12)), kraft, 0));
  const sg = sealGeometries();
  const seal = new THREE.Group();
  seal.position.set(0, H / 2 - 0.6 * H + 0.085, 0.049);
  env.add(seal);
  const sealWhole = mesh(sg.whole, waxMat, 0), halfL = mesh(sg.left, waxMat, 0), halfR = mesh(sg.right, waxMat, 0);
  seal.add(sealWhole, halfL, halfR);

  /* the photograph, far behind and out of focus */
  const backdrop = mesh(new THREE.PlaneGeometry(18, (18 * 1102) / 2048), keep(new THREE.MeshStandardMaterial({ map: opts.photo, color: '#7a726b', roughness: 1 })), -4);
  backdrop.position.set(0.6, -0.3, -4);
  backdrop.castShadow = false;
  root.add(backdrop);

  /* ---------- light ---------- */
  const key = new THREE.SpotLight('#ffe0bd', 88, 0, 0.52, 0.8, 2);
  key.position.set(-2.6, 3.2, 4.2);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0002;
  key.shadow.normalBias = 0.01;
  key.shadow.camera.near = 2;
  key.shadow.camera.far = 16;
  const rim = new THREE.DirectionalLight('#ffcf9e', 2);
  rim.position.set(3.5, 2.5, -2.5);
  const flash = new THREE.PointLight('#ffae6b', 0, 2.5, 2);
  root.add(key, key.target, rim, new THREE.HemisphereLight('#f5f1e9', '#24211f', 0.2), flash);

  /* ---------- dust drifting through the beam ---------- */
  const r = rng(5);
  const DN = opts.small ? 260 : 480;
  const dPos = new Float32Array(DN * 3), dSeed = new Float32Array(DN);
  for (let i = 0; i < DN; i++) {
    dPos.set([(r() - 0.5) * 7, (r() - 0.5) * 4.5, -2.5 + r() * 5], i * 3);
    dSeed[i] = r();
  }
  const dg = keep(new THREE.BufferGeometry());
  dg.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  dg.setAttribute('aSeed', new THREE.BufferAttribute(dSeed, 1));
  const dustU = { uTime: { value: 0 }, uPR: { value: opts.pixelRatio }, uOp: { value: 0 } };
  const dust = new THREE.Points(dg, keep(new THREE.ShaderMaterial({
    uniforms: dustU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `attribute float aSeed; uniform float uTime, uPR; varying float vA;
      void main(){ vec3 p = position; float t = uTime * (.04 + .05 * aSeed);
        p.y = mod(p.y + t + 2.25, 4.5) - 2.25; p.x += sin(uTime * .2 + aSeed * 40.) * .12; p.z += cos(uTime * .17 + aSeed * 31.) * .12;
        vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv;
        float beam = smoothstep(2.6, 0., abs(p.x * .8 + p.y * .6 + .3));
        vA = (.06 + .94 * beam) * (.35 + .65 * aSeed);
        gl_PointSize = (1. + aSeed * 2.2) * uPR * (6. / -mv.z); }`,
    fragmentShader: /* glsl */ `uniform float uOp; varying float vA;
      void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, .0, d);
        gl_FragColor = vec4(vec3(1., .82, .58) * a * vA * uOp * .42, 1.); }`,
  })));
  dust.frustumCulled = false;
  root.add(dust);

  /* ---------- sparks when the seal breaks ---------- */
  const SN = 160;
  const sVel = new Float32Array(SN * 3), sSeed = new Float32Array(SN);
  for (let i = 0; i < SN; i++) {
    const v = new THREE.Vector3(r() - 0.5, r() * 0.9 - 0.25, r() * 0.8 + 0.15).normalize().multiplyScalar(0.4 + r() * 1.7);
    sVel.set([v.x, v.y, v.z], i * 3);
    sSeed[i] = r();
  }
  const spg = keep(new THREE.BufferGeometry());
  spg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SN * 3), 3));
  spg.setAttribute('aVel', new THREE.BufferAttribute(sVel, 3));
  spg.setAttribute('aSeed', new THREE.BufferAttribute(sSeed, 1));
  const sparkU = { uT: { value: -1 }, uO: { value: new THREE.Vector3() }, uPR: { value: opts.pixelRatio } };
  const sparks = new THREE.Points(spg, keep(new THREE.ShaderMaterial({
    uniforms: sparkU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `attribute vec3 aVel; attribute float aSeed; uniform float uT, uPR; uniform vec3 uO; varying float vL;
      void main(){ float t = max(uT, 0.); vec3 p = uO + aVel * t * (1. - t * .45) + vec3(0., -.8, 0.) * t * t;
        vL = uT < 0. ? 0. : clamp(1. - t / (.35 + aSeed * .95), 0., 1.);
        vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv;
        gl_PointSize = (2. + aSeed * 4.5) * uPR * vL * (5. / -mv.z); }`,
    fragmentShader: /* glsl */ `varying float vL; void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, .0, d);
        vec3 c = mix(vec3(1., .42, .12), vec3(1., .88, .66), vL) * (1.2 + vL * 3.5); gl_FragColor = vec4(c * a * vL, 1.); }`,
  })));
  sparks.frustumCulled = false;
  root.add(sparks);

  /* ---------- state ---------- */
  const rig = { x: 0, y: 0, z: 5, tx: 0, ty: 0, tz: 0, sway: 1, shake: 0 };
  const focus = new THREE.Vector3();
  const halves = [
    { m: halfL, v: new THREE.Vector3(), w: new THREE.Vector3() },
    { m: halfR, v: new THREE.Vector3(), w: new THREE.Vector3() },
  ];
  let breakT = -1;

  function reset() {
    env.rotation.set(-0.85, 0.2, 0.24);
    flapPivot.rotation.x = 0;
    flapPivot.position.z = 0.03;
    seal.scale.setScalar(1);
    sealWhole.visible = true;
    halfL.visible = halfR.visible = false;
    halves.forEach((h) => { h.m.position.set(0, 0, 0); h.m.rotation.set(0, 0, 0); });
    letter.position.set(0, 0, LZ);
    sparkU.uT.value = -1;
    flash.intensity = 0;
    waxMat.emissiveIntensity = 0;
    dustU.uOp.value = 0;
    breakT = -1;
    rig.sway = 1;
    rig.shake = 0;
  }

  function breakSeal() {
    const p = new THREE.Vector3();
    seal.getWorldPosition(p);
    sealWhole.visible = false;
    halfL.visible = halfR.visible = true;
    halves[0].v.set(-0.55, 0.4, 0.95); halves[0].w.set(1.8, -1.2, 3.6);
    halves[1].v.set(0.6, 0.32, 0.9); halves[1].w.set(1.4, 1.5, -4.2);
    sparkU.uO.value.copy(p).z += 0.03;
    flash.position.copy(p).z += 0.3;
    breakT = 0;
  }

  const tanHalf = (cam: THREE.PerspectiveCamera) => Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
  const fit = (cam: THREE.PerspectiveCamera, w: number, h: number) => Math.max(h / 2 / tanHalf(cam), w / 2 / (tanHalf(cam) * cam.aspect));
  const cover = (cam: THREE.PerspectiveCamera, w: number, h: number) => Math.min(h / 2 / tanHalf(cam), w / 2 / (tanHalf(cam) * cam.aspect));

  /** The choreography. Returns a GSAP timeline so the host can kill or skip it. */
  function play(cam: THREE.PerspectiveCamera, onLetter: () => void) {
    reset();
    env.updateMatrixWorld(true);
    const sw = new THREE.Vector3();
    seal.getWorldPosition(sw);
    const normal = new THREE.Vector3(0, 0, 1).applyEuler(env.rotation);
    const p0 = sw.clone().addScaledVector(normal, 1.25).add(new THREE.Vector3(0.08, 0.05, 0));
    Object.assign(rig, { x: p0.x, y: p0.y, z: p0.z, tx: sw.x, ty: sw.y, tz: sw.z });
    const d1 = fit(cam, W * 1.3, H * 1.45);
    const d2 = fit(cam, W * 1.2, H * 2.2);
    const ly = H * 0.68;
    const out = { y: ly + 0.32, z: LZ + 0.5 };
    const dc = cam.aspect < LW / LH ? fit(cam, LW * 1.04, LH * 1.04) : cover(cam, LW, LH) * 0.86;
    return gsap.timeline()
      // 1. the envelope lifts out of the photograph and turns to face you
      .to(dustU.uOp, { value: 1, duration: 2.2 }, 0)
      .to(env.rotation, { x: 0, y: 0, z: 0, duration: 2.5, ease: 'power3.inOut' }, 0)
      .to(rig, { x: 0, y: 0.04, z: d1, tx: 0, ty: -0.02, tz: 0, duration: 2.5, ease: 'power3.inOut' }, 0)
      // 2. the seal strains, glows and cracks
      .to(seal.scale, { x: 1.07, y: 1.07, z: 1.07, duration: 0.2, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 2.4)
      .to(waxMat, { emissiveIntensity: 0.45, duration: 0.4, ease: 'power2.in' }, 2.4)
      .call(breakSeal, undefined, 2.82)
      .fromTo(flash, { intensity: 0 }, { intensity: 2.4, duration: 0.05, immediateRender: false }, 2.82)
      .to(flash, { intensity: 0, duration: 0.8, ease: 'power2.out' }, 2.87)
      .to(waxMat, { emissiveIntensity: 0, duration: 0.45 }, 2.82)
      .fromTo(rig, { shake: 1 }, { shake: 0, duration: 0.5, ease: 'power2.out', immediateRender: false }, 2.82)
      // 3. the flap swings open and the letter slides out
      .to(flapPivot.rotation, { x: -Math.PI - 0.14, duration: 1.2, ease: 'power2.inOut' }, 2.95)
      .to(flapPivot.position, { z: -0.007, duration: 0.4, ease: 'none' }, 3.5)
      .to(rig, { y: H * 0.12, z: d2, ty: H * 0.3, duration: 1.7, ease: 'power2.inOut' }, 3.1)
      .to(letter.position, { y: ly, duration: 1.4, ease: 'power3.out' }, 3.7)
      // 4. the letter lifts free and comes to you
      .to(letter.position, { y: out.y, z: out.z, duration: 1.3, ease: 'power2.inOut' }, 5.0)
      .to(rig, { x: 0, y: out.y, z: out.z + dc, tx: 0, ty: out.y, tz: out.z, sway: 0, duration: 1.45, ease: 'power3.inOut' }, 4.95)
      .call(onLetter, undefined, LETTER_HANDOFF);
  }

  /** Per-frame update: particles, falling wax and the handheld camera. */
  function update(cam: THREE.PerspectiveCamera, t: number, dt: number) {
    dustU.uTime.value = t;
    if (breakT >= 0) {
      breakT += dt;
      sparkU.uT.value = breakT;
      halves.forEach((h) => {
        if (!h.m.visible) return;
        h.m.position.addScaledVector(h.v, dt);
        h.v.y -= 4.4 * dt;
        h.m.rotation.x += h.w.x * dt;
        h.m.rotation.y += h.w.y * dt;
        h.m.rotation.z += h.w.z * dt;
      });
      if (breakT > 1.8) halfL.visible = halfR.visible = false;
    }
    const sh = rig.shake * 0.025;
    cam.position.set(
      rig.x + Math.sin(t * 0.6) * 0.012 * rig.sway + (Math.random() - 0.5) * sh,
      rig.y + Math.cos(t * 0.45) * 0.009 * rig.sway + (Math.random() - 0.5) * sh,
      rig.z,
    );
    focus.set(rig.tx, rig.ty, rig.tz);
    cam.lookAt(focus);
  }

  reset();
  return { root, play, reset, update, focus, dispose: () => disposables.forEach((d) => d.dispose()) };
}
