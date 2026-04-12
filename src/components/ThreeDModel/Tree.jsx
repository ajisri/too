// components/ThreeDModel/Tree.jsx
"use client";

import { useRef, useMemo, useLayoutEffect } from "react";
import * as THREE from "three";
import { useIsMobile, useIsTablet } from "@/hooks/useMediaQuery";

/**
 * Tree Component - Renders a realistic tree with trunk and foliage
 * @param {number} currentPart - Current story part (0-8)
 * @param {number} opacity - Tree opacity (0-1)
 * @param {object} props - Additional props (position, rotation, etc.)
 */
export default function Tree({ currentPart, opacity = 1, ...props }) {
    const leavesRef = useRef();
    const trunkRef = useRef();
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();

    // Responsive leaf count for performance
    const leafCount = useMemo(() => {
        if (isMobile) return 600;
        if (isTablet) return 1000;
        return 1600;
    }, [isMobile, isTablet]);

    // Generate leaf positions - clustered at top of tree
    const leafData = useMemo(() => {
        const data = [];
        const dummy = new THREE.Object3D();

        for (let i = 0; i < leafCount; i++) {
            // Spherical distribution for natural canopy
            const phi = Math.acos(2 * Math.random() - 1);
            const theta = Math.random() * 2 * Math.PI;
            const r = 0.4 + Math.random() * 0.7;

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta) * 0.7;
            const z = r * Math.cos(phi);

            // Position leaves at TOP - trunk ends at y=2.0, leaves start from y=2.2
            dummy.position.set(x, 2.2 + y * 0.8, z);
            dummy.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            // Small leaf size (0.05-0.1 units)
            const scale = 0.05 + Math.random() * 0.05;
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();
            data.push(dummy.matrix.clone());
        }

        return data;
    }, [leafCount]);

    // Update instanced mesh matrices
    useLayoutEffect(() => {
        if (leavesRef.current) {
            leafData.forEach((matrix, i) => {
                leavesRef.current.setMatrixAt(i, matrix);
            });
            leavesRef.current.instanceMatrix.needsUpdate = true;
        }
    }, [leafData]);

    // Only show tree from part 1 (AKSA) onwards
    if (currentPart < 1) return null;

    return (
        <group position={props.position} rotation={[0, 0, 0]} scale={props.scale} visible={opacity > 0}>
            {/* Trunk: y=0 (bottom) to y=2 (top) */}
            <mesh ref={trunkRef} position={[0, 1.0, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.15, 0.22, 2.0, 16]} />
                <meshStandardMaterial
                    color="#4a3c31"
                    roughness={0.9}
                    metalness={0.1}
                    transparent
                    opacity={opacity}
                />
            </mesh>

            {/* Foliage: small spheres clustered at top (y=2.2-3.0) */}
            <instancedMesh
                ref={leavesRef}
                args={[null, null, leafData.length]}
                castShadow
                receiveShadow
            >
                <sphereGeometry args={[1, 6, 6]} />
                <meshStandardMaterial
                    color="#2d5016"
                    roughness={0.7}
                    metalness={0.1}
                    transparent
                    opacity={opacity}
                />
            </instancedMesh>

            {/* Sunrise lighting */}
            <directionalLight
                position={[5, 3, 2]}
                intensity={1.5 * opacity}
                color="#ff9966"
                castShadow
                shadow-mapSize={[1024, 1024]}
            />
            <pointLight
                position={[3, 2, 1]}
                intensity={0.8 * opacity}
                color="#ffaa77"
                distance={8}
                decay={2}
            />

            {/* Shadow catcher */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[1.5, 32]} />
                <shadowMaterial opacity={0.3 * opacity} />
            </mesh>
        </group>
    );
}
