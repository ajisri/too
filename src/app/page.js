"use client";
import Preloader from "../components/Preloader";
import Intro from "../components/Intro";
import Description from "../components/Description";
import Project from "../components/Project";
import Footer from "../components/Footer";
import styles from "./page.module.css";
import dynamic from "next/dynamic";
import useLenisScroll from "../hooks/useLenisScroll"; // Import hook

const ThreeScene = dynamic(() => import("@/components/ThreeDModel"), {
  ssr: false,
  loading: () => <div className="h-screen bg-black" />, // Loading black screen
});

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Home() {
  // const scrollY = useLenisScroll();

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Reset to white when at the top
    ScrollTrigger.create({
      trigger: "main",
      start: "top top",
      onEnter: () => gsap.to("#main-bg", { backgroundColor: "#ffffff", duration: 0.5 }),
      onEnterBack: () => gsap.to("#main-bg", { backgroundColor: "#ffffff", duration: 0.5 }),
    });

    ScrollTrigger.create({
      trigger: "#project-section",
      start: "top center",
      onEnter: () => {
        gsap.to("#main-bg", {
          backgroundColor: "#ffffff",
          duration: 1,
          ease: "power2.inOut",
        });
      },
      onEnterBack: () => {
        gsap.to("#main-bg", {
          backgroundColor: "#000000",
          duration: 1,
          ease: "power2.inOut",
        });
      },
    });
  }, []);

  return (
    <main className={styles.main}>
      {/* Container untuk transisi warna latar belakang global */}
      <div 
        id="main-bg" 
        className="fixed inset-0 pointer-events-none -z-10 transition-colors duration-1000 ease-out"
        style={{ backgroundColor: "white" }}
      />
      <Preloader />
      <Intro />
      <Description />

      {/* Three Scene Section - Latar belakang akan dikontrol oleh main-bg jika transparan, 
          tapi di sini kita tetap pakai bg-black untuk keamanan visual saat ThreeJS load */}
      <section
        className="relative z-10 min-h-[600vh] overflow-hidden text-white"
        id="three-section"
      >
        <ThreeScene />
      </section>

      {/* Section dengan background portal - Latar belakang akan dikontrol oleh main-bg */}
      <section className="relative z-0" id="project-section">
        <Project />
        <div className="h-[130px]"></div>
        <Footer />
      </section>
    </main>
  );
}
