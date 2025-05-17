"use client";
import { useState, useEffect } from "react";
import Lenis from "@studio-freight/lenis";

export default function useLenisScroll() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const lenis = new Lenis({
      smooth: true,
      lerp: 0.1,
      syncTouch: true,
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    const handleScroll = ({ scroll }) => {
      setScrollY(scroll); // Dapetin scroll posisi realtime
    };

    lenis.on("scroll", handleScroll);

    return () => {
      lenis.off("scroll", handleScroll);
      lenis.destroy();
    };
  }, []);

  return scrollY;
}
