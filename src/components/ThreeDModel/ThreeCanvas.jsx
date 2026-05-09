// component/ThreeDModel/ThreeCanvas.jsx
"use client";
import { Suspense, useRef, useEffect, useState, useMemo, useLayoutEffect } from "react";
import styles from "./style.module.css";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  useAnimations,
  Environment,
  Sparkles,
  PerspectiveCamera,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";
import { useSpring, a } from "@react-spring/three";
import { useIsMobile, useIsTablet } from "@/hooks/useMediaQuery";
import { Float } from "@react-three/drei";
import StoryBackgrounds from "./StoryBackgrounds";
// Native Three.js post-processing (avoids @react-three/postprocessing compatibility issues)
import { EffectComposer as ThreeEffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";

// 1. Atmospheric God Rays — per-floor mood-matched light beams
// Each floor gets intentional atmospheric light: color, intensity, and rotation
// that emotionally support the narrative beat.
const GOD_RAY_MOODS = {
  0: { opacity: 0.5,  color: "#8090b8", rotation: 0.15, strength: 0.4  }, // AWAKENING — cold dawn, uncertain
  1: { opacity: 0.7,  color: "#ffcc66", rotation: 0.2,  strength: 0.6  }, // AKSA — golden confidence
  2: { opacity: 0.25, color: "#c8a860", rotation: -0.1, strength: 0.3  }, // TIME — fading amber
  3: { opacity: 0.08, color: "#6655aa", rotation: 0.0,  strength: 0.15 }, // STUCK — suffocated, dim purple
  4: { opacity: 0.6,  color: "#ccddff", rotation: 0.3,  strength: 0.7  }, // TEST — cold lightning flash
  5: { opacity: 0.15, color: "#6688bb", rotation: 0.05, strength: 0.25 }, // REALIZE — dim blue clarity
  6: { opacity: 0.35, color: "#ff8844", rotation: -0.15,strength: 0.4  }, // REFLECTION — warm introspection
  7: { opacity: 0.55, color: "#ff6622", rotation: 0.25, strength: 0.55 }, // JOURNEY — ember warmth
  8: { opacity: 0.65, color: "#ffdd88", rotation: 0.2,  strength: 0.6  }, // HOPE — full golden rays
};

function StoryGodRays({ currentPart, opacity }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const targetColorRef = useRef(new THREE.Color("#ffffff"));
  
  const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      time: { value: 0 },
      uOpacity: { value: 0 },
      uColor: { value: new THREE.Color("#ffffff") },
      uStrength: { value: 0.5 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float time;
      uniform float uOpacity;
      uniform vec3 uColor;
      uniform float uStrength;
      
      void main() {
        // Multi-beam god rays with parallax depth
        float beam1 = smoothstep(0.38, 0.5, vUv.x) * smoothstep(0.62, 0.5, vUv.x);
        float beam2 = smoothstep(0.25, 0.32, vUv.x) * smoothstep(0.39, 0.32, vUv.x) * 0.4;
        float beam3 = smoothstep(0.65, 0.72, vUv.x) * smoothstep(0.79, 0.72, vUv.x) * 0.3;
        float beams = beam1 + beam2 + beam3;
        float fade = pow(1.0 - vUv.y, 1.8);
        float shimmer = sin(vUv.y * 12.0 + time * 1.5) * 0.08 + 0.92;
        float dust = sin(vUv.y * 40.0 + time * 3.0) * sin(vUv.x * 30.0 + time) * 0.04 + 0.96;
        float alpha = beams * fade * uOpacity * uStrength * shimmer * dust;
        gl_FragColor = vec4(uColor, alpha);
      }
    `
  }), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    shaderMaterial.uniforms.time.value = state.clock.elapsedTime;
    
    const mood = GOD_RAY_MOODS[currentPart] || GOD_RAY_MOODS[0];
    targetColorRef.current.set(mood.color);
    
    shaderMaterial.uniforms.uOpacity.value = THREE.MathUtils.lerp(
      shaderMaterial.uniforms.uOpacity.value,
      mood.opacity * opacity,
      0.04
    );
    shaderMaterial.uniforms.uStrength.value = THREE.MathUtils.lerp(
      shaderMaterial.uniforms.uStrength.value,
      mood.strength,
      0.04
    );
    shaderMaterial.uniforms.uColor.value.lerp(targetColorRef.current, 0.03);
    
    // Smooth rotation shift per mood
    if (groupRef.current) {
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z, mood.rotation, 0.02
      );
    }
  });

  return (
    <group ref={groupRef} rotation={[0, 0, 0.2]}>
      <mesh ref={meshRef} position={[0, 5, -5]} scale={[20, 30, 1]}>
        <planeGeometry />
        <primitive object={shaderMaterial} attach="material" />
      </mesh>
    </group>
  );
}

// 2. Story Particles — per-floor atmospheric motes
// Every floor has particles with mood-matched color, density, and speed.
const PARTICLE_MOODS = {
  0: { opacity: 0.20, color: "#8899bb", speed: 0.3, size: 8   }, // AWAKENING — slow silver dust, barely visible
  1: { opacity: 0.45, color: "#ffcc44", speed: 0.5, size: 12  }, // AKSA — warm golden motes, confident
  2: { opacity: 0.15, color: "#aa9966", speed: 0.8, size: 6   }, // TIME — small amber sand grains, rushing
  3: { opacity: 0.10, color: "#665588", speed: 0.15,size: 4   }, // STUCK — faint purple specks, nearly frozen
  4: { opacity: 0.50, color: "#aabbff", speed: 2.0, size: 3   }, // TEST — fast white sparks, electric
  5: { opacity: 0.18, color: "#6699cc", speed: 0.4, size: 10  }, // REALIZE — cold blue drifters
  6: { opacity: 0.35, color: "#ff7744", speed: 0.35,size: 14  }, // REFLECTION — large warm embers, contemplative
  7: { opacity: 0.50, color: "#ff5500", speed: 0.6, size: 11  }, // JOURNEY — bright ember sparks
  8: { opacity: 0.65, color: "#ffdd66", speed: 0.45,size: 16  }, // HOPE — big golden fireflies, full
};

function StoryParticles({ currentPart, opacity }) {
  const pointsRef = useRef();
  const targetColorRef = useRef(new THREE.Color("#ffffff"));
  
  const particleCount = 180;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 12;
        pos[i * 3 + 1] = Math.random() * 12 - 3;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
    }
    return pos;
  }, []);

  const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      time: { value: 0 },
      uOpacity: { value: 0 },
      uColor: { value: new THREE.Color("#ffffff") },
      uSpeed: { value: 0.5 },
      uSize: { value: 12.0 }
    },
    vertexShader: `
      uniform float time;
      uniform float uSpeed;
      uniform float uSize;
      varying float vOpacity;
      void main() {
        vec3 pos = position;
        pos.y += mod(time * uSpeed + position.y, 12.0) - 6.0;
        pos.x += sin(time * 0.7 + position.z * 0.8) * 0.3;
        pos.z += cos(time * 0.5 + position.x * 0.6) * 0.15;
        vOpacity = 1.0 - abs(pos.y / 6.0);
        vOpacity *= smoothstep(0.0, 0.3, vOpacity);
        gl_PointSize = (1.0 + sin(time * 0.8 + position.x) * 0.4) * uSize;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying float vOpacity;
      uniform float uOpacity;
      uniform vec3 uColor;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        // Softer falloff for more organic glow
        float glow = pow(1.0 - d * 2.0, 1.5);
        float finalAlpha = glow * vOpacity * uOpacity;
        gl_FragColor = vec4(uColor, finalAlpha);
      }
    `
  }), []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    shaderMaterial.uniforms.time.value = state.clock.elapsedTime;
    
    const mood = PARTICLE_MOODS[currentPart] || PARTICLE_MOODS[0];
    targetColorRef.current.set(mood.color);

    shaderMaterial.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        shaderMaterial.uniforms.uOpacity.value,
        mood.opacity * opacity,
        0.04
    );
    shaderMaterial.uniforms.uSpeed.value = THREE.MathUtils.lerp(
        shaderMaterial.uniforms.uSpeed.value, mood.speed, 0.03
    );
    shaderMaterial.uniforms.uSize.value = THREE.MathUtils.lerp(
        shaderMaterial.uniforms.uSize.value, mood.size, 0.03
    );
    shaderMaterial.uniforms.uColor.value.lerp(targetColorRef.current, 0.04);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
      </bufferGeometry>
      <primitive object={shaderMaterial} attach="material" />
    </points>
  );
}

// Local Fog component - kabut hanya di area floating island
function LocalFog({ opacity = 1, currentPart }) {
  const meshRef = useRef();

  const fogMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        uOpacity: { value: opacity },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          vPosition = position;
          vNormal = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float uOpacity;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        // Simplex noise function
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
        
        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy));
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m;
          m = m*m;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }
        
        void main() {
          // Animated fog
          float noise1 = snoise(vPosition.xz * 0.5 + time * 0.05);
          float noise2 = snoise(vPosition.xz * 1.0 + time * 0.03);
          float combinedNoise = (noise1 + noise2) * 0.5;
          
          // Fade based on height - more fog at bottom
          float heightFade = smoothstep(2.0, -1.0, vPosition.y);
          
          // Distance fade from center
          float dist = length(vPosition.xz);
          float distFade = smoothstep(3.5, 1.5, dist);
          
          float alpha = heightFade * distFade * (0.3 + combinedNoise * 0.2) * uOpacity;
          
          // Fog color - slightly bluish white
          vec3 fogColor = vec3(0.7, 0.75, 0.8);
          
          gl_FragColor = vec4(fogColor, alpha);
        }
      `,
    });
  }, []);

  useFrame((state) => {
    if (fogMaterial) {
      fogMaterial.uniforms.time.value = state.clock.elapsedTime;
      fogMaterial.uniforms.uOpacity.value = opacity;
    }
  });

  // Only show fog in part 0 (AWAKENING)
  if (currentPart !== 0) return null;

  return (
    <mesh ref={meshRef} position={[0, 0, -0.8]} material={fogMaterial}>
      <cylinderGeometry args={[3.5, 3.5, 4, 32, 1, true]} />
    </mesh>
  );
}

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPos;
  uniform float time;
  uniform float uGlitch;

  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  vec4 permute(vec4 x) {
       return mod289(((x*34.0)+1.0)*x);
  }
  float snoise(vec3 v)
    {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

    i = mod289(i);
    vec4 p = permute( permute( permute( 
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 1.0/7.0;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );

    vec4 x = x_ *ns.x + ns.y;
    vec4 y = y_ *ns.x + ns.y;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = inversesqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                  dot(p2,x2), dot(p3,x3) ));
    }

  void main() {
    vUv = uv;
    vNormal = normal;
    vPos = position;
    
    float noiseFreq1 = 1.5;
    float noiseFreq2 = 3.0;
    float noiseFreq3 = 6.0;
    
    float noise1 = snoise(vec3(position.x * noiseFreq1, position.y * noiseFreq1, position.z * noiseFreq1));
    float noise2 = snoise(vec3(position.x * noiseFreq2, position.y * noiseFreq2, position.z * noiseFreq2)) * 0.5;
    float noise3 = snoise(vec3(position.x * noiseFreq3, position.y * noiseFreq3, position.z * noiseFreq3)) * 0.25;
    
    float combinedNoise = noise1 + noise2 + noise3;
    
    // GLITCH EFFECT (for STUCK/TIME)
    float glitch = sin(time * 10.0) * uGlitch;
    
    float edgeFade = smoothstep(1.0, 0.9, abs(position.y));
    float heightFactor = 1.0 - smoothstep(-0.8, 0.5, position.y);
    float noiseAmp = (0.35 * heightFactor + 0.05) * edgeFade; 
    
    vec3 newPosition = position + normal * combinedNoise * noiseAmp;
    
    // Add glitch distortion
    newPosition.x += glitch * heightFactor * combinedNoise;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPos;

  // Simple hash for noise
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  // 3D noise
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    
    return mix(
      mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }

  // Fractal Brownian Motion for layered detail
  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for(int i = 0; i < 5; i++) {
      value += amplitude * noise(p * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
    float light = dot(normalize(vNormal), lightDir) * 0.5 + 0.5;

    // Generate detailed noise for texture variation
    float rockNoise = fbm(vPos * 3.0);
    float detailNoise = noise(vPos * 12.0);
    float cracksNoise = noise(vPos * 6.0);
    
    // ROCK/STONE COLORS (for sides and bottom)
    vec3 darkRock = vec3(0.15, 0.12, 0.10);      // Very dark brown-gray
    vec3 midRock = vec3(0.25, 0.22, 0.18);       // Medium brown-gray
    vec3 lightRock = vec3(0.35, 0.30, 0.25);     // Lighter brown
    vec3 mossyRock = vec3(0.18, 0.25, 0.15);     // Dark mossy green
    
    // Create layered rock texture
    vec3 rockBase = mix(darkRock, midRock, rockNoise);
    rockBase = mix(rockBase, lightRock, smoothstep(0.3, 0.7, rockNoise));
    
    // Add cracks and crevices
    float crackMask = smoothstep(0.45, 0.55, cracksNoise);
    rockBase = mix(rockBase * 0.5, rockBase, crackMask);
    
    // Add surface detail variation
    rockBase += vec3(detailNoise * 0.05);
    
    // GRASS COLORS (for top)
    vec3 grassDark = vec3(0.15, 0.35, 0.10);     // Dark grass
    vec3 grassMid = vec3(0.25, 0.50, 0.15);      // Medium grass
    vec3 grassLight = vec3(0.35, 0.60, 0.20);    // Light grass
    
    // Create grass texture with variation
    float grassNoise = fbm(vPos * 8.0);
    vec3 grassColor = mix(grassDark, grassMid, grassNoise);
    grassColor = mix(grassColor, grassLight, smoothstep(0.4, 0.8, grassNoise));
    
    // DIRT/SOIL transition color
    vec3 dirtColor = vec3(0.30, 0.22, 0.15);
    
    // Height-based blending
    float h = vPos.y;
    
    // Sharp grass zone on top (like the reference image)
    float grassStart = 0.5;
    float grassFull = 0.7;
    float grassMix = smoothstep(grassStart, grassFull, h);
    
    // Dirt transition zone
    float dirtStart = 0.2;
    float dirtMix = smoothstep(dirtStart, grassStart, h);
    
    // Moss on rocks (slight green tint on upper rocks)
    float mossMix = smoothstep(0.0, 0.4, h) * smoothstep(0.5, 0.7, rockNoise);
    vec3 rockWithMoss = mix(rockBase, mossyRock, mossMix * 0.3);
    
    // Final color blending: rock -> dirt -> grass
    vec3 baseColor = rockWithMoss;
    baseColor = mix(baseColor, dirtColor, dirtMix);
    baseColor = mix(baseColor, grassColor, grassMix);
    
    // Enhanced lighting with ambient occlusion
    float ao = smoothstep(-0.8, 0.6, h); // Darker at bottom
    vec3 color = baseColor * light * (0.6 + ao * 0.4);

    gl_FragColor = vec4(color, 1.0);
  }
`;


// ─── Instanced Flowers ("segala hal yang disentuhnya, tumbuh") ────────
// Flowers bloom outward from Aksa's position with distance-based ripple delay.
function FlowerInstances({ growthProgress, opacity }) {
  const meshRef = useRef();
  const dummyRef = useRef(new THREE.Object3D());
  const isMobile = useIsMobile();
  const count = isMobile ? 60 : 120;

  // Pre-compute flower positions and properties once
  const flowerData = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const r = 0.25 + Math.random() * 1.3;
      const theta = Math.random() * Math.PI * 2;
      data.push({
        x: r * Math.cos(theta),
        z: r * Math.sin(theta),
        y: 1.0,
        rotY: Math.random() * Math.PI,
        baseScale: 0.08 + Math.random() * 0.12,
        distance: r, // Distance from center for growth ripple timing
        hueShift: Math.random(), // For color variety
      });
    }
    return data;
  }, [count]);

  // Flower material with emissive glow
  const flowerMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.92, 0.7, 0.65), // Soft pink
      emissive: new THREE.Color().setHSL(0.92, 0.9, 0.4), // Warm pink glow
      emissiveIntensity: 0,
      roughness: 0.3,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
  }, []);

  useFrame(() => {
    if (!meshRef.current || growthProgress <= 0) return;
    const dummy = dummyRef.current;

    flowerData.forEach((flower, i) => {
      // Ripple: flowers near center (Aksa) bloom first
      const delay = flower.distance * 0.45;
      const localGrowth = Math.max(0, Math.min(1,
        (growthProgress - delay) / Math.max(0.01, 1 - delay)
      ));

      dummy.position.set(flower.x, flower.y, flower.z);
      dummy.rotation.set(0, flower.rotY, 0);
      // Bloom from ground: scale Y faster than XZ for sprouting effect
      const s = flower.baseScale * localGrowth;
      const eased = localGrowth * localGrowth * (3 - 2 * localGrowth); // smoothstep
      dummy.scale.set(s, s * (1.5 + eased), s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;

    // Animate material emissive and opacity
    flowerMaterial.emissiveIntensity = THREE.MathUtils.lerp(
      flowerMaterial.emissiveIntensity, growthProgress * 1.8, 0.05
    );
    flowerMaterial.opacity = THREE.MathUtils.lerp(
      flowerMaterial.opacity, opacity * Math.min(growthProgress * 2, 1), 0.05
    );
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} position={[0, -0.75, 0]}>
      <dodecahedronGeometry args={[0.05, 0]} />
      <primitive object={flowerMaterial} attach="material" />
    </instancedMesh>
  );
}

function FloatingIsland({ opacity = 1, currentPart, growthProgress = 0 }) {
  const meshRef = useRef();
  const grassRef = useRef();
  const rockRef = useRef();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  // ✅ useMemo prevents re-creating ShaderMaterial every render (was a GPU memory leak)
  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      time: { value: 0 },
      uGlitch: { value: 0 },
    },
    side: THREE.DoubleSide,
    transparent: true,
    opacity: opacity,
  }), []);

  // Responsive geometry settings
  const { segments, grassCount, rockCount } = useMemo(() => {
    if (isMobile) return { segments: 64, grassCount: 300, rockCount: 8 };
    if (isTablet) return { segments: 96, grassCount: 500, rockCount: 12 };
    return { segments: 128, grassCount: 800, rockCount: 15 };
  }, [isMobile, isTablet]);

  // Custom Grass Material with Wind & Gradient
  const grassMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: opacity,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.time = { value: 0 };
      shader.uniforms.uGrowth = { value: 0 }; // Growth: 0 = hidden, 1 = full height
      mat.userData.shader = shader;

      shader.vertexShader =
        "uniform float time;\n" +
        "uniform float uGrowth;\n" +
        "varying float vHeight;\n" +
        shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\n" +
        "// Growth animation: grass sprouts from ground\n" +
        "float growth = uGrowth;\n" +
        "transformed.y *= growth;\n" +
        "transformed.x *= mix(0.3, 1.0, growth);\n" +
        "transformed.z *= mix(0.3, 1.0, growth);\n" +
        "float grassHeight = position.y + 0.15;\n" +
        "float normalizedHeight = grassHeight / 0.3;\n" +
        "vHeight = normalizedHeight;\n" +
        "float windSpeed = 1.2;\n" +
        "float windAmp = 0.1 * growth;\n" +
        "float wave = sin(time * windSpeed + (instanceMatrix[3][0] * 0.5) + (instanceMatrix[3][2] * 0.5));\n" +
        "float bend = normalizedHeight * normalizedHeight;\n" +
        "transformed.x += wave * windAmp * bend;\n" +
        "transformed.z += wave * windAmp * bend * 0.5;\n"
      );

      shader.fragmentShader =
        "varying float vHeight;\n" +
        shader.fragmentShader;

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        "#include <color_fragment>\n" +
        "vec3 bottomColor = vec3(0.1, 0.2, 0.05);\n" +
        "vec3 topColor = vec3(0.4, 0.7, 0.2);\n" +
        "vec3 gradientColor = mix(bottomColor, topColor, vHeight);\n" +
        "diffuseColor.rgb *= gradientColor;\n"
      );
    };

    return mat;
  }, [opacity]);

  // Generate positions for grass and rocks
  const { grassData, rockData } = useMemo(() => {
    const grassData = [];
    const rockData = [];
    const dummy = new THREE.Object3D();

    // Grass positions
    for (let i = 0; i < grassCount; i++) {
      const r = 1.7 * Math.sqrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);

      dummy.position.set(x, 1.0, z);
      dummy.rotation.set(0, Math.random() * Math.PI, 0);
      // Taller and thinner grass for realism
      const scale = 0.5 + Math.random() * 0.5;
      dummy.scale.set(scale * 0.8, scale * (1.0 + Math.random() * 0.6), scale * 0.8);
      dummy.updateMatrix();
      grassData.push(dummy.matrix.clone());
    }

    // Rock positions
    for (let i = 0; i < rockCount; i++) {
      const r = 1.5 * Math.sqrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);

      // Filter rocks in the center area where bot lies and tree stands
      // Clear a path in front of the tree
      if (Math.abs(x) < 0.6 && Math.abs(z) < 0.6) {
        i--;
        continue;
      }

      dummy.position.set(x, 1.0, z);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      const scale = 0.2 + Math.random() * 0.3;
      dummy.scale.set(scale, scale * 0.6, scale);
      dummy.updateMatrix();
      rockData.push(dummy.matrix.clone());
    }

    return { grassData, rockData };
  }, [grassCount, rockCount]);

  useLayoutEffect(() => {
    if (grassRef.current) {
      grassData.forEach((matrix, i) => {
        grassRef.current.setMatrixAt(i, matrix);
      });
      grassRef.current.instanceMatrix.needsUpdate = true;
    }
    if (rockRef.current) {
      rockData.forEach((matrix, i) => {
        rockRef.current.setMatrixAt(i, matrix);
      });
      rockRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [grassData, rockData]);

  useFrame(({ clock }) => {
    if (grassMaterial.userData.shader) {
      grassMaterial.userData.shader.uniforms.time.value = clock.elapsedTime;
      // Animate grass growth toward target
      const currentGrowth = grassMaterial.userData.shader.uniforms.uGrowth.value;
      grassMaterial.userData.shader.uniforms.uGrowth.value = THREE.MathUtils.lerp(
        currentGrowth, growthProgress, 0.03
      );
    }
  });

  // Update material opacity
  useEffect(() => {
    if (material) {
      material.opacity = opacity;
      material.needsUpdate = true;
    }
  }, [opacity, material]);

  // ✅ useMemo prevents re-creating geometry every render
  const islandGeometry = useMemo(
    () => new THREE.CylinderGeometry(2.0, 1.0, 2.0, segments, 64, false),
    [segments]
  );

  return (
    <group position={[0, -1.0, -0.8]} visible={opacity > 0}>
      {/* Main Island */}
      <mesh
        ref={meshRef}
        name="IslandMesh"
        geometry={islandGeometry}
        material={material}
        castShadow
        receiveShadow
      />

      {/* 3D Grass Blades with Wind & Gradient */}
      <instancedMesh ref={grassRef} name="GrassMesh" args={[null, null, grassData.length]} position={[0, -0.75, 0]}>
        {/* Slightly thinner cone for grass blade look */}
        <coneGeometry args={[0.025, 0.35, 4]} />
        <primitive object={grassMaterial} attach="material" />
      </instancedMesh>

      {/* 3D Rocks */}
      <instancedMesh ref={rockRef} name="RockMesh" args={[null, null, rockData.length]} position={[0, -0.75, 0]}>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#3d342b" roughness={0.9} transparent opacity={opacity} />
      </instancedMesh>

      {/* Flowers — bloom from Aksa's feet outward */}
      <FlowerInstances growthProgress={growthProgress} opacity={opacity} />
    </group>
  );
}
function ComicScene({ scrollY, botReady, activeFloorId }) {
  const islandRef = useRef();
  const group = useRef();
  const sparklesRef = useRef();
  const botMaterialsRef = useRef([]);
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const { scene, animations } = useGLTF("/models/bot.glb");
  const { actions } = useAnimations(animations, group);
  const { camera, scene: threeScene, clock } = useThree();
  const [currentPart, setCurrentPart] = useState(0);
  const [sparklesIntensity, setSparklesIntensity] = useState(1.2);

  // ✅ Cached objects for useFrame — prevents per-frame GC pressure
  const lookAtVec = useRef(new THREE.Vector3());
  const moodColorCache = useRef(new THREE.Color());
  const lightPosA = useRef(new THREE.Vector3(0, 5, -10));
  const lightPosB = useRef(new THREE.Vector3());
  const cachedIslandMesh = useRef(null);
  const cachedGrassMesh = useRef(null);
  const cachedRockMesh = useRef(null);
  const cachedAmbientLight = useRef(null);
  const cachedSpotLight = useRef(null);
  
  // Custom clipping plane to realistically "sink" the bot into the ground
  const clipPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.75));

  // Pre-computed mood lighting colors — emotionally matched to each narrative beat
  const moodColors = useMemo(() => ({
    1: new THREE.Color("#8899bb"),  // AWAKENING — cold blue dawn
    2: new THREE.Color("#ffe8c0"),  // AKSA — warm golden confidence
    3: new THREE.Color("#c8a868"),  // TIME — amber sand, fading
    4: new THREE.Color("#665580"),  // STUCK — suffocated purple
    5: new THREE.Color("#d0ddff"),  // TEST — electric white-blue
    6: new THREE.Color("#7799bb"),  // REALIZE — cold clarity
    7: new THREE.Color("#e8c8a0"),  // REFLECTION — amber memory
    8: new THREE.Color("#ffcc88"),  // JOURNEY — warm ember rekindling
    9: new THREE.Color("#ffe8bb"),  // HOPE — full golden warmth
    default: new THREE.Color("#aaaaaa"),
  }), []);

  // Use API instead of setSpring directly
  const [spring, api] = useSpring(() => ({
    positionX: 0,
    positionY: 0.2,
    positionZ: 0.8,
    rotationX: -Math.PI / 2,
    rotationY: 0,
    rotationZ: 0,
    scale: 1,
    opacity: 0,
    islandOpacity: 0,
    config: { mass: 1, tension: 170, friction: 26 },
  }));

  // Cinematic camera — each position tells a visual story
  const cameraPositions = [
    { position: [0, 4.0, 8],    target: [0, 0.5, -0.8] },   // AWAKENING — wide establishing, distant
    { position: [-0.8, 2.2, 5], target: [-0.3, 0.6, 0] },   // AKSA — intimate side angle, close
    { position: [1.5, 4.5, 4.5],  target: [0, 0.0, 0] },    // TIME — High angle, watching him begin to sink
    { position: [0, 6.5, 1.2],  target: [0, -1.0, 0] },     // STUCK — Extreme high angle (top-down), swallowing him
    { position: [0, 3.5, 7],    target: [0, 0, -0.5] },     // TEST — dramatic high angle
    { position: [0, 1.0, 5],    target: [0, 0.8, 0] },      // REALIZE — low angle looking up (vulnerability)
    { position: [0, 0.8, 4.5],  target: [0, 0.5, 0] },      // REFLECTION — near eye-level (mirror)
    { position: [-1.5, 2.8, 6], target: [0.5, 0.8, 0] },    // JOURNEY — tracking side shot
    { position: [0, 3.0, 10],   target: [0, 1.0, 0] },      // HOPE — ascending pull-out, expansive
  ];

  useEffect(() => {
    if (actions["Armature|mixamo.com|Layer0"]) {
      actions["Armature|mixamo.com|Layer0"].play().paused = true;
    }

    // No global fog - using local fog around island instead
    threeScene.fog = null;
    threeScene.background = null;

    botMaterialsRef.current = [];
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material.transparent = true;
        child.material.depthWrite = true;
        child.material.clippingPlanes = [clipPlaneRef.current];
        child.material.needsUpdate = true;
        child.renderOrder = 1;
        botMaterialsRef.current.push(child.material);
      }
    });

    // Mouse tracking for Evil Eye (floor 7 REFLECTION)
    const handleMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const partCount = 9;
    const currentPart = Math.min(
      Math.floor(scrollY * partCount),
      partCount - 1
    );
    const partProgress = (scrollY * partCount) % 1;
    const islandFloatY = Math.sin(clock.elapsedTime * 0.6) * 0.05;
    const islandGroupY = -1.0;
    const islandMeshLocalBaseY = -0.75;
    const cylinderHeight = 2.0;
    
    // World Y of island top surface: Group Y + Mesh Local Y + (Height / 2)
    const SURFACE_WORLD_Y = islandGroupY + islandMeshLocalBaseY + (cylinderHeight / 2) + islandFloatY; 
    
    // Bot feet in world Y: Bot Group Y + Bot Local Offset (0.1)
    // To match Surface World Y: Bot Group Y = Surface World Y - 0.1
    const BOT_SURFACE_Y = SURFACE_WORLD_Y - 0.1;

    const floatY = BOT_SURFACE_Y;

    switch (currentPart) {
      case 0: // AWAKENING - Hide all 3D elements (bot, tree, island)
        api.start({
          positionX: 0,
          positionY: BOT_SURFACE_Y + 1.0, // Start slightly above for awakening effect
          positionZ: 0.8,
          rotationY: 0,
          rotationX: -Math.PI / 2,
          rotationZ: 0,
          scale: 1,
          opacity: 0, // Keep bot hidden
          islandOpacity: 0, // Keep island and tree hidden
          config: { mass: 1, tension: 120, friction: 14 },
        });
        break;
      case 1: // AKSA - Fade in standing bot with island and tree
        const fadeInProgress = THREE.MathUtils.smoothstep(partProgress, 0, 0.5);
        api.start({
          positionX: 0,
          positionY: BOT_SURFACE_Y, // Sit exactly on surface
          positionZ: 0,
          rotationY: 0,
          rotationX: 0, // Standing upright from the start
          rotationZ: 0,
          scale: 1,
          opacity: fadeInProgress, // Fade in bot
          islandOpacity: fadeInProgress, // Fade in island and tree
          config: { mass: 1, tension: 120, friction: 14 },
        });
        break;
      case 2: // TIME
        const sinkProgress = Math.pow(partProgress, 1.5);
        api.start({
          positionX: 0,
          // Sink into the island slowly, up to his waist
          positionY: THREE.MathUtils.lerp(floatY, floatY - 0.8, sinkProgress),
          positionZ: 0,
          rotationY: 0,
          // Lean forward slightly as if losing energy
          rotationX: THREE.MathUtils.lerp(0, 0.3, sinkProgress), 
          rotationZ: 0,
          scale: THREE.MathUtils.lerp(1, 0.85, partProgress),
          opacity: THREE.MathUtils.lerp(1, 0.8, partProgress),
          islandOpacity: 1,
          config: { mass: 1, tension: 120, friction: 14 },
        });
        break;
      case 3: // STUCK
        // Sink completely into the island, fade out, shrink
        api.start({
          positionX: 0,
          // Sink deeper, but stop at -1.5 so he never pokes out the bottom of the island
          positionY: THREE.MathUtils.lerp(floatY - 0.8, floatY - 1.5, partProgress),
          positionZ: 0,
          rotationY: THREE.MathUtils.lerp(0, 0.5, partProgress), // Struggle/twist slightly
          rotationX: THREE.MathUtils.lerp(0.3, 0.8, partProgress), // Collapse forward
          rotationZ: 0,
          scale: THREE.MathUtils.lerp(0.85, 0.4, partProgress), // Shrink as he's swallowed
          opacity: THREE.MathUtils.lerp(0.8, 0, Math.pow(partProgress, 2)), // Fade to 0 at the end
          islandOpacity: 1,
          config: { mass: 1, tension: 120, friction: 14 },
        });
        break;
      case 4: // TEST
        api.start({
          positionX: 0,
          positionY: floatY - 1.5, // keep him hidden inside the island
          positionZ: 0,
          rotationX: 0,
          rotationY: 0,
          rotationZ: 0,
          scale: 0,
          opacity: 0,
          islandOpacity: 1,
        });
        break;
      case 5: // REALIZE
        api.start({
          positionX: 0,
          positionY: THREE.MathUtils.lerp(floatY - 1.5, floatY, partProgress),
          positionZ: 0,
          rotationY: 0,
          rotationX: 0,
          rotationZ: 0,
          scale: THREE.MathUtils.lerp(0, 1, partProgress),
          opacity: THREE.MathUtils.lerp(0, 1, partProgress),
          islandOpacity: 1,
          config: { mass: 1, tension: 100, friction: 20 },
        });
        break;
      default:
        api.start({
          positionX: 0,
          positionY: floatY,
          positionZ: 0,
          rotationY: 0, // Tidak ada gerakan rotasi
          scale: 1,
          opacity: 1,
          islandOpacity: 1,
          config: { mass: 1, tension: 120, friction: 14 },
        });
        break;
    }
  }, [scrollY, api]);

  useFrame((state, delta) => {
    // ✅ Lazy-cache scene object references (replaces costly traverse() every frame)
    if (!cachedIslandMesh.current) cachedIslandMesh.current = threeScene.getObjectByName("IslandMesh");
    if (!cachedGrassMesh.current) cachedGrassMesh.current = threeScene.getObjectByName("GrassMesh");
    if (!cachedRockMesh.current) cachedRockMesh.current = threeScene.getObjectByName("RockMesh");
    if (!cachedAmbientLight.current) cachedAmbientLight.current = threeScene.children.find(c => c.isAmbientLight);
    if (!cachedSpotLight.current) cachedSpotLight.current = threeScene.getObjectByName("MainSpot");

    // Island floating sync
    const islandFloatY = Math.sin(state.clock.elapsedTime * 0.6) * 0.05;
    const islandBaseY = -0.75;
    
    // ✅ Update cached refs directly (was: threeScene.traverse() every frame)
    [cachedIslandMesh, cachedGrassMesh, cachedRockMesh].forEach(ref => {
      if (ref.current) ref.current.position.y = islandBaseY + islandFloatY;
    });

    // Sync clipping plane with the island's floating top surface
    const SURFACE_WORLD_Y = -1.0 + islandBaseY + 1.0 + islandFloatY;
    clipPlaneRef.current.constant = -(SURFACE_WORLD_Y - 0.06); // Give a small margin so feet don't clip when walking

    const partCount = 9;
    const rawPart = Math.floor(scrollY * partCount);
    const newPart = Math.min(rawPart, partCount - 1);
    if (newPart !== currentPart) setCurrentPart(newPart);

    // Island glitch sync (using cached ref)
    if (cachedIslandMesh.current?.material?.uniforms?.uGlitch) {
      const mat = cachedIslandMesh.current.material;
      const glitchTarget = (newPart === 2 || newPart === 3) ? 0.05 + Math.random() * 0.05 : 0;
      mat.uniforms.uGlitch.value = THREE.MathUtils.lerp(mat.uniforms.uGlitch.value, glitchTarget, 0.1);
      mat.uniforms.time.value = state.clock.elapsedTime;
    }

    const targetPos = cameraPositions[newPart] || cameraPositions[0];
    
    // Cinematographic camera using damp() — organic acceleration/deceleration
    const camLambda = 4;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetPos.position[0], camLambda, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetPos.position[1], camLambda, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetPos.position[2], camLambda, delta);
    // ✅ Reuse cached Vector3 (was: new THREE.Vector3() every frame)
    lookAtVec.current.set(...targetPos.target);
    camera.lookAt(lookAtVec.current);

    // Per-mood ambient lighting sync via activeFloorId
    const ambientLight = cachedAmbientLight.current;
    if (ambientLight) {
      // Ambient intensity follows emotional arc: dark → bright → dark → bright
      const moodIntensity = { 1: 0.06, 2: 0.22, 3: 0.12, 4: 0.03, 5: 0.15, 6: 0.05, 7: 0.12, 8: 0.18, 9: 0.28 };
      const targetIntensity = moodIntensity[activeFloorId] || 0.10;
      ambientLight.intensity = THREE.MathUtils.damp(ambientLight.intensity, targetIntensity, 3, delta);
      const targetMoodColor = moodColors[activeFloorId] || moodColors.default;
      ambientLight.color.lerp(targetMoodColor, delta * 2);
    }

    // Per-mood spot light intensity (using cached ref)
    const light = cachedSpotLight.current;
    if (light) {
      // Spot follows same arc — low for despair scenes, high for revelation
      const spotMoodIntensity = { 1: 1.5, 2: 4.0, 3: 2.0, 4: 0.6, 5: 5.0, 6: 1.2, 7: 2.5, 8: 3.5, 9: 5.0 };
      const targetInt = spotMoodIntensity[activeFloorId] || 2.5;
      light.intensity = THREE.MathUtils.damp(light.intensity, targetInt, 3, delta);

      if (currentPart === 0) {
        lightPosA.current.set(0, 5, -10);
        light.position.lerp(lightPosA.current, delta * 0.5);
      } else {
        lightPosB.current.copy(camera.position).add(lightPosA.current.set(3, 5, 5));
        light.position.lerp(lightPosB.current, delta * 0.5);
      }
    }

    // Bot animation time sync
    if (actions["Armature|mixamo.com|Layer0"]) {
      const partProgress = (scrollY * partCount) % 1;
      actions["Armature|mixamo.com|Layer0"].time =
        actions["Armature|mixamo.com|Layer0"].getClip().duration * partProgress;
    }

    // Bot opacity + emissive "nyala tekad" sync
    const currentOpacity = spring.opacity.get();
    // Emissive intensity — follows the "nyala" metaphor (inner fire)
    const emissiveMap = { 0: 0, 1: 2.0, 2: 0.5, 3: 0.1, 4: 0, 5: 0.3, 6: 0.8, 7: 1.8, 8: 3.0 };
    const targetEmissive = emissiveMap[currentPart] ?? 0;
    // Emissive color — matched to particle/ray palette for coherence
    const emissiveColorMap = {
      0: 0x000000, 1: 0xffcc44, 2: 0xaa8844, 3: 0x443366,
      4: 0x000000, 5: 0x5588bb, 6: 0xff8844, 7: 0xff6622, 8: 0xffdd66
    };

    botMaterialsRef.current.forEach((mat) => {
      mat.opacity = currentOpacity;
      // Initialize emissive on first pass
      if (!mat._emissiveInit) {
        mat.emissive = new THREE.Color(0xffaa22);
        mat.emissiveIntensity = 0;
        mat._emissiveInit = true;
      }
      // Lerp emissive intensity for smooth "awakening" glow
      mat.emissiveIntensity = THREE.MathUtils.lerp(
        mat.emissiveIntensity, targetEmissive, 0.03
      );
      // Lerp emissive color toward mood target
      const targetEColor = emissiveColorMap[currentPart] ?? 0x000000;
      mat.emissive.lerp(new THREE.Color(targetEColor), 0.02);
    });

    // Sparkles position for Realize (part 5)
    if (currentPart === 5 && sparklesRef.current) {
      sparklesRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }

    // Subtle bot breathing rotation
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y,
        Math.sin(state.clock.elapsedTime * 0.3) * 0.08,
        3,
        delta
      );
    }
  });

  return (
    <>
      {/* Per-floor fullscreen shader backgrounds */}
      <StoryBackgrounds activeFloorId={activeFloorId} islandOpacity={spring.islandOpacity.get()} mouseRef={mouseRef} />

      <ContactShadows
        position={[0, -0.74, 0]}
        opacity={0.6}
        scale={6}
        blur={2.5}
        far={2}
        color="#000000"
      />

      <FloatingIsland
        opacity={spring.islandOpacity.get()}
        currentPart={currentPart}
        growthProgress={
          // Growth: 0 during AWAKENING, ramps to 1 during AKSA, stays 1 after
          currentPart === 0 ? 0
          : currentPart === 1 ? Math.min(1, (scrollY * 9 - 1) / 0.8) // Ramp during AKSA
          : 1
        }
      />
      <StoryGodRays currentPart={currentPart} opacity={spring.islandOpacity.get()} />
      <StoryParticles currentPart={currentPart} opacity={spring.islandOpacity.get()} />
      
      <a.group
        ref={group}
        position-x={spring.positionX}
        position-y={spring.positionY}
        position-z={spring.positionZ}
        rotation-x={spring.rotationX}
        rotation-y={spring.rotationY}
        rotation-z={spring.rotationZ}
        scale={spring.scale}
      >
        <group scale={[1.2, 1.2, 1.2]} position={[0, 0.1, 0]}>
          <primitive object={scene} />
        </group>
      </a.group>
      
      {/* Reflection floor for Part 6 (REFLECTION) */}
      {currentPart === 6 && (
        <mesh 
          rotation-x={-Math.PI / 2} 
          position={[0, -0.75 + (Math.sin(clock.elapsedTime * 0.6) * 0.05) + 1.001, 0]}
        >
          <planeGeometry args={[4, 4]} />
          <meshPhysicalMaterial 
            transparent 
            opacity={0.4} 
            transmission={0.9} 
            thickness={1} 
            roughness={0.1} 
            metalness={0.8}
            color="#ffffff"
          />
        </mesh>
      )}
    </>
  );
}

// ─── Bloom Controller (Native Three.js EffectComposer) ─────────────
// Manages UnrealBloomPass with per-floor intensity for "nyala tekad" aura.
function NativeBloomEffect({ scrollY }) {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef(null);
  const bloomPassRef = useRef(null);
  const currentIntensity = useRef(0);

  // Bloom intensity per floor — harmonized with lighting/particle/ray arc
  const bloomMap = useMemo(() => ({
    0: 0.1,    // AWAKENING — near darkness, faint dawn haze
    1: 1.4,    // AKSA — golden "nyala tekad" full bloom
    2: 0.4,    // TIME — amber afterglow fading
    3: 0.05,   // STUCK — near-zero, suffocated
    4: 1.0,    // TEST — sharp lightning flash
    5: 0.15,   // REALIZE — dim moment of cold clarity
    6: 0.7,    // REFLECTION — warm introspective glow
    7: 1.0,    // JOURNEY — rekindling embers
    8: 1.8,    // HOPE — brightest bloom, catharsis
  }), []);

  // Initialize EffectComposer once
  useEffect(() => {
    const composer = new ThreeEffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0,     // initial strength
      0.4,   // radius
      0.25   // luminance threshold
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    composerRef.current = composer;
    bloomPassRef.current = bloomPass;

    return () => {
      composer.dispose();
    };
  }, [gl, scene, camera]);

  // Resize composer when viewport changes
  useEffect(() => {
    if (composerRef.current) {
      composerRef.current.setSize(size.width, size.height);
    }
  }, [size]);

  // Render loop: animate bloom + render through composer
  useFrame(() => {
    const partCount = 9;
    const currentPart = Math.min(Math.floor(scrollY * partCount), partCount - 1);
    const target = bloomMap[currentPart] ?? 0;

    currentIntensity.current = THREE.MathUtils.lerp(
      currentIntensity.current, target, 0.04
    );

    if (bloomPassRef.current) {
      bloomPassRef.current.strength = currentIntensity.current;
    }
    if (composerRef.current) {
      composerRef.current.render();
    }
  }, 1); // Priority 1: render AFTER scene updates

  return null; // This component renders via useFrame, no JSX output
}

export default function ThreeCanvas({ scrollY, botReady, activeFloorId }) {
  const isMobile = useIsMobile();
  const fov = isMobile ? 55 : 45;

  return (
    <div className={styles.threeCanvasWrapper}>
      <Canvas
        shadows
        gl={{
          powerPreference: "high-performance",
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          localClippingEnabled: true,
        }}
        dpr={[1, 2]}
      >
        <PerspectiveCamera makeDefault fov={fov} position={[0, 3.5, 6]} />
        <ambientLight intensity={0.15} color="#ffffff" />
        <spotLight
          name="MainSpot"
          position={[0, 5, -10]}
          angle={0.5}
          intensity={3}
          penumbra={0.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          color="#ffffff"
        />

        <Environment preset="studio" />
        <Suspense fallback={null}>
          <ComicScene scrollY={scrollY} botReady={botReady} activeFloorId={activeFloorId} />
        </Suspense>

        {/* Post-Processing: Native Bloom for "nyala tekad" aura */}
        <NativeBloomEffect scrollY={scrollY} />
      </Canvas>
    </div>
  );
}
