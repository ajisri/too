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

    // Tambahkan fog dan latar belakang gelap
    threeScene.fog = new THREE.Fog("#0f0f14", 5, 20);
    threeScene.background = new THREE.Color("#0f0f14");

    // Buat semua mesh transparan
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

    // Animasi Sparkles pada part tertentu
    if (currentPart === 5 && sparklesRef.current) {
      const pulseIntensity = Math.sin(state.clock.elapsedTime * 3) * 0.5 + 1.5;
      setSparklesIntensity(pulseIntensity);

      // Gerakan melayang perlahan
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

        // Transparansi dinamis opsional
        child.material.opacity = 0.35;
        child.material.transparent = true;
        child.material.depthWrite = false;
        child.material.needsUpdate = true;
      }
    });
  });

  return (
    <>
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.3}>
        <group ref={group} scale={[1.2, 1.2, 1.2]}>
          <primitive object={scene} />
        </group>
      </Float>

      {currentPart > 2 && (
        <Sparkles
          ref={sparklesRef}
          count={currentPart === 5 ? 120 : 60} // Lebih banyak sparkles saat part 5
          scale={15}
          size={currentPart === 5 ? 2 : 1.2} // Lebih besar saat part 5
          speed={currentPart === 5 ? 0.8 : 0.3} // Lebih cepat saat part 5
          color={currentPart === 5 ? "#ffffff" : "#fde68a"} // Putih terang saat part 5
          noise={currentPart === 5 ? 0.2 : 0.1} // Lebih beragam gerakannya
          opacity={sparklesIntensity}
        />
      )}

      {/* Teks emosional 3D */}
      {currentPart === 2 && (
        <Text
          position={[0, 2, -2]}
          fontSize={0.45}
          color="#eab308"
          anchorX="center"
          anchorY="middle"
        >
          "Tersesat dalam kenyamanan"
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
          "Titik balik"
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
            "Nyala itu belum padam"
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
