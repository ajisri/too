// hooks/useMediaQuery.js
"use client";
import { useState, useEffect } from "react";

/**
 * Custom hook for responsive design
 * Returns boolean based on media query match
 */
export function useMediaQuery(query) {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);

        // Set initial value
        if (media.matches !== matches) {
            setMatches(media.matches);
        }

        // Create listener
        const listener = () => setMatches(media.matches);

        // Modern browsers
        if (media.addEventListener) {
            media.addEventListener("change", listener);
            return () => media.removeEventListener("change", listener);
        } else {
            // Fallback for older browsers
            media.addListener(listener);
            return () => media.removeListener(listener);
        }
    }, [matches, query]);

    return matches;
}

/**
 * Predefined breakpoint hooks for common use cases
 */
export function useIsMobile() {
    return useMediaQuery("(max-width: 768px)");
}

export function useIsTablet() {
    return useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
}

export function useIsDesktop() {
    return useMediaQuery("(min-width: 1025px)");
}

export function useIsMobileOrTablet() {
    return useMediaQuery("(max-width: 1024px)");
}

/**
 * Get device type as string
 */
export function useDeviceType() {
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();

    if (isMobile) return "mobile";
    if (isTablet) return "tablet";
    return "desktop";
}
