"use client";
import { Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  useAnimations,
  Environment,
  Float,
  Sparkles,
  Text,
  PerspectiveCamera,
} from "@react-three/drei";
import * as THREE from "three";

function CloudPlane({ visible }) {
  const meshRef = useRef();
  const [shaderMaterial] = useState(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          time: { value: 0 },
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
          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
          }
          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) +
                  (c - a)* u.y * (1.0 - u.x) +
                  (d - b) * u.x * u.y;
          }
          float fbm(vec2 p) {
            float value = 0.0;
            float amplitude = 0.5;
            for (int i = 0; i < 5; i++) {
              value += amplitude * noise(p);
              p *= 2.0;
              amplitude *= 0.5;
            }
            return value;
          }
          void main() {
            vec2 uv = vUv * 3.0;
            float t = time * 0.03;
            float clouds = fbm(uv + vec2(t, t * 0.5));
            float alpha = smoothstep(0.4, 0.7, clouds);
            gl_FragColor = vec4(vec3(1.0), alpha * 0.5);
          }
        `,
      })
  );

  useFrame((_, delta) => {
    shaderMaterial.uniforms.time.value += delta;
  });

  return (
    <mesh ref={meshRef} visible={visible} position={[0, 0, -20]}>
      <planeGeometry args={[90, 34]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
}

// Vertex shader with static noise displacement (no time animation)
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPos;

  // GLSL Simplex 3D Noise 
  // Author: Ian McEwan, Ashima Arts.
  // https://github.com/ashima/webgl-noise/blob/master/src/noise3D.glsl
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

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    //  x0 = x0 - 0.0 + 0.0 * C 
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

    // Permutations
    i = mod289(i);
    vec4 p = permute( permute( permute( 
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    // Gradients: 7x7 points over a cube, mapped onto 3d vector 
    float n_ = 1.0/7.0; // N=7
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

    // Normalise gradients
    vec4 norm = inversesqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix contributions from the four corners
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                  dot(p2,x2), dot(p3,x3) ) );
    }

  void main() {
    vUv = uv;
    vNormal = normal;
    vPos = position;
    
    float noiseFreq = 1.2;
    float noiseAmp = 0.3;

    // Static noise displacement (no time)
    float noise = snoise(vec3(position.x * noiseFreq, position.y * noiseFreq, position.z * noiseFreq));
    
    vec3 newPosition = position + normal * noise * noiseAmp;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPos;

  void main() {
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
    float light = dot(normalize(vNormal), lightDir) * 0.5 + 0.5;

    vec3 darkBrown = vec3(0.35, 0.25, 0.15);
    vec3 mossGreen = vec3(0.2, 0.4, 0.1);

    float heightFactor = smoothstep(-0.5, 1.3, vPos.y);
    vec3 baseColor = mix(darkBrown, mossGreen, heightFactor);

    vec3 color = baseColor * light;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function FloatingIsland() {
  const meshRef = useRef();

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      time: { value: 0 },
    },
    side: THREE.DoubleSide,
  });

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Floating movement (whole mesh)
      meshRef.current.position.y =
        Math.sin(clock.elapsedTime * 0.6) * 0.07 - 0.75;
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={new THREE.CylinderGeometry(1.8, 1.3, 1.4, 64, 16, false)}
      material={material}
      position={[0, 0, 0]}
      castShadow
      receiveShadow
    />
  );
}

function ComicScene({ scrollY, botReady }) {
  const group = useRef();
  const sparklesRef = useRef();
  const { scene, animations } = useGLTF("/models/bot.glb");
  const { actions } = useAnimations(animations, group);
  const { camera, scene: threeScene } = useThree();
  const [currentPart, setCurrentPart] = useState(0);
  const [sparklesIntensity, setSparklesIntensity] = useState(1.2);

  const cameraPositions = [
    { position: [0, 0.5, 8], target: [0, 1, 0] },
    { position: [-2, 1.5, 6], target: [0, 1.2, 0] },
    { position: [2, 0.8, 7], target: [0.5, 1, 0] },
    { position: [0, 1.5, 5], target: [0, 1.5, 0] },
    { position: [0, 2, 6], target: [0, 1.8, 0] },
    { position: [-1, 1, 7], target: [0, 1.2, 0] },
    { position: [0, 0.5, 8], target: [0, 1, 0] },
  ];

  useEffect(() => {
    if (actions["Armature|mixamo.com|Layer0"]) {
      actions["Armature|mixamo.com|Layer0"].play().paused = true;
    }

    threeScene.fog = new THREE.Fog("#0f0f14", 5, 20);
    threeScene.background = new THREE.Color("#0f0f14");

    scene.traverse((child) => {
      if (child.isMesh) {
        child.material.transparent = true;
        child.material.opacity = 0.35;
        child.material.depthWrite = false;
        child.material.needsUpdate = true;
      }
    });
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;

    const partCount = 7;
    const rawPart = Math.floor(scrollY * partCount);
    const newPart = Math.min(rawPart, partCount - 1);
    if (newPart !== currentPart) setCurrentPart(newPart);

    const targetPos =
      cameraPositions[newPart % cameraPositions.length] || cameraPositions[0];
    camera.position.lerp(new THREE.Vector3(...targetPos.position), delta * 2);
    camera.lookAt(new THREE.Vector3(...targetPos.target));

    if (actions["Armature|mixamo.com|Layer0"]) {
      const partProgress = (scrollY * partCount) % 1;
      actions["Armature|mixamo.com|Layer0"].time =
        actions["Armature|mixamo.com|Layer0"].getClip().duration * partProgress;
    }

    if (currentPart === 5 && sparklesRef.current) {
      const pulseIntensity = Math.sin(state.clock.elapsedTime * 3) * 0.5 + 1.5;
      setSparklesIntensity(pulseIntensity);
      sparklesRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }

    scene.traverse((child) => {
      if (child.isMesh) {
        const emissive = new THREE.Color("#fbbf24");
        child.material.emissive = emissive;
        child.material.emissiveIntensity = Math.max(
          0.2,
          (scrollY % (1 / partCount)) * partCount * 1.5
        );
        child.material.opacity = 0.35;
        child.material.transparent = true;
        child.material.depthWrite = false;
        child.material.needsUpdate = true;
      }
    });
  });

  return (
    <>
      <FloatingIsland />
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.21}>
        <group ref={group} scale={[1.2, 1.2, 1.2]} position={[0, 0, 0]}>
          <primitive object={scene} />
        </group>
      </Float>
      <CloudPlane visible={currentPart <= 1} />

      {currentPart > 2 && (
        <Sparkles
          ref={sparklesRef}
          count={currentPart === 5 ? 120 : 60}
          scale={15}
          size={currentPart === 5 ? 2 : 1.2}
          speed={currentPart === 5 ? 0.8 : 0.3}
          color={currentPart === 5 ? "#ffffff" : "#fde68a"}
          noise={currentPart === 5 ? 0.2 : 0.1}
          opacity={sparklesIntensity}
        />
      )}

      {currentPart === 2 && (
        <Text
          position={[0, 2, -2]}
          fontSize={0.45}
          color="#eab308"
          anchorX="center"
          anchorY="middle"
        >
          Tersesat dalam kenyamanan
        </Text>
      )}

      {currentPart === 3 && (
        <Text
          position={[0, 2, -2]}
          fontSize={0.5}
          color="#f87171"
          anchorX="center"
          anchorY="middle"
        >
          Titik balik
        </Text>
      )}

      {currentPart === 5 && (
        <>
          <Text
            position={[0, 2, -2]}
            fontSize={0.5}
            color="#86efac"
            anchorX="center"
            anchorY="middle"
          >
            Nyala itu belum padam
          </Text>
          <pointLight
            position={[0, 1.5, 0]}
            intensity={sparklesIntensity * 2}
            color="#ffffff"
            distance={8}
            decay={1}
          />
        </>
      )}
    </>
  );
}

export default function ThreeCanvas({ scrollY, botReady }) {
  return (
    <Canvas
      shadows
      gl={{
        powerPreference: "high-performance",
        antialias: true,
        alpha: true,
      }}
      dpr={[1, 2]}
    >
      <PerspectiveCamera makeDefault fov={45} position={[0, 0.5, 8]} />
      <ambientLight intensity={0.15} color="#fcd5ce" />
      <spotLight
        position={[3, 5, 5]}
        angle={0.25}
        intensity={2}
        penumbra={0.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        color="#ffedd5"
      />
      <Environment preset="studio" />
      <Suspense fallback={null}>
        <ComicScene scrollY={scrollY} botReady={botReady} />
      </Suspense>
    </Canvas>
  );
}
