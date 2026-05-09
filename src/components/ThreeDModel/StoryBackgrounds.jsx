// StoryBackgrounds.jsx — Per-floor fullscreen shader backgrounds
// Each floor maps to an emotional beat with a living, breathing shader.
// Floor 7 REFLECTION: Evil Eye — the act of watching yourself (solar-surface fire).
"use client";
import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ─── Noise Texture Generator (FBM, 256×256) ───────────────────────
// Generates a tileable noise texture for shader sampling (Evil Eye style).

function generateNoiseData(size = 256) {
  const data = new Uint8Array(size * size * 4);

  function hash(x, y, s) {
    let n = x * 374761393 + y * 668265263 + s * 1274126177;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  function noise(px, py, freq, seed) {
    const fx = (px / size) * freq;
    const fy = (py / size) * freq;
    const ix = Math.floor(fx);
    const iy = Math.floor(fy);
    const tx = fx - ix;
    const ty = fy - iy;
    const w = freq | 0;
    const wrap = (v) => ((v % w) + w) % w;
    const v00 = hash(wrap(ix), wrap(iy), seed);
    const v10 = hash(wrap(ix + 1), wrap(iy), seed);
    const v01 = hash(wrap(ix), wrap(iy + 1), seed);
    const v11 = hash(wrap(ix + 1), wrap(iy + 1), seed);
    return v00 * (1 - tx) * (1 - ty) + v10 * tx * (1 - ty) + v01 * (1 - tx) * ty + v11 * tx * ty;
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = 0;
      let amp = 0.4;
      let totalAmp = 0;
      for (let o = 0; o < 8; o++) {
        const f = 32 * (1 << o);
        v += amp * noise(x, y, f, o * 31);
        totalAmp += amp;
        amp *= 0.65;
      }
      v /= totalAmp;
      v = (v - 0.5) * 2.2 + 0.5;
      v = Math.max(0, Math.min(1, v));
      const val = Math.round(v * 255);
      const i = (y * size + x) * 4;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = 255;
    }
  }
  return data;
}

// ─── Shared Vertex Shader ──────────────────────────────────────────
const COMMON_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ─── Fragment Shaders ────────────────────────────────────────────────

// Floor 1: AWAKENING — "seseorang terbangun, dunia tak lagi terasa sama"
// Dawn aurora: soft light breaking through darkness. Stillness before motion.
const FRAG_AWAKENING = `
precision highp float;
uniform float uTime;
uniform float uOpacity;
uniform vec2 uResolution;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float t = uTime * 0.25;

  // Aurora bands — like the first light seeping through
  float wave1 = sin(uv.x * 2.5 + t) * 0.5 + 0.5;
  float wave2 = sin(uv.x * 4.0 - t * 1.1 + 1.5) * 0.5 + 0.5;
  float wave3 = sin(uv.x * 6.5 + t * 0.6 + 3.0) * 0.5 + 0.5;

  float mask = smoothstep(0.2, 0.85, uv.y);
  float aurora = (wave1 * 0.45 + wave2 * 0.35 + wave3 * 0.20) * mask * 0.55;

  // Deep night to dawn: indigo → rose gold → black base
  vec3 skyBottom = vec3(0.015, 0.01, 0.04);
  vec3 skyMid = vec3(0.06, 0.03, 0.10);
  vec3 auroraColor = mix(
    vec3(0.55, 0.25, 0.12),
    vec3(0.18, 0.08, 0.45),
    wave2
  );

  vec3 color = mix(skyBottom, skyMid, uv.y);
  color += auroraColor * aurora;

  // Horizon: first warmth of day
  float horizon = exp(-pow((uv.y - 0.12) * 5.0, 2.0));
  color += vec3(0.5, 0.22, 0.07) * horizon * 0.25;

  // Subtle vignette
  float vig = 1.0 - length((uv - 0.5) * 1.2);
  vig = clamp(vig, 0.0, 1.0);
  color *= vig * 0.7 + 0.3;

  gl_FragColor = vec4(color, uOpacity * 0.75);
}
`;

