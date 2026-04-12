// components/ThreeDModel/MorningLightRays.jsx
"use client";
import { useEffect, useRef } from "react";
import styles from "./MorningLightRays.module.css";
import gsap from "gsap";

export default function MorningLightRays() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const rays = containerRef.current.querySelectorAll(`.${styles.lightRay}`);

        // Animate each ray with different timing for natural movement
        rays.forEach((ray, index) => {
            const delay = index * 0.3;
            const duration = 3 + Math.random() * 2;

            gsap.fromTo(
                ray,
                {
                    opacity: 0,
                    scale: 0.8,
                    x: -50,
                },
                {
                    opacity: 1,
                    scale: 1,
                    x: 0,
                    duration: duration,
                    delay: delay,
                    ease: "power2.out",
                }
            );

            // Subtle pulsing animation
            gsap.to(ray, {
                opacity: 0.4 + Math.random() * 0.3,
                duration: 2 + Math.random() * 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: delay,
            });

            // Gentle movement
            gsap.to(ray, {
                x: (Math.random() - 0.5) * 20,
                y: (Math.random() - 0.5) * 30,
                duration: 4 + Math.random() * 3,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: delay,
            });
        });
    }, []);

    return (
        <div ref={containerRef} className={styles.lightRaysContainer}>
            {/* Multiple irregular shaped light rays */}
            <div className={`${styles.lightRay} ${styles.ray1}`} />
            <div className={`${styles.lightRay} ${styles.ray2}`} />
            <div className={`${styles.lightRay} ${styles.ray3}`} />
            <div className={`${styles.lightRay} ${styles.ray4}`} />
            <div className={`${styles.lightRay} ${styles.ray5}`} />
            <div className={`${styles.lightRay} ${styles.ray6}`} />
            <div className={`${styles.lightRay} ${styles.ray7}`} />
            <div className={`${styles.lightRay} ${styles.ray8}`} />
        </div>
    );
}
