import { useEffect, useRef } from 'react';
import styles from './StoryAnimations.module.css';

// 1 - AWAKENING: Light rays breaking through darkness
const AwakeningAnimation = ({ isActive }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!isActive || !containerRef.current) return;

        containerRef.current.innerHTML = '';
        const rayCount = 8;

        for (let i = 0; i < rayCount; i++) {
            const ray = document.createElement('div');
            ray.className = styles.lightRay;
            const delay = i * 0.3;
            const width = 2 + Math.random() * 4;
            const opacity = 0.3 + Math.random() * 0.4;

            ray.style.setProperty('--delay', `${delay}s`);
            ray.style.setProperty('--width', `${width}px`);
            ray.style.setProperty('--opacity', opacity);
            ray.style.setProperty('--rotation', `${-30 + i * 10}deg`);

            containerRef.current.appendChild(ray);
        }

        return () => {
            if (containerRef.current) containerRef.current.innerHTML = '';
        };
    }, [isActive]);

    if (!isActive) return null;
    return <div className={styles.awakeningContainer} ref={containerRef} aria-hidden="true" />;
};

// 2 - AKSA: Small stable warm flame
const AksaAnimation = ({ isActive }) => {
    if (!isActive) return null;

    return (
        <div className={styles.aksaContainer} aria-hidden="true">
            <div className={styles.flame}>
                <div className={styles.flameCore}></div>
                <div className={styles.flameOuter}></div>
                <div className={styles.flameSpark}></div>
            </div>
        </div>
    );
};

// 3 - TIME: Floating dust particles
const TimeAnimation = ({ isActive }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!isActive || !containerRef.current) return;

        containerRef.current.innerHTML = '';
        const dustCount = 40;

        for (let i = 0; i < dustCount; i++) {
            const dust = document.createElement('div');
            dust.className = styles.dustParticle;

            const startX = Math.random() * 100;
            const startY = Math.random() * 100;
            const delay = Math.random() * 8;
            const duration = 6 + Math.random() * 8;
            const size = 2 + Math.random() * 4;
            const opacity = 0.2 + Math.random() * 0.4;

            dust.style.setProperty('--start-x', `${startX}%`);
            dust.style.setProperty('--start-y', `${startY}%`);
            dust.style.setProperty('--delay', `${delay}s`);
            dust.style.setProperty('--duration', `${duration}s`);
            dust.style.setProperty('--size', `${size}px`);
            dust.style.setProperty('--opacity', opacity);

            containerRef.current.appendChild(dust);
        }

        return () => {
            if (containerRef.current) containerRef.current.innerHTML = '';
        };
    }, [isActive]);

    if (!isActive) return null;
    return <div className={styles.timeContainer} ref={containerRef} aria-hidden="true" />;
};

// 4 - STUCK: Mud/quicksand pulling down
const StuckAnimation = ({ isActive }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!isActive || !containerRef.current) return;

        containerRef.current.innerHTML = '';
        const bubbleCount = 15;

        for (let i = 0; i < bubbleCount; i++) {
            const bubble = document.createElement('div');
            bubble.className = styles.mudBubble;

            const startX = 20 + Math.random() * 60;
            const delay = Math.random() * 6;
            const duration = 4 + Math.random() * 4;
            const size = 20 + Math.random() * 40;

            bubble.style.setProperty('--start-x', `${startX}%`);
            bubble.style.setProperty('--delay', `${delay}s`);
            bubble.style.setProperty('--duration', `${duration}s`);
            bubble.style.setProperty('--size', `${size}px`);

            containerRef.current.appendChild(bubble);
        }

        return () => {
            if (containerRef.current) containerRef.current.innerHTML = '';
        };
    }, [isActive]);

    if (!isActive) return null;
    return <div className={styles.stuckContainer} ref={containerRef} aria-hidden="true" />;
};