// Floor 2: AKSA — "ia dikenal sebagai sosok yang menyala"
// Radiant energy: confident starburst. Gold and power.
const FRAG_AKSA = `
precision highp float;
uniform float uTime;
uniform float uOpacity;
uniform vec2 uResolution;

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution) / uResolution.y;
  float t = uTime * 0.45;

  float dist = length(uv);
  float angle = atan(uv.y, uv.x);

  // Radial energy rings
  float ring1 = sin(dist * 10.0 - t * 2.5) * 0.5 + 0.5;
  float ring2 = sin(dist * 15.0 - t * 3.5 + 1.2) * 0.5 + 0.5;
  float pulse = sin(t * 1.8) * 0.1 + 0.9;

  // Angular vision rays — persona that illuminates
  float rays = sin(angle * 8.0 + t * 0.5) * 0.5 + 0.5;
  rays *= smoothstep(0.9, 0.1, dist);

  float energy = (ring1 * 0.4 + ring2 * 0.3 + rays * 0.3) * pulse;
  energy *= smoothstep(1.4, 0.0, dist);

  // Warm gold → bright white
  vec3 color = mix(
    vec3(0.7, 0.45, 0.1),
    vec3(1.0, 0.92, 0.78),
    energy
  ) * energy * 0.55;

  gl_FragColor = vec4(color, uOpacity * 0.65);
}
`;

// Floor 3: TIME — "waktu tak selalu bersahabat, berjalan tanpa arah"
const FRAG_TIME = `
precision highp float;
uniform float uTime;
uniform float uOpacity;
uniform vec2 uResolution;

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution) / uResolution.y;
  float t = uTime * 0.8;

  float angle = atan(uv.y, uv.x);
  float dist = length(uv);

  float hand1 = 1.0 - smoothstep(0.0, 0.025, abs(sin(angle - t * 0.4)));
  float hand2 = 1.0 - smoothstep(0.0, 0.012, abs(sin(angle - t * 0.06 + 1.5)));

  float rings = sin(dist * 22.0 - t * 0.2) * 0.5 + 0.5;
  rings *= smoothstep(1.6, 0.0, dist) * 0.15;

  float clock = (hand1 * 0.55 + hand2 * 0.35) * smoothstep(1.1, 0.0, dist);
  clock += rings;

  vec3 color = mix(
    vec3(0.35, 0.22, 0.08),
    vec3(0.18, 0.15, 0.12),
    dist * 0.7
  ) * clock * 0.45;
  color += vec3(0.018, 0.012, 0.005);

  gl_FragColor = vec4(color, uOpacity * 0.5);
}
`;

// Floor 4: STUCK — "seperti lumpur, makin mencoba bergerak, makin tenggelam"
const FRAG_STUCK = `
precision highp float;
uniform float uTime;
uniform float uOpacity;
uniform vec2 uResolution;

float random(vec2 st) {
  return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float t = uTime;

  float scanline = sin(uv.y * 500.0) * 0.035;

  float glitchBand = step(0.97, random(vec2(floor(uv.y * 50.0), floor(t * 10.0))));
  float glitchOffset = glitchBand * (random(vec2(t * 0.5, uv.y)) - 0.5) * 0.12;
  vec2 glitchUv = vec2(uv.x + glitchOffset, uv.y);

  float noise = random(glitchUv * vec2(t * 0.08, 1.2)) * 0.12;

  float r = random(glitchUv + vec2(0.012, 0.0) + t * 0.008) * 0.28;
  float g = random(glitchUv + t * 0.008) * 0.12;
  float b = random(glitchUv - vec2(0.012, 0.0) + t * 0.008) * 0.22;

  float bars = sin(uv.y * 60.0 + t * 6.0) * 0.5 + 0.5;
  bars = step(0.72, bars) * 0.07;

  vec3 color = vec3(r + scanline, g + scanline, b + scanline);
  color += noise * 0.28;
  color += bars * vec3(0.25, 0.08, 0.35);
  color *= vec3(0.35, 0.18, 0.42);

  gl_FragColor = vec4(color, uOpacity * 0.65);
}
`;

