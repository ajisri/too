"use client";
import styles from "./style.module.css";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";

const words = ["Hello", "Bonjour", "やあ", "Hallå", "Guten tag", "Hallo"];

export default function Index() {
  const [index, setIndex] = useState(0);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });
  const preloaderRef = useRef(null);
  const textRef = useRef(null);
  const svgRef = useRef(null);
  const smokeRef = useRef(null);

  useEffect(() => {
    setDimension({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  useEffect(() => {
    if (index === words.length - 1) {
      // Setelah semua kata selesai, jalankan animasi exit
      gsap.to(preloaderRef.current, {
        y: "-100vh",
        duration: 0.8,
        ease: "power2.inOut",
        delay: 1, // Tunggu 1 detik sebelum menghilang
      });
      return;
    }

    const timeout = setTimeout(
      () => {
        setIndex(index + 1);
      },
      index === 0 ? 1000 : 500 // Durasi munculnya kata-kata
    );

    return () => clearTimeout(timeout); // Bersihkan timeout saat komponen unmount
  }, [index]);

  useEffect(() => {
    if (
      preloaderRef.current &&
      textRef.current &&
      svgRef.current &&
      smokeRef.current
    ) {
      // Animasi bounce pada teks
      gsap.fromTo(
        textRef.current,
        { y: -50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "bounce.out", // Gunakan efek bounce
          onComplete: () => {
            // Tambahkan efek asap setelah teks muncul
            gsap.fromTo(
              smokeRef.current,
              { opacity: 0, scale: 0 },
              {
                opacity: 1,
                scale: 1,
                duration: 0.5,
                ease: "power2.out",
                onComplete: () => {
                  // Hilangkan asap setelah beberapa detik
                  gsap.to(smokeRef.current, {
                    opacity: 0,
                    duration: 0.5,
                    delay: 0.3, // Asap menghilang setelah 0.3 detik
                  });
                },
              }
            );
          },
        }
      );

      // Animasi SVG path
      const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${
        dimension.height
      } Q${dimension.width / 2} ${dimension.height + 300} 0 ${
        dimension.height
      }  L0 0`;
      const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${
        dimension.height
      } Q${dimension.width / 2} ${dimension.height} 0 ${
        dimension.height
      }  L0 0`;

      gsap.fromTo(
        svgRef.current.querySelector("path"),
        { attr: { d: initialPath } },
        {
          attr: { d: targetPath },
          duration: 0.7,
          ease: "power2.inOut",
          delay: 0.3,
        }
      );
    }
  }, [dimension, index]);

  return (
    <div ref={preloaderRef} className={styles.introduction}>
      {dimension.width > 0 && (
        <>
          <p ref={textRef} className={styles.text}>
            <span className={styles.dot}></span>
            {words[index]}
          </p>
          <div ref={smokeRef} className={styles.smoke}></div>
          <svg ref={svgRef} className={styles.svgContainer}>
            <path className={styles.svgPath} fill="#141516"></path>
          </svg>
        </>
      )}
    </div>
  );
}
