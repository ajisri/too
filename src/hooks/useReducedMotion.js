import { useEffect, useState } from "react";

/**
 * Hook to detect if user prefers reduced motion
 * Useful for accessibility - users with motion sensitivity can disable animations
 * @returns {boolean} true if user prefers reduced motion
 */
export function useReducedMotion() {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        // Check if window is available (client-side only)
        if (typeof window === "undefined") return;

        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mediaQuery.matches);

        const listener = (e) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener("change", listener);

        return () => mediaQuery.removeEventListener("change", listener);
    }, []);

    return prefersReducedMotion;
}
