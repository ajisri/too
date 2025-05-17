import React, { useState, useLayoutEffect, useRef, useEffect } from "react";
import styles from "./style.module.css";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

const projects = [
  {
    title: "Salar de Atacama",
    src: "salar_de_atacama.jpg",
    description: [
      "Chip ini menggunakan algoritme adaptasi yang andal untuk memproses suara lebih cepat.",
      "Setiap detail dirender untuk bentuk telinga Anda yang spesifik.",
    ],
  },
  {
    title: "Valle de la luna",
    src: "valle_de_la_muerte.jpeg",
    description: [
      "Menyetel audio tepat pada saat Anda mendengarnya.",
      "Anda hanyut dalam suara fidelity yang lebih tinggi.",
    ],
  },
  // ... tambahkan data lainnya
];

export default function Index() {
  const [selectedProject, setSelectedProject] = useState(0);
  const container = useRef(null);
  const imageContainer = useRef(null);
  const textContainer = useRef(null);

  // Smooth scroll dengan Lenis
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Animasi untuk pinning dan parallax
    ScrollTrigger.create({
      trigger: imageContainer.current,
      pin: true,
      start: "top-=100px",
      end: "+=1000",
      scrub: 0.5,
    });

    // Animasi teks fade in
    const columns = textContainer.current.querySelectorAll(`.${styles.column}`);
    columns.forEach((col) => {
      gsap.fromTo(
        col,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: col,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    return () => ScrollTrigger.killAll();
  }, []);

  return (
    <div ref={container} className={styles.projects}>
      <div className={styles.projectDescription}>
        <div ref={imageContainer} className={styles.imageContainer}>
          <Image
            src={`/images/${projects[selectedProject].src}`}
            fill={true}
            alt="project image"
            priority={true}
            className={styles.projectImage}
          />
        </div>

        <div ref={textContainer} className={styles.textColumns}>
          <div className={styles.column}>
            <p>{projects[selectedProject].description[0]}</p>
          </div>
          <div className={styles.column}>
            <p>{projects[selectedProject].description[1]}</p>
          </div>
        </div>
      </div>

      <div className={styles.projectList}>
        {projects.map((project, index) => (
          <div
            key={index}
            onMouseOver={() => setSelectedProject(index)}
            className={styles.projectEl}
          >
            <h2>{project.title}</h2>
            <div className={styles.projectLine}></div>
          </div>
        ))}
      </div>
    </div>
  );
}