// Floor 5: TEST — "datang ujian itu. Bukan bencana besar, tapi cukup untuk menyentaknya."
const FRAG_TEST = `
precision highp float;
uniform float uTime;
uniform float uOpacity;
uniform vec2 uResolution;

float random(vec2 st) {
  return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution) / uResolution.y;
  float t = uTime;

  float dist = abs(uv.x - sin(uv.y * 4.0 + t * 3.0) * 0.18 * (1.0 - uv.y * 0.5));
  float bolt1 = smoothstep(0.028, 0.0, dist) * smoothstep(-0.6, 1.2, uv.y);

  float dist2 = abs(uv.x + 0.25 - sin(uv.y * 5.5 + t * 4.0 + 1.2) * 0.12);
  float bolt2 = smoothstep(0.018, 0.0, dist2) * smoothstep(-0.4, 0.9, uv.y);

  float flash = sin(t * 5.0) * 0.5 + 0.5;
  flash = pow(flash, 5.0) * 0.12;

  float branch = 0.0;
  for(int i = 0; i < 4; i++) {
    float fi = float(i);
    float bx = uv.x - 0.08 * fi - sin(uv.y * 6.0 + t + fi * 0.8) * 0.09;
    branch += smoothstep(0.012, 0.0, abs(bx)) * smoothstep(0.05 + fi * 0.12, 0.65, uv.y) * 0.28;
  }

  float lightning = bolt1 + bolt2 * 0.65 + branch;
  vec3 color = vec3(0.85, 0.9, 1.0) * lightning;
  color += vec3(0.02, 0.02, 0.05) * flash;
  color += vec3(0.015, 0.015, 0.03) * random(vec2(floor(t * 12.0), 0.0));

  gl_FragColor = vec4(color, uOpacity * 0.75);
}
`;

// Floor 6: REALIZE — "ia sadar: ia tidak lagi siap"
const FRAG_REALIZE = `
precision highp float;
uniform float uTime;
uniform float uOpacity;
uniform vec2 uResolution;

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution) / uResolution.y;
  float t = uTime * 0.35;

  float v = 0.0;
  v += sin(uv.x * 2.8 + t);
  v += sin((uv.y * 2.8 + t) * 0.65);
  v += sin((uv.x * 2.0 + uv.y * 2.8 + t) * 0.45);
  v += sin(length(uv * 3.5 + vec2(sin(t * 0.25), cos(t * 0.18))) * 1.8);
  v *= 0.25;

  vec3 color = vec3(
    sin(v * 3.14 + 0.0) * 0.12 + 0.04,
    sin(v * 3.14 + 2.0) * 0.18 + 0.07,
    sin(v * 3.14 + 4.0) * 0.22 + 0.11
  );

  float vig = 1.0 - length(uv) * 0.55;
  color *= clamp(vig, 0.0, 1.0);

  gl_FragColor = vec4(color, uOpacity * 0.55);
}
`;

