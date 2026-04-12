import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function FloatingFlames() {
  const group = useRef();
  const particles = useRef([]);
  const count = 50; // jumlah kobaran kecil

  // setup posisi awal
  if (particles.current.length === 0) {
    for (let i = 0; i < count; i++) {
      particles.current.push({
        x: (Math.random() - 0.5) * 2,
        y: Math.random() * 2,
        z: (Math.random() - 0.5) * 2,
        speed: 0.01 + Math.random() * 0.02,
      });
    }
  }

  useFrame(() => {
    group.current.children.forEach((mesh, i) => {
      let p = particles.current[i];
      mesh.position.y += p.speed;
      if (mesh.position.y > 3) {
        mesh.position.y = 0; // reset ke bawah
      }
    });
  });

  return (
    <group ref={group}>
      {particles.current.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial
            color={new THREE.Color(`hsl(${30 + Math.random() * 20},100%,50%)`)}
            emissive="orange"
            emissiveIntensity={1.5}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

export default FloatingFlames;
