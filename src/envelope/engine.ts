/**
 * The envelope gate's WebGL engine (lazy-loaded chunk, plain three.js like nothing else
 * on the page needs it). Renderer, post-processing and render loop around the world in
 * world.ts. The page talks to it through EnvelopeEngine only.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { MATERIAL_COLOURS } from './config';
import { fontsReady } from './fonts';
import type { LetterCopy } from './textures';
import { createEnvelopeWorld } from './world';

export type EnvelopeEngine = {
  /** Runs the 3D sequence; `onLetter` fires when the letter fills the screen. Returns the timeline. */
  play: (onLetter: () => void) => ReturnType<ReturnType<typeof createEnvelopeWorld>['play']>;
  start: () => void;
  stop: () => void;
  reset: () => void;
  dispose: () => void;
};

export async function createEnvelopeEngine(host: HTMLElement, opts: { photoSrc: string; letter: LetterCopy; quality: 'high' | 'low' }): Promise<EnvelopeEngine> {
  await fontsReady();
  const small = opts.quality === 'low';
  const vw = () => window.innerWidth;
  const vh = () => window.innerHeight;
  const pr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);

  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(pr);
  renderer.setSize(vw(), vh(), false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap; // soft PCF in current three.js
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(MATERIAL_COLOURS.scene);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envMap;
  scene.environmentIntensity = 0.24;
  const camera = new THREE.PerspectiveCamera(35, vw() / vh(), 0.05, 60);

  const photo = await new THREE.TextureLoader().loadAsync(opts.photoSrc);
  photo.colorSpace = THREE.SRGBColorSpace;
  const world = createEnvelopeWorld({ photo, letter: opts.letter, anisotropy: renderer.capabilities.getMaxAnisotropy(), pixelRatio: pr, small });
  scene.add(world.root);

  /* post-processing: depth of field, bloom (sparks only), ACES, then a light filmic grade */
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: small ? 0 : 4 });
  const composer = new EffectComposer(renderer, target);
  composer.setPixelRatio(pr);
  composer.setSize(vw(), vh());
  composer.addPass(new RenderPass(scene, camera));
  const bokeh = small ? null : new BokehPass(scene, camera, { focus: 4, aperture: 0.0035, maxblur: 0.011 });
  if (bokeh) composer.addPass(bokeh);
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(vw(), vh()), 0.3, 0.55, 0.98));
  composer.addPass(new OutputPass());
  const grade = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uFringe: { value: small ? 0 : 0.012 } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: /* glsl */ `uniform sampler2D tDiffuse; uniform float uTime, uFringe; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){ vec2 d = vUv - .5; float k = dot(d, d) * uFringe;
        vec3 c = vec3(texture2D(tDiffuse, vUv - d * k).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv + d * k).b);
        float vig = smoothstep(.95, .2, length(d * vec2(1., 1.15))); c *= mix(.5, 1., vig);
        float lum = dot(c, vec3(.299, .587, .114));
        // grain mostly in the dark surround, kept off the bright paper and text
        c += (h(vUv * 1000. + fract(uTime) * 91.) - .5) * .07 * (1. - lum * .85);
        gl_FragColor = vec4(c, 1.); }`,
  });
  composer.addPass(grade);

  let running = false;
  let frame = 0;
  let last = 0;
  const render = (now: number) => {
    const t = now / 1000;
    const dt = Math.min(0.05, last ? t - last : 0.016);
    last = t;
    world.update(camera, t, dt);
    grade.uniforms.uTime.value = t;
    if (bokeh) (bokeh.uniforms as Record<string, THREE.IUniform>).focus.value = camera.position.distanceTo(world.focus);
    composer.render();
  };
  const loop = (now: number) => {
    if (!running) return;
    frame = requestAnimationFrame(loop);
    render(now);
  };
  const onResize = () => {
    camera.aspect = vw() / vh();
    camera.updateProjectionMatrix();
    renderer.setSize(vw(), vh(), false);
    composer.setSize(vw(), vh());
  };
  window.addEventListener('resize', onResize);

  // warm-up: compile shaders and draw one frame before anyone clicks
  camera.position.set(0, 0, 5);
  camera.lookAt(0, 0, 0);
  renderer.compile(scene, camera);
  render(performance.now());

  return {
    play: (onLetter) => world.play(camera, onLetter),
    start: () => {
      if (running) return;
      running = true;
      last = 0;
      frame = requestAnimationFrame(loop);
    },
    stop: () => {
      running = false;
      cancelAnimationFrame(frame);
    },
    reset: () => world.reset(),
    dispose: () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      world.dispose();
      photo.dispose();
      envMap.dispose();
      pmrem.dispose();
      composer.dispose();
      target.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
