// components/ThreeDModel/MorningLightBeams.jsx
"use client";
import { useEffect, useRef } from "react";
import styles from "./MorningLightBeams.module.css";
import gsap from "gsap";

export default function MorningLightBeams() {
    const containerRef = useRef(null);
    const dustParticlesRef = useRef([]);

    useEffect(() => {
        if (!containerRef.current) return;

        const beams = containerRef.current.querySelectorAll(`.${styles.lightBeam}`);
        const dustContainers = containerRef.current.querySelectorAll(`.${styles.dustParticles}`);

        // Animate each beam with focused, sharp appearance
        beams.forEach((beam, index) => {
            const delay = index * 0.4;
            const duration = 2.5 + Math.random() * 1.5;

            // Initial appearance - sharp and focused
            gsap.fromTo(
                beam,
                {
                    opacity: 0,
                    scaleX: 0.3,
                    transformOrigin: "top center",
                },
                {
                    opacity: 1,
                    scaleX: 1,
                    duration: duration,
                    delay: delay,
                    ease: "power2.out",
                }
            );

            // Subtle intensity pulsing (like clouds passing)
            gsap.to(beam, {
                opacity: 0.7 + Math.random() * 0.3,
                duration: 3 + Math.random() * 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: delay,
            });

            // Very subtle width variation (atmospheric effect)
            gsap.to(beam, {
                scaleX: 0.95 + Math.random() * 0.1,
                duration: 5 + Math.random() * 3,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: delay + 1,
            });
        });

        // Create and animate dust particles (Tyndall effect)
        dustContainers.forEach((container, beamIndex) => {
            const particleCount = 25 + Math.floor(Math.random() * 15); // 25-40 particles per beam

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = styles.dustParticle;

                // Random position within beam
                const xPos = 20 + Math.random() * 60; // 20-80% horizontal
                const yPos = Math.random() * 100; // 0-100% vertical
                const size = 1 + Math.random() * 2.5; // 1-3.5px
                const delay = Math.random() * 5;
                const duration = 8 + Math.random() * 6; // 8-14s float time

                particle.style.left = `${xPos}%`;
                particle.style.top = `${yPos}%`;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;

                container.appendChild(particle);

                // Floating animation (slow upward drift)
                gsap.to(particle, {
                    y: -100 - Math.random() * 50,
                    x: (Math.random() - 0.5) * 30, // Slight horizontal drift
                    opacity: 0.3 + Math.random() * 0.4,
                    duration: duration,
                    delay: delay,
                    repeat: -1,
                    ease: "none",
                });

                // Twinkling effect
                gsap.to(particle, {
                    opacity: 0.1 + Math.random() * 0.6,
                    scale: 0.8 + Math.random() * 0.4,
                    duration: 1.5 + Math.random() * 2,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                    delay: delay + Math.random() * 2,
                });
            }
        });

        return () => {
            // Cleanup
            dustContainers.forEach(container => {
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
            });
        };
    }, []);

    return (
        <div ref={containerRef} className={styles.lightBeamsContainer}>
            {/* Sharp, focused light beams from gaps/cracks */}

            {/* Beam 1 - Strong central beam */}
            <div className={`${styles.lightBeam} ${styles.beam1}`}>
                <div className={styles.dustParticles}></div>
            </div>

            {/* Beam 2 - Left angled beam */}
            <div className={`${styles.lightBeam} ${styles.beam2}`}>
                <div className={styles.dustParticles}></div>
            </div>

            {/* Beam 3 - Right narrow beam */}
            <div className={`${styles.lightBeam} ${styles.beam3}`}>
                <div className={styles.dustParticles}></div>
            </div>

            {/* Beam 4 - Wide diffused beam */}
            <div className={`${styles.lightBeam} ${styles.beam4}`}>
                <div className={styles.dustParticles}></div>
            </div>

            {/* Beam 5 - Thin sharp beam */}
            <div className={`${styles.lightBeam} ${styles.beam5}`}>
                <div className={styles.dustParticles}></div>
            </div>

            {/* Floor light patterns - projected light on surfaces */}
            <div className={styles.floorLightPattern}></div>
        </div>
    );
}
