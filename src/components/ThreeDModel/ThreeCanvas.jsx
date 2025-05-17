// component/3d/ThreeCanvas.jsx - Modifikasi
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
import { useScroll } from "@react-three/drei";

function ComicScene({ scrollY, botReady }) {
  const group = useRef();
  const { scene, animations } = useGLTF("/models/bot.glb");
  const { actions } = useAnimations(animations, group);
  const { camera } = useThree();
  const [currentPart, setCurrentPart] = useState(0);

  // Array untuk menyimpan posisi dan rotasi kamera untuk setiap part
  const cameraPositions = [
    { position: [0, 0.5, 8], target: [0, 1, 0] },
    { position: [-2, 1.5, 6], target: [0, 1.2, 0] },
    { position: [2, 0.8, 7], target: [0.5, 1, 0] },
    // Tambahkan lebih banyak posisi sesuai kebutuhan
  ];

  useEffect(() => {
    if (actions["Armature|mixamo.com|Layer0"]) {
      actions["Armature|mixamo.com|Layer0"].play().paused = true;
    }
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;

    // Hitung part saat ini berdasarkan scroll
    const partCount = 7; // Jumlah total part
    const rawPart = Math.floor(scrollY * partCount);
    const newPart = Math.min(rawPart, partCount - 1);

    if (newPart !== currentPart) {
      setCurrentPart(newPart);
    }

    // Animasi transisi kamera
    const targetPos =
      cameraPositions[newPart % cameraPositions.length] || cameraPositions[0];
    camera.position.lerp(new THREE.Vector3(...targetPos.position), delta * 2);
    camera.lookAt(new THREE.Vector3(...targetPos.target));

    // Animasi karakter berdasarkan part
    if (actions["Armature|mixamo.com|Layer0"]) {
      const partProgress = (scrollY * partCount) % 1;
      actions["Armature|mixamo.com|Layer0"].time =
        actions["Armature|mixamo.com|Layer0"].getClip().duration * partProgress;
    }

    // Efek visual berdasarkan part
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material.emissiveIntensity =
          (scrollY % (1 / partCount)) * partCount * 2;
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

      {/* Efek khusus untuk setiap part */}
      {currentPart > 2 && (
        <Sparkles
          count={100}
          scale={15}
          size={1.5}
          speed={0.5}
          color="#fbbf24"
        />
      )}

      {/* Teks 3D untuk beberapa part */}
      {currentPart === 3 && (
        <Text
          position={[0, 2, -2]}
          fontSize={0.5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Turning Point
        </Text>
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
      <color attach="background" args={["#05050f"]} />
      <ambientLight intensity={0.5} color="#4f46e5" />
      <spotLight
        position={[5, 5, 5]}
        angle={0.3}
        intensity={2}
        penumbra={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        color="#ffffff"
      />
      <Environment preset="studio" />
      <Suspense fallback={null}>
        <ComicScene scrollY={scrollY} botReady={botReady} />
      </Suspense>
    </Canvas>
  );
}
