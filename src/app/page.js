"use client";
import Preloader from "../components/Preloader";
import HeroSection from "../components/Intro";
import Project from "../components/Project";
import Footer from "../components/Footer";
import styles from "./page.module.css";
import dynamic from "next/dynamic";
import { SmoothScrollProvider } from "../components/SmoothScrollProvider";

const ThreeScene = dynamic(() => import("@/components/ThreeDModel"), {
  ssr: false,
  loading: () => <div className="h-screen bg-black" />,
});

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Home() {
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Transition from black (ThreeScene) to white (Project section)
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
    });

    return () => ctx.revert();
  }, []);

  return (
    <SmoothScrollProvider>
      <main className={styles.main}>
        {/* Global background color transition layer */}
        <div
          id="main-bg"
          className="fixed inset-0 pointer-events-none -z-10"
          style={{ backgroundColor: "black" }}
        />

        {/* Preloader — cinematic greeting */}
        <Preloader />

        {/* Hero Section — full-viewport landing, collapses into story */}
        <section id="hero-section" className="relative z-10">
          <HeroSection />
        </section>

        {/* Narrative 3D Story Scene */}
        <section
          className="relative z-10 min-h-[600vh] overflow-hidden text-white"
          id="three-section"
        >
          <ThreeScene />
        </section>

        {/* Project & Footer */}
        <section className="relative z-0" id="project-section">
          <Project />
          <div className="h-[130px]"></div>
          <Footer />
        </section>
      </main>
    </SmoothScrollProvider>
  );
}