// 5 - TEST: Stone dropping in water creating ripples
const TestAnimation = ({ isActive }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!isActive || !containerRef.current) return;

        containerRef.current.innerHTML = '';

        // Create stone
        const stone = document.createElement('div');
        stone.className = styles.stone;
        containerRef.current.appendChild(stone);

        // Create ripples
        const rippleCount = 5;
        for (let i = 0; i < rippleCount; i++) {
            const ripple = document.createElement('div');
            ripple.className = styles.ripple;
            ripple.style.setProperty('--delay', `${i * 0.4}s`);
            containerRef.current.appendChild(ripple);
        }

        return () => {
            if (containerRef.current) containerRef.current.innerHTML = '';
        };
    }, [isActive]);

    if (!isActive) return null;
    return <div className={styles.testContainer} ref={containerRef} aria-hidden="true" />;
};

// 6 - REALIZE: Cracked mirror
const RealizeAnimation = ({ isActive }) => {
    if (!isActive) return null;

    return (
        <div className={styles.realizeContainer} aria-hidden="true">
            <div className={styles.mirror}>
                <svg className={styles.cracks} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                    <line x1="200" y1="200" x2="350" y2="100" className={styles.crack} style={{ '--delay': '0s' }} />
                    <line x1="200" y1="200" x2="280" y2="350" className={styles.crack} style={{ '--delay': '0.2s' }} />
                    <line x1="200" y1="200" x2="50" y2="150" className={styles.crack} style={{ '--delay': '0.4s' }} />
                    <line x1="200" y1="200" x2="120" y2="320" className={styles.crack} style={{ '--delay': '0.6s' }} />
                    <line x1="280" y1="350" x2="320" y2="380" className={styles.crack} style={{ '--delay': '0.8s' }} />
                    <line x1="350" y1="100" x2="380" y2="50" className={styles.crack} style={{ '--delay': '1s' }} />
                </svg>
            </div>
        </div>
    );
};

// 8 - JOURNEY: Small embers reigniting
const JourneyAnimation = ({ isActive }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!isActive || !containerRef.current) return;

        containerRef.current.innerHTML = '';
        const emberCount = 20;

        for (let i = 0; i < emberCount; i++) {
            const ember = document.createElement('div');
            ember.className = styles.ember;

            const startX = 40 + Math.random() * 20;
            const delay = Math.random() * 4;
            const duration = 2 + Math.random() * 3;
            const size = 3 + Math.random() * 5;

            ember.style.setProperty('--start-x', `${startX}%`);
            ember.style.setProperty('--delay', `${delay}s`);
            ember.style.setProperty('--duration', `${duration}s`);
            ember.style.setProperty('--size', `${size}px`);

            containerRef.current.appendChild(ember);
        }

        return () => {
            if (containerRef.current) containerRef.current.innerHTML = '';
        };
    }, [isActive]);

    if (!isActive) return null;
    return <div className={styles.journeyContainer} ref={containerRef} aria-hidden="true" />;
};

// 9 - HOPE: Clouds parting with sunlight
const HopeAnimation = ({ isActive }) => {
    if (!isActive) return null;

    return (
        <div className={styles.hopeContainer} aria-hidden="true">
            <div className={styles.sunrays}>
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className={styles.sunray}
                        style={{
                            '--rotation': `${i * 30}deg`,
                            '--delay': `${i * 0.1}s`
                        }}
                    />
                ))}
            </div>
            <div className={styles.cloudLeft}></div>
            <div className={styles.cloudRight}></div>
        </div>
    );
};

// Main component that manages all animations
const StoryAnimations = ({ activeFloorId }) => {
    return (
        <>
            <AwakeningAnimation isActive={activeFloorId === 1} />
            <AksaAnimation isActive={activeFloorId === 2} />
            <TimeAnimation isActive={activeFloorId === 3} />
            <StuckAnimation isActive={activeFloorId === 4} />
            <TestAnimation isActive={activeFloorId === 5} />
            <RealizeAnimation isActive={activeFloorId === 6} />
            <JourneyAnimation isActive={activeFloorId === 8} />
            <HopeAnimation isActive={activeFloorId === 9} />
        </>
    );
};

export default StoryAnimations;