// Floor 7: REFLECTION — Evil Eye (Solar Surface Fire)
// Ported from reactbits OGL shader to Three.js ShaderMaterial.
// Active, living flame on the iris surface. Pupil tracks mouse.
const FRAG_REFLECTION = `
precision highp float;
uniform float uTime;
uniform float uOpacity;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform sampler2D uNoiseTexture;

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / uResolution.y;
  uv /= 0.8; // scale
  float ft = uTime * 1.0; // flame speed

  float polarRadius = length(uv) * 2.0;
  float polarAngle = (2.0 * atan(uv.x, uv.y)) / 6.28 * 0.3;
  vec2 polarUv = vec2(polarRadius, polarAngle);

  // Sample noise at different scales for layered flame texture
  vec4 noiseA = texture2D(uNoiseTexture, polarUv * vec2(0.2, 7.0) + vec2(-ft * 0.1, 0.0));
  vec4 noiseB = texture2D(uNoiseTexture, polarUv * vec2(0.3, 4.0) + vec2(-ft * 0.2, 0.0));
  vec4 noiseC = texture2D(uNoiseTexture, polarUv * vec2(0.1, 5.0) + vec2(-ft * 0.1, 0.0));

  float distanceMask = 1.0 - length(uv);

  // Inner ring — the iris flame
  float irisWidth = 0.25;
  float innerRing = clamp(-1.0 * ((distanceMask - 0.7) / irisWidth), 0.0, 1.0);
  innerRing = (innerRing * distanceMask - 0.2) / 0.28;
  innerRing += noiseA.r - 0.5;
  innerRing *= 1.3;
  innerRing = clamp(innerRing, 0.0, 1.0);

  float outerRing = clamp(-1.0 * ((distanceMask - 0.5) / 0.2), 0.0, 1.0);
  outerRing = (outerRing * distanceMask - 0.1) / 0.38;
  outerRing += noiseC.r - 0.5;
  outerRing *= 1.3;
  outerRing = clamp(outerRing, 0.0, 1.0);

  innerRing += outerRing;

  // Inner eye — the depth
  float innerEye = distanceMask - 0.1 * 2.0;
  innerEye *= noiseB.r * 2.0;

  // Pupil with cursor tracking
  vec2 pupilOffset = uMouse * 1.0 * 0.12;
  vec2 pupilUv = uv - pupilOffset;
  float pupil = 1.0 - length(pupilUv * vec2(9.0, 2.3));
  pupil *= 0.6; // pupil size
  pupil = clamp(pupil, 0.0, 1.0);
  pupil /= 0.35;

  // Outer eye glow
  float outerEyeGlow = 1.0 - length(uv * vec2(0.5, 1.5));
  outerEyeGlow = clamp(outerEyeGlow + 0.5, 0.0, 1.0);
  outerEyeGlow += noiseC.r - 0.5;
  float outerBgGlow = outerEyeGlow;
  outerEyeGlow = pow(outerEyeGlow, 2.0);
  outerEyeGlow += distanceMask;
  outerEyeGlow *= 0.35; // glow intensity
  outerEyeGlow = clamp(outerEyeGlow, 0.0, 1.0);
  outerEyeGlow *= pow(1.0 - distanceMask, 2.0) * 2.5;

  // Background glow
  outerBgGlow += distanceMask;
  outerBgGlow = pow(outerBgGlow, 0.5);
  outerBgGlow *= 0.15;

  // Eye color — amber/orange fire
  vec3 eyeColor = vec3(1.0, 0.435, 0.216); // #FF6F37
  vec3 color = eyeColor * 1.5 * clamp(max(innerRing + innerEye, outerEyeGlow + outerBgGlow) - pupil, 0.0, 3.0);

  gl_FragColor = vec4(color, uOpacity * 0.9);
}
`;

// Floor 8: JOURNEY — "ia masih punya nyala. Dan itu cukup."
const FRAG_JOURNEY = `
precision highp float;
uniform float uTime;
uniform float uOpacity;
uniform vec2 uResolution;

float random(float x) {
  return fract(sin(x * 12.9898) * 43758.5453);
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution) / uResolution.y;
  float t = uTime;

  float angle = atan(uv.y, uv.x);
  float dist = length(uv);

  float streaks = 0.0;
  for(int i = 0; i < 16; i++) {
    float fi = float(i);
    float a = fi * 0.3927;
    float diff = abs(mod(angle - a + 3.14159, 6.28318) - 3.14159);
    float streak = smoothstep(0.05, 0.0, diff);
    streak *= smoothstep(0.0, 0.25, dist);
    streak *= (1.0 - smoothstep(0.4, 1.4, dist));
    float speed = fract(dist * 2.2 - t * (0.9 + random(fi) * 0.6));
    streak *= speed;
    streaks += streak * (0.4 + random(fi + 12.0) * 0.6);
  }

  vec3 color = mix(
    vec3(0.9, 0.55, 0.15),
    vec3(1.0, 0.85, 0.4),
    streaks
  ) * streaks * 0.35;
  color += vec3(0.018, 0.012, 0.006);

  float glow = exp(-dist * 2.5) * 0.18;
  float pulse = sin(t * 1.5) * 0.1 + 0.9;
  color += vec3(1.0, 0.7, 0.3) * glow * pulse;

  gl_FragColor = vec4(color, uOpacity * 0.65);
}
`;

