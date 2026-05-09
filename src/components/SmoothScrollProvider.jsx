"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";

const LenisContext = createContext({ lenis: null, isReady: false });

/**
 * Single Lenis instance provider — prevents triple-instantiation bug.
 * All components should use useLenis() hook instead of creating their own Lenis.
 */
export function SmoothScrollProvider({ children }) {
  const [lenis, setLenis] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const rafIdRef = useRef(null);

  useEffect(() => {
    let instance = null;

    const init = async () => {
      const Lenis = (await import("@studio-freight/lenis")).default;
      const isMobile = window.innerWidth <= 768;

      instance = new Lenis({
        lerp: isMobile ? 0.08 : 0.05,
        smoothWheel: true,
        syncTouch: true,
        touchMultiplier: isMobile ? 1.2 : 1.5,
      });

      gsap.registerPlugin(ScrollTrigger);
      instance.on("scroll", ScrollTrigger.update);

      const raf = (time) => {
        instance.raf(time);
        rafIdRef.current = requestAnimationFrame(raf);
      };
      rafIdRef.current = requestAnimationFrame(raf);

      setLenis(instance);
      setIsReady(true);
    };

    init();

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      instance?.destroy();
    };
  }, []);

  return (
    <LenisContext.Provider value={{ lenis, isReady }}>
      {children}
    </LenisContext.Provider>
  );
}

// Hook to access Lenis instance and ready state
export function useLenis() {
  return useContext(LenisContext);
}
