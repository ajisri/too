"use client";
import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function FlowerExplosion() {
  const mountRef = useRef(null);

  useEffect(() => {
    // Inisialisasi scene, kamera, dan renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    mountRef.current.appendChild(renderer.domElement);

    // Load tekstur kelopak bunga
    const loader = new THREE.TextureLoader();
    loader.load("/textures/petal.png", (texture) => {
      // Buat partikel
      const particleCount = 500;
      const geometry = new THREE.BufferGeometry();
      const positions = [];
      const velocities = [];

      for (let i = 0; i < particleCount; i++) {
        positions.push(0, 0, 0); // Mulai dari pusat
        const angle = Math.random() * 2 * Math.PI;
        const speed = Math.random() * 0.05 + 0.02;
        velocities.push(
          Math.cos(angle) * speed,
          Math.random() * 0.05,
          Math.sin(angle) * speed
        );
      }

      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );

      const material = new THREE.PointsMaterial({
        size: 0.2,
        map: texture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const particles = new THREE.Points(geometry, material);
      scene.add(particles);

      // Animasi
      const animate = () => {
        requestAnimationFrame(animate);

        const positions = geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] += velocities[i * 3];
          positions[i * 3 + 1] += velocities[i * 3 + 1];
          positions[i * 3 + 2] += velocities[i * 3 + 2];
        }
        geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
      };

      animate();
    });

    // Cleanup
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: "100vh", position: "relative" }}
    />
  );
}
