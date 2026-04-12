import { useEffect, useRef } from 'react';
import styles from './SakuraAnimation.module.css';

const SakuraAnimation = ({ isActive }) => {
    const containerRef = useRef(null);
    const petalsRef = useRef([]);

    // Function to create a full sakura flower (5 petals)
    const createFullFlower = (opacity) => {
        return `
      <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(20,20)">
          <ellipse cx="0" cy="0" rx="7" ry="14" fill="rgba(255, 182, 193, ${opacity})" transform="rotate(0)"/>
          <ellipse cx="0" cy="0" rx="7" ry="14" fill="rgba(255, 192, 203, ${opacity})" transform="rotate(72)"/>
          <ellipse cx="0" cy="0" rx="7" ry="14" fill="rgba(255, 182, 193, ${opacity})" transform="rotate(144)"/>
          <ellipse cx="0" cy="0" rx="7" ry="14" fill="rgba(255, 192, 203, ${opacity})" transform="rotate(216)"/>
          <ellipse cx="0" cy="0" rx="7" ry="14" fill="rgba(255, 182, 193, ${opacity})" transform="rotate(288)"/>
          <circle cx="0" cy="0" r="2.5" fill="rgba(255, 240, 200, ${opacity * 0.9})"/>
        </g>
      </svg>
    `;
    };

    // Function to create a single sakura petal
    const createSinglePetal = (opacity, rotation) => {
        return `
      <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(15,15) rotate(${rotation})">
          <path 
            d="M 0,-12 Q 5,-8 6,-2 Q 5,2 0,8 Q -5,2 -6,-2 Q -5,-8 0,-12 Z" 
            fill="rgba(255, 182, 193, ${opacity})"
            stroke="rgba(255, 150, 170, ${opacity * 0.6})"
            stroke-width="0.5"
          />
          <path 
            d="M 0,-10 Q 3,-7 3,-3 Q 2,0 0,5 Q -2,0 -3,-3 Q -3,-7 0,-10 Z" 
            fill="rgba(255, 220, 230, ${opacity * 0.7})"
          />
        </g>
      </svg>
    `;
    };

    useEffect(() => {
        if (!isActive || !containerRef.current) return;

        // Clear existing petals
        petalsRef.current = [];
        containerRef.current.innerHTML = '';

        // Create sakura petals - mix of full flowers and single petals
        const petalCount = 60;
        const petals = [];

        for (let i = 0; i < petalCount; i++) {
            const petal = document.createElement('div');
            petal.className = styles.petal;

            // Random properties for each petal
            const startX = Math.random() * 100;
            const delay = Math.random() * 12;
            const duration = 8 + Math.random() * 12;
            const baseSize = 12 + Math.random() * 18;
            const opacity = 0.4 + Math.random() * 0.6;
            const swayAmount = 40 + Math.random() * 120;
            const rotation = Math.random() * 360;

            // Randomly decide if this is a full flower or single petal
            // 40% chance for full flower, 60% chance for single petal
            const isFullFlower = Math.random() < 0.4;
            const size = isFullFlower ? baseSize * 1.2 : baseSize * 0.8;

            // Set CSS custom properties
            petal.style.setProperty('--start-x', `${startX}%`);
            petal.style.setProperty('--delay', `${delay}s`);
            petal.style.setProperty('--duration', `${duration}s`);
            petal.style.setProperty('--size', `${size}px`);
            petal.style.setProperty('--opacity', opacity);
            petal.style.setProperty('--sway', `${swayAmount}px`);
            petal.style.setProperty('--rotation-speed', `${0.5 + Math.random() * 1.5}`);

            // Create either full flower or single petal
            if (isFullFlower) {
                petal.innerHTML = createFullFlower(opacity);
                petal.classList.add(styles.fullFlower);
            } else {
                petal.innerHTML = createSinglePetal(opacity, rotation);
                petal.classList.add(styles.singlePetal);
            }

            containerRef.current.appendChild(petal);
            petals.push(petal);
        }

        petalsRef.current = petals;

        // Cleanup function
        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
            petalsRef.current = [];
        };
    }, [isActive]);

    if (!isActive) return null;

    return (
        <div className={styles.sakuraContainer} ref={containerRef} aria-hidden="true" />
    );
};

export default SakuraAnimation;
