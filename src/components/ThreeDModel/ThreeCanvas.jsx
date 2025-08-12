// component/ThreeDModel/ThreeCanvas.jsx
"use client";
import { Suspense, useRef, useEffect, useState, useMemo } from "react";
import styles from "./style.module.css";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  useAnimations,
  Environment,
  Sparkles,
  PerspectiveCamera,
} from "@react-three/drei";
import * as THREE from "three";
import { useSpring, a } from "@react-spring/three";

function CloudPlane({
  visible = true,
  z = -20,
  opacity = 0.2,
  scale = [100, 50],
  currentPart = 0,
  rotationY = 0,
}) {
  const meshRef = useRef();
  const [shaderMaterial] = useState(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: true,
        uniforms: {
          time: { value: 0 },
          uOpacity: { value: opacity },
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
        
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }
        
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          
          vec2 u = f*f*f*(f*(f*6.0-15.0)+10.0);
          
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          
          return mix(a, b, u.x) + 
                 (c - a)* u.y * (1.0 - u.x) + 
                 (d - b) * u.x * u.y;
        }
        
        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.3;
          float frequency = 0.8;
          
          for (int i = 0; i < 4; i++) {
            value += amplitude * noise(p * frequency);
            frequency *= 1.8;
            amplitude *= 0.5;
          }
          return value;
        }
        
        void main() {
          vec2 uv = vUv * 1.8;
          float t = time * 0.015;
          
          float clouds = fbm(uv + vec2(t, t * 0.7));
          
          vec2 uv2 = uv * 0.5;
          clouds += 0.1 * fbm(uv2 * 1.5 + vec2(t * 0.3, t * 0.5));
          
          float alpha = smoothstep(0.4, 0.7, clouds) * uOpacity;
          
          vec3 cloudColor = mix(
            vec3(0.95, 0.97, 1.0),
            vec3(0.8, 0.85, 0.9),
            smoothstep(0.3, 0.9, clouds)
          );
          
          gl_FragColor = vec4(cloudColor, alpha);
        }
      `,
      })
  );

  useFrame((_, delta) => {
    shaderMaterial.uniforms.time.value += delta;
    if (meshRef.current) {
      if (currentPart >= 7) {
        meshRef.current.rotation.y = rotationY;
      } else {
        meshRef.current.rotation.y = 0;
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      visible={visible}
      position={[0, 0, z]}
      rotation={[0, currentPart >= 7 ? rotationY : 0, 0]}
      renderOrder={-1}
    >
      <planeGeometry args={[scale[0], scale[1], 16, 16]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
}

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPos;

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
    
    float noiseFreq = 1.2;
    float noiseAmp = 0.3;

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

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.renderOrder = 0;
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={new THREE.CylinderGeometry(1.7, 1, 1.6, 70, 96, false)}
      material={material}
      position={[0, -0.75, -0.8]}
      castShadow
      receiveShadow
    />
  );
}

function ComicScene({ scrollY, botReady }) {
  const islandRef = useRef();
  const group = useRef();
  const sparklesRef = useRef();
  const { scene, animations } = useGLTF("/models/bot.glb");
  const { actions } = useAnimations(animations, group);
  const { camera, scene: threeScene } = useThree();
  const [currentPart, setCurrentPart] = useState(0);
  const [sparklesIntensity, setSparklesIntensity] = useState(1.2);

  const [spring, setSpring] = useSpring(() => ({
    positionX: 0,
    scale: 1,
    opacity: 0,
    config: { mass: 1, tension: 170, friction: 26 },
  }));

  const cameraPositions = [
    { position: [0, 0.5, 8], target: [0, 1, 0] },
    { position: [-1, 0.3, 7], target: [-0.5, 0.8, 0] },
    { position: [2, 0.8, 5], target: [0.5, 0.5, 0] },
    { position: [0, 0.5, 4], target: [0, 0.5, 0] },
    { position: [0, 3, 6], target: [0, 0, 0] },
    { position: [0, 2.5, 5.5], target: [0, -0.5, 0] },
    { position: [0, -0.5, 7], target: [0, 1, 0] },
    {
      position: [
        3 * Math.cos(scrollY * Math.PI),
        1,
        3 * Math.sin(scrollY * Math.PI),
      ],
      target: [0, 1, 0],
    },
    { position: [0, 0.5, 9], target: [0, 1, 0] },
  ];

  useEffect(() => {
    if (actions["Armature|mixamo.com|Layer0"]) {
      actions["Armature|mixamo.com|Layer0"].play().paused = true;
    }

    threeScene.fog = new THREE.Fog("#0f0f14", 5, 20);
    threeScene.background = null;

    scene.traverse((child) => {
      if (child.isMesh) {
        child.material.transparent = true;
        child.material.opacity = 0.9;
        child.material.depthWrite = true;
        child.material.needsUpdate = true;
        child.renderOrder = 1;
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

    switch (currentPart) {
      case 0:
        setSpring({
          positionX: 0,
          positionY: Math.sin(partProgress * Math.PI) * 0.2 - 0.75,
          rotationY: partProgress * Math.PI * 0.5,
          scale: THREE.MathUtils.lerp(0.8, 1, partProgress),
          opacity: THREE.MathUtils.lerp(0, 1, partProgress * 2),
          config: { mass: 1, tension: 100, friction: 15 },
        });
        break;

      case 1:
        setSpring({
          positionX: THREE.MathUtils.lerp(-2, -1.8, partProgress),
          positionY: THREE.MathUtils.lerp(-0.75, 0.5, partProgress),
          scale: THREE.MathUtils.lerp(1.2, 1.4, partProgress),
          rotationY: THREE.MathUtils.lerp(
            Math.PI * 0.5,
            Math.PI * 0.8,
            partProgress
          ),
          opacity: 1,
          config: { mass: 1, tension: 145, friction: 15 },
        });
        break;

      case 2:
        setSpring({
          positionX: THREE.MathUtils.lerp(-1.8, 5, partProgress), // Restrict movement to the right only
          positionY: THREE.MathUtils.lerp(0.2, -0.2, partProgress),
          scale: THREE.MathUtils.lerp(0.5, 0, partProgress),
          rotationY: THREE.MathUtils.lerp(Math.PI * 0.8, 0, partProgress),
          opacity: 1,
          config: { mass: 1, tension: 140, friction: 15 },
        });
        break;

      case 3:
        setSpring({
          positionX: 0.1 + Math.sin(partProgress * Math.PI * 5) * 0.2,
          positionY: -0.5 + Math.sin(partProgress * Math.PI * 8) * 0.1,
          scale: THREE.MathUtils.lerp(0.8, 0, partProgress),
          rotationY: Math.sin(partProgress * Math.PI * 5) * 0.5,
          opacity: THREE.MathUtils.lerp(1, 0, partProgress),
          config: { mass: 1, tension: 180, friction: 10 },
        });
        break;

      // case 4:
      //   setSpring({
      //     positionX: 0,
      //     positionY: THREE.MathUtils.lerp(2, -0.95, partProgress * 1.5), // Slightly lower
      //     scale: THREE.MathUtils.lerp(0, 1.8, partProgress * 1.5), // Larger scale before normalizing
      //     rotationY: THREE.MathUtils.lerp(0, Math.PI * 2, partProgress),
      //     opacity: THREE.MathUtils.lerp(0, 1, partProgress * 3),
      //     config: { mass: 1, tension: 250, friction: 15 },
      //   });
      //   break;

      case 4:
        setSpring({
          positionX: 0.1 + Math.sin(partProgress * Math.PI * 5) * 0.2,
          positionY: -0.5 + Math.sin(partProgress * Math.PI * 8) * 0.1,
          scale: THREE.MathUtils.lerp(0.8, 0, partProgress),
          rotationY: Math.sin(partProgress * Math.PI * 5) * 0.5,
          opacity: THREE.MathUtils.lerp(1, 0, partProgress),
          config: { mass: 1, tension: 180, friction: 10 },
        });
        break;

      case 5:
        setSpring({
          positionX: 0,
          positionY: -0.95, // Keep lower position
          scale: THREE.MathUtils.lerp(1.8, 0.85, partProgress), // Normalize to slightly smaller
          opacity: 1,
          config: { mass: 1, tension: 170, friction: 12 },
        });
        break;

      case 6:
        setSpring({
          positionX: 0,
          positionY: -0.75,
          rotationY: partProgress * Math.PI,
          scale: 1,
          opacity: 1,
          config: { mass: 1, tension: 60, friction: 10 },
        });
        break;

      case 7:
        setSpring({
          positionX: -80,
          positionY: -0.75 + Math.sin(partProgress * Math.PI) * 0.1,
          rotationY: Math.PI + partProgress * Math.PI,
          scale: 1,
          opacity: 1.2,
          config: { mass: 1, tension: 50, friction: 8 },
        });
        break;

      case 8:
        setSpring({
          positionX: THREE.MathUtils.lerp(0, -2, partProgress),
          positionY: THREE.MathUtils.lerp(0.2, -0.2, partProgress),
          scale: THREE.MathUtils.lerp(0.8, 0, partProgress),
          rotationY: THREE.MathUtils.lerp(Math.PI * 0.8, 0, partProgress),
          opacity: 1,
          config: { mass: 1, tension: 140, friction: 15 },
        });
        break;

      default:
        setSpring({
          positionX: 0,
          positionY: -0.75,
          rotationY: 0,
          scale: 1,
          opacity: 1,
          config: { mass: 1, tension: 170, friction: 26 },
        });
    }
  }, [scrollY]);

  useFrame((state, delta) => {
    const partCount = 9;
    const rawPart = Math.floor(scrollY * partCount);
    const newPart = Math.min(rawPart, partCount - 1);
    if (newPart !== currentPart) setCurrentPart(newPart);

    let cameraIndex = newPart;
    if (newPart >= 5) cameraIndex = newPart + 1;

    const targetPos = cameraPositions[cameraIndex] || cameraPositions[0];
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
      }
    });
    const light = threeScene.getObjectByName("MainSpot");
    if (light) {
      light.position.lerp(
        camera.position.clone().add(new THREE.Vector3(3, 5, 5)),
        delta * 1
      );
    }
  });

  return (
    <>
      <a.group
        ref={islandRef}
        position-x={spring.positionX}
        scale={spring.scale}
      >
        <FloatingIsland />
        <a.group ref={group} scale={[1.2, 1.2, 1.2]} position={[0, 0.1, 0]}>
          <primitive object={scene} />
        </a.group>
      </a.group>

      <CloudPlane visible={true} z={-20} opacity={0.2} scale={[120, 60]} />
      <CloudPlane visible={true} z={-15} opacity={0.15} scale={[100, 50]} />

      {currentPart <= 2 && (
        <CloudPlane visible={true} z={1.5} opacity={0.08} scale={[45, 20]} />
      )}

      {currentPart > 2 && (
        <Sparkles
          ref={sparklesRef}
          count={currentPart === 5 ? 120 : 60}
          scale={15}
          size={currentPart === 5 ? 2 : 1.2}
          speed={currentPart === 5 ? 0.8 : 0.3}
          color={currentPart === 5 ? "#ffffff" : "#050400"}
          noise={currentPart === 5 ? 0.2 : 0.1}
          opacity={sparklesIntensity}
        />
      )}
    </>
  );
}

export default function ThreeCanvas({ scrollY, botReady }) {
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
        <PerspectiveCamera makeDefault fov={45} position={[0, 0.5, 8]} />
        <ambientLight intensity={0.15} color="#fcd5ce" />
        <spotLight
          name="MainSpot"
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
    </div>
  );
}
