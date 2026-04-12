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

// 1. Atmospheric God Rays (Sharp/Bright for Awakening/Aksa)
function StoryGodRays({ currentPart, opacity }) {
  const meshRef = useRef();
  
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
        float beam = smoothstep(0.4, 0.5, vUv.x) * smoothstep(0.6, 0.5, vUv.x);
        float fade = pow(1.0 - vUv.y, 2.0);
        float noise = sin(vUv.y * 10.0 + time * 2.0) * 0.1 + 0.9;
        float alpha = beam * fade * uOpacity * uStrength * noise;
        gl_FragColor = vec4(uColor, alpha);
      }
    `
  }), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    shaderMaterial.uniforms.time.value = state.clock.elapsedTime;
    
    // Logic for God Rays: Strongest during Awakening (0) and Aksa (1), disappearing during Time/Stuck
    let targetOpacity = 0;
    if (currentPart === 0 || currentPart === 1) targetOpacity = 0.6;
    if (currentPart === 8) targetOpacity = 0.4; // Hope rays
    
    shaderMaterial.uniforms.uOpacity.value = THREE.MathUtils.lerp(
      shaderMaterial.uniforms.uOpacity.value,
      targetOpacity * opacity,
      0.05
    );
  });

  return (
    <group rotation={[0, 0, 0.2]}>
      <mesh ref={meshRef} position={[0, 5, -5]} scale={[20, 30, 1]}>
        <planeGeometry />
        <primitive object={shaderMaterial} attach="material" />
      </mesh>
    </group>
  );
}

// 2. Story Particles (Embers/Glow)
function StoryParticles({ currentPart, opacity }) {
  const pointsRef = useRef();
  
  const particleCount = 150;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 10;
        pos[i * 3 + 1] = Math.random() * 10 - 2;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    return pos;
  }, []);

  const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      time: { value: 0 },
      uOpacity: { value: 0 },
      uColor: { value: new THREE.Color("#ffffff") }
    },
    vertexShader: `
      uniform float time;
      varying float vOpacity;
      void main() {
        vec3 pos = position;
        pos.y += mod(time * 0.5 + position.y, 10.0) - 5.0;
        pos.x += sin(time + position.z) * 0.2;
        vOpacity = 1.0 - abs(pos.y / 5.0);
        gl_PointSize = (1.0 + sin(time + position.x) * 0.5) * 15.0;
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
        float finalAlpha = (0.5 - d) * 2.0 * vOpacity * uOpacity;
        gl_FragColor = vec4(uColor, finalAlpha);
      }
    `
  }), []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    shaderMaterial.uniforms.time.value = state.clock.elapsedTime;
    
    // Embers during Journey (7) and Hope (8)
    let targetOpacity = 0;
    let targetColor = new THREE.Color("#ffffff");
    
    if (currentPart === 7) { 
        targetOpacity = 0.4; 
        targetColor.set("#ff5500"); // Red/Orange Embers
    }
    if (currentPart === 8) { 
        targetOpacity = 0.7; 
        targetColor.set("#ffcc00"); // Golden Hope Glow
    }
    if (currentPart === 0) {
        targetOpacity = 0.2;
        targetColor.set("#ffffff"); // Soft white specks
    }

    shaderMaterial.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        shaderMaterial.uniforms.uOpacity.value,
        targetOpacity * opacity,
        0.05
    );
    shaderMaterial.uniforms.uColor.value.lerp(targetColor, 0.05);
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


function FloatingIsland({ opacity = 1, currentPart }) {
  const meshRef = useRef();
  const grassRef = useRef();
  const rockRef = useRef();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      time: { value: 0 },
      uGlitch: { value: 0 },
    },
    side: THREE.DoubleSide,
    transparent: true,
    opacity: opacity,
  });

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
      mat.userData.shader = shader;

      shader.vertexShader =
        "uniform float time;\n" +
        "varying float vHeight;\n" +
        shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\n" +
        "float grassHeight = position.y + 0.15;\n" +
        "float normalizedHeight = grassHeight / 0.3;\n" +
        "vHeight = normalizedHeight;\n" +
        "float windSpeed = 1.2;\n" +
        "float windAmp = 0.1;\n" +
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
    }
  });

  // Update material opacity
  useEffect(() => {
    if (material) {
      material.opacity = opacity;
      material.needsUpdate = true;
    }
  }, [opacity, material]);

  return (
    <group position={[0, -1.0, -0.8]} visible={opacity > 0}>
      {/* Main Island */}
      <mesh
        ref={meshRef}
        name="IslandMesh"
        geometry={new THREE.CylinderGeometry(2.0, 1.0, 2.0, segments, 64, false)}
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
    </group>
  );
}
function ComicScene({ scrollY, botReady }) {
  const islandRef = useRef();
  const group = useRef();
  const sparklesRef = useRef();
  const botMaterialsRef = useRef([]);
  const { scene, animations } = useGLTF("/models/bot.glb");
  const { actions } = useAnimations(animations, group);
  const { camera, scene: threeScene, clock } = useThree();
  const [currentPart, setCurrentPart] = useState(0);
  const [sparklesIntensity, setSparklesIntensity] = useState(1.2);

  // Use API instead of setSpring directly
  const [spring, api] = useSpring(() => ({
    positionX: 0, // Di tengah
    positionY: 0.2, // Di atas permukaan island agar terlihat
    positionZ: 0.8, // Lebih maju ke depan (dekat tepi depan island)
    rotationX: -Math.PI / 2, // Berbaring
    rotationY: 0,
    rotationZ: 0,
    scale: 1,
    opacity: 0,
    islandOpacity: 0,
    config: { mass: 1, tension: 170, friction: 26 },
  }));

  const cameraPositions = [
    { position: [0, 3.5, 6], target: [0, 0.5, -0.8] },
    { position: [-1, 2.5, 7], target: [-0.5, 0.8, 0] },
    { position: [2, 2.8, 5], target: [0.5, 0.5, 0] },
    { position: [0, 2.5, 4], target: [0, 0.5, 0] },
    { position: [0, 3, 6], target: [0, 0, 0] },
    { position: [0, 2.5, 5.5], target: [0, -0.5, 0] },
    { position: [0, 1.5, 7], target: [0, 1, 0] },
    { position: [-2, 2.5, 6], target: [0, 1, 0] },
    { position: [0, 2.5, 9], target: [0, 1, 0] },
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
        child.material.needsUpdate = true;
        child.renderOrder = 1;
        botMaterialsRef.current.push(child.material);
      }
    });
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
        const sinkProgress = Math.pow(partProgress, 2);
        api.start({
          positionX: 0,
          positionY: THREE.MathUtils.lerp(floatY, -4.0, sinkProgress),
          positionZ: 0,
          rotationY: 0, // Tidak ada gerakan rotasi
          rotationX: 0,
          rotationZ: 0,
          scale: THREE.MathUtils.lerp(1, 0.9, partProgress),
          opacity: 1,
          islandOpacity: 1,
          config: { mass: 1, tension: 120, friction: 14 },
        });
        break;
      case 3: // STUCK
        api.start({
          positionX: 0,
          positionY: THREE.MathUtils.lerp(-4.0, -5.5, partProgress),
          positionZ: 0,
          rotationY: 0, // Tidak ada gerakan rotasi
          rotationX: 0,
          rotationZ: 0,
          scale: 0.9,
          opacity: THREE.MathUtils.lerp(1, 0, partProgress),
          islandOpacity: 1,
          config: { mass: 1, tension: 120, friction: 14 },
        });
        break;
      case 4: // TEST
        api.start({
          positionX: 0,
          positionY: -6.5,
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
          positionY: THREE.MathUtils.lerp(-3.5, floatY, partProgress),
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
    // Island floating sync
    const islandFloatY = Math.sin(state.clock.elapsedTime * 0.6) * 0.05;
    const islandBaseY = -0.75;
    
    // Update island components in world space
    threeScene.traverse((child) => {
      if (child.name === "IslandMesh" || child.name === "GrassMesh" || child.name === "RockMesh") {
        child.position.y = islandBaseY + islandFloatY;
      }
    });

    const partCount = 9;
    const rawPart = Math.floor(scrollY * partCount);
    const newPart = Math.min(rawPart, partCount - 1);
    if (newPart !== currentPart) setCurrentPart(newPart);

    // Island glitch sync
    threeScene.traverse((child) => {
      if (child.name === "IslandMesh" && child.material.uniforms?.uGlitch) {
        let glitchTarget = (newPart === 2 || newPart === 3) ? 0.05 + Math.random() * 0.05 : 0;
        child.material.uniforms.uGlitch.value = THREE.MathUtils.lerp(child.material.uniforms.uGlitch.value, glitchTarget, 0.1);
        child.material.uniforms.time.value = state.clock.elapsedTime;
      }
    });

    const targetPos = cameraPositions[newPart] || cameraPositions[0];
    
    // Faster camera response to scroll
    const lerpFactor = delta * 3.0; 
    camera.position.lerp(new THREE.Vector3(...targetPos.position), lerpFactor);
    
    // Smoothly interpolate camera target as well
    const currentTarget = new THREE.Vector3();
    camera.getWorldDirection(currentTarget);
    const targetVec = new THREE.Vector3(...targetPos.target);
    camera.lookAt(targetVec);

    // Subtle bot rotation based on story progress to feel "alive"
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        Math.sin(scrollY * Math.PI * 2) * 0.1,
        0.1
      );
    }

    if (actions["Armature|mixamo.com|Layer0"]) {
      const partProgress = (scrollY * partCount) % 1;
      actions["Armature|mixamo.com|Layer0"].time =
        actions["Armature|mixamo.com|Layer0"].getClip().duration * partProgress;
    }

    const currentOpacity = spring.opacity.get();
    botMaterialsRef.current.forEach((mat) => {
      mat.opacity = currentOpacity;
    });

    if (currentPart === 5 && sparklesRef.current) {
      sparklesRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }

    const light = threeScene.getObjectByName("MainSpot");
    if (light) {
      // Move light to back for Awakening (part 0), then front for others
      const targetLightPos = currentPart === 0
        ? new THREE.Vector3(0, 5, -10) // Backlight for Awakening
        : camera.position.clone().add(new THREE.Vector3(3, 5, 5)); // Front light for others

      light.position.lerp(targetLightPos, delta * 0.5);
    }
  });

  return (
    <>
      <ContactShadows
        position={[0, -0.74, 0]} // Just above island surface
        opacity={0.6}
        scale={6}
        blur={2.5}
        far={2}
        color="#000000"
      />

      <FloatingIsland opacity={spring.islandOpacity.get()} currentPart={currentPart} />
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

export default function ThreeCanvas({ scrollY, botReady }) {
  const isMobile = useIsMobile();
  const fov = isMobile ? 55 : 45; // Wider FOV on mobile

  return (
    <div className={styles.threeCanvasWrapper}>
      <Canvas
        shadows
        gl={{
          powerPreference: "high-performance",
          antialias: true,
          alpha: true,
        }}
        dpr={[1, 2]}
      >
        <PerspectiveCamera makeDefault fov={fov} position={[0, 3.5, 6]} />
        <ambientLight intensity={0.15} color="#ffffff" />
        <spotLight
          name="MainSpot"
          position={[0, 5, -10]} // Initial position at back
          angle={0.5}
          intensity={3} // Increased intensity for backlight
          penumbra={0.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          color="#ffffff"
        />

        <Environment preset="studio" />
        <Suspense fallback={null}>
          <ComicScene scrollY={scrollY} botReady={botReady} />
        </Suspense>
      </Canvas>
    </div>
  );
}