// Floor 9: HOPE — "pilihan sadar untuk tidak menyerah"
const FRAG_HOPE = `
precision highp float;
uniform float uTime;
uniform float uOpacity;
uniform vec2 uResolution;

float random(vec2 st) {
  return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution) / uResolution.y;
  float t = uTime * 0.5;

  float particles = 0.0;
  for(int i = 0; i < 20; i++) {
    float fi = float(i);
    float px = (random(vec2(fi, 0.0)) - 0.5) * 2.2;
    float py = mod(random(vec2(0.0, fi)) * 3.5 - t * (0.25 + random(vec2(fi, 1.0)) * 0.22), 3.5) - 1.75;
    float size = 0.008 + random(vec2(fi, 2.0)) * 0.018;
    float d = length(uv - vec2(px, py));
    particles += smoothstep(size, 0.0, d) * (0.4 + random(vec2(fi, 3.0)) * 0.6);
  }

  float dist = length(uv);
  float warmGlow = exp(-dist * 1.2) * 0.4;
  float pulse = sin(t * 1.8) * 0.08 + 0.92;
  warmGlow *= pulse;

  float angle = atan(uv.y, uv.x);
  float rays = sin(angle * 10.0 + t * 0.4) * 0.5 + 0.5;
  rays *= exp(-dist * 1.8) * 0.2;

  vec3 color = vec3(1.0, 0.82, 0.45) * warmGlow;
  color += vec3(1.0, 0.9, 0.65) * particles * 0.5;
  color += vec3(1.0, 0.95, 0.85) * rays;

  gl_FragColor = vec4(color, uOpacity * 0.75);
}
`;

// ─── Shader Map ─────────────────────────────────────────────────────

const SHADER_MAP = {
  1: { frag: FRAG_AWAKENING, hasMouse: false, hasNoise: false },
  2: { frag: FRAG_AKSA, hasMouse: false, hasNoise: false },
  3: { frag: FRAG_TIME, hasMouse: false, hasNoise: false },
  4: { frag: FRAG_STUCK, hasMouse: false, hasNoise: false },
  5: { frag: FRAG_TEST, hasMouse: false, hasNoise: false },
  6: { frag: FRAG_REALIZE, hasMouse: false, hasNoise: false },
  7: { frag: FRAG_REFLECTION, hasMouse: true, hasNoise: true }, // Evil Eye — mouse + noise
  8: { frag: FRAG_JOURNEY, hasMouse: false, hasNoise: false },
  9: { frag: FRAG_HOPE, hasMouse: false, hasNoise: false },
};

// ─── BackgroundPlane ─────────────────────────────────────────────────

function BackgroundPlane({ fragmentShader, targetOpacity, hasMouse, hasNoise, mouseRef, noiseTexture }) {
  const meshRef = useRef();
  const currentOpacity = useRef(0);

  const material = useMemo(() => {
    const uniforms = {
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uResolution: { value: new THREE.Vector2(1920, 1080) },
    };
    if (hasMouse) {
      uniforms.uMouse = { value: new THREE.Vector2(0, 0) };
    }
    if (hasNoise && noiseTexture) {
      uniforms.uNoiseTexture = { value: noiseTexture };
    }
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      uniforms,
      vertexShader: COMMON_VERTEX,
      fragmentShader,
    });
  }, [fragmentShader, hasMouse, hasNoise, noiseTexture]);

  useFrame((state) => {
    if (!meshRef.current) return;
    material.uniforms.uTime.value = state.clock.elapsedTime;

    // Smooth opacity transition
    currentOpacity.current = THREE.MathUtils.lerp(
      currentOpacity.current,
      targetOpacity,
      0.055
    );
    material.uniforms.uOpacity.value = currentOpacity.current;

    const { width, height } = state.gl.domElement;
    material.uniforms.uResolution.value.set(width, height);

    // Mouse tracking for Evil Eye
    if (hasMouse && material.uniforms.uMouse && mouseRef?.current) {
      material.uniforms.uMouse.value.lerp(mouseRef.current, 0.06);
    }
  });

  return (
    <mesh ref={meshRef} renderOrder={-1} position={[0, 0, -15]}>
      <planeGeometry args={[50, 30]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────

export default function StoryBackgrounds({ activeFloorId, islandOpacity, mouseRef }) {
  // Generate noise texture once for all floors that need it
  const noiseTexture = useMemo(() => {
    const data = generateNoiseData(256);
    const tex = new THREE.DataTexture(data, 256, 256, THREE.RGBAFormat);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }, []);

  if (islandOpacity <= 0) return null;

  return (
    <group>
      {Object.entries(SHADER_MAP).map(([id, cfg]) => (
        <BackgroundPlane
          key={id}
          fragmentShader={cfg.frag}
          targetOpacity={activeFloorId === parseInt(id) ? 1 : 0}
          hasMouse={cfg.hasMouse}
          hasNoise={cfg.hasNoise}
          mouseRef={mouseRef}
          noiseTexture={cfg.hasNoise ? noiseTexture : null}
        />
      ))}
    </group>
  );
}
