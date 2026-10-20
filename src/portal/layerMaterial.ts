import { Color, ShaderMaterial, type Texture, Vector2, Vector4 } from 'three'

/**
 * One material per collage fragment.
 *
 * Colour management: textures are left as raw sRGB values and the renderer is
 * created with `flat` + `linear`, so pixels pass straight through and the cut-outs
 * match the static image (and each other) exactly.
 *
 * The reflective highlight is deliberately modest: a soft diagonal band (the one
 * entrance sweep) plus a faint glint that follows the pointer, applied only where
 * the material is already bright (foil, silver, crystal facets) and tinted toward
 * the brand's foil green.
 */
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  uniform float uBright;
  uniform float uReflect;
  uniform float uSweep;
  uniform vec2 uLight;       // pointer position in collage UV (v down)
  uniform float uLightAmt;   // 0 when there is no fine pointer
  uniform vec4 uRect;        // this fragment's rect in collage UV: x, y, w, h (v down)
  uniform vec3 uFoil;
  varying vec2 vUv;

  void main() {
    vec4 c = texture2D(uMap, vUv);
    if (c.a < 0.004) discard;

    vec3 rgb = c.rgb * uBright;

    if (uReflect > 0.0) {
      // Position in the whole collage, so the sweep travels continuously across fragments.
      vec2 p = vec2(uRect.x + vUv.x * uRect.z, uRect.y + (1.0 - vUv.y) * uRect.w);
      float lum = dot(c.rgb, vec3(0.299, 0.587, 0.114));
      float spec = smoothstep(0.42, 0.95, lum);

      float d = (p.x * 0.75 + p.y * 0.45) - uSweep;
      float band = exp(-d * d * 60.0);

      float glint = exp(-distance(p, uLight) * 5.0) * uLightAmt;

      vec3 tint = mix(vec3(1.0, 0.97, 0.92), uFoil * 1.18, 0.35 + 0.35 * sin(p.y * 38.0 + uLight.x * 5.0));
      rgb += tint * spec * uReflect * (band * 0.42 + glint * 0.3);
    }

    gl_FragColor = vec4(rgb, c.a * uOpacity);
  }
`

export type LayerUniforms = {
  uMap: { value: Texture }
  uOpacity: { value: number }
  uBright: { value: number }
  uReflect: { value: number }
  uSweep: { value: number }
  uLight: { value: Vector2 }
  uLightAmt: { value: number }
  uRect: { value: Vector4 }
  uFoil: { value: Color }
}

export function createLayerMaterial(map: Texture, rect: Vector4, reflect: number): ShaderMaterial {
  const uniforms: LayerUniforms = {
    uMap: { value: map },
    uOpacity: { value: 0 },
    uBright: { value: 1 },
    uReflect: { value: reflect },
    uSweep: { value: -1 },
    uLight: { value: new Vector2(0.5, 0.45) },
    uLightAmt: { value: 0 },
    uRect: { value: rect },
    uFoil: { value: new Color('#b8c4b6') },
  }
  return new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  })
}
