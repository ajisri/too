"use client";
import { createContext, useContext, useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const LenisContext = createContext(null);

export function SmoothScrollProvider({ children }) {
    const lenisRef = useRef(null);

    useEffect(() => {
        // Initialize Lenis only once
        lenisRef.current = new Lenis({
            lerp: 0.08,
            smoothWheel: true,
            syncTouch: true,
            smooth: true,
            touchMultiplier: 2,
            infinite: false,
        });

        // Sync with GSAP ScrollTrigger
        lenisRef.current.on("scroll", ScrollTrigger.update);

        // Animation loop
        const raf = (time) => {
            lenisRef.current?.raf(time);
            requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);

        return () => {
            lenisRef.current?.destroy();
        };
    }, []);

    return (
        <LenisContext.Provider value={lenisRef.current}>
            {children}
        </LenisContext.Provider>
    );
}

// Hook to access Lenis instance
export function useLenis() {
    return useContext(LenisContext);
}
