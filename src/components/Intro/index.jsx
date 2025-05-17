"use client";
import React, { useEffect, useState, useLayoutEffect, useRef } from "react";
import styles from "./style.module.css";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Index() {
  const background = useRef(null);
  const introImage = useRef(null);
  const textRef = useRef(null);

  const [greeting, setGreeting] = useState("HALO");

  // Function untuk menentukan ucapan
  const getGreeting = () => {
    try {
      const now = new Date();
      const options = { hour: "numeric", hour12: false };
      const hour = new Intl.DateTimeFormat(navigator.language, options)
        .format(now)
        .replace(/[^0-9]/g, "");

      const parsedHour = parseInt(hour, 10);
      if (parsedHour >= 5 && parsedHour < 8) return "Selamat Pagi";
      if (parsedHour >= 8 && parsedHour < 14) return "Selamat Siang";
      if (parsedHour >= 14 && parsedHour < 18) return "Selamat Sore";
      return "Selamat Malam";
    } catch (error) {
      console.error("Gagal mendeteksi waktu lokal:", error);
      return "HALO";
    }
  };

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: document.documentElement,
        scrub: true,
        start: "top",
        end: "+=500px",
      },
    });

    timeline
      .fromTo(
        background.current,
        {
          clipPath: "inset(13%)",
          opacity: 0.9,
          filter: "blur(10px)",
        },
        {
          clipPath: "inset(0%)",
          opacity: 1,
          filter: "blur(0px)",
          ease: "power2.out",
        }
      )
      .to(introImage.current, { height: "200px", y: -50 }, 0)
      .fromTo(
        textRef.current,
        { opacity: 0.8, y: 10 },
        { opacity: 1, y: -120, duration: 0.4 },
        "-=0.5"
      );
  }, []);

  return (
    <div className={styles.homeHeader}>
      <div className={styles.backgroundImage} ref={background}>
        <Image
          src={"/images/background.jpeg"}
          fill={true}
          alt="background image"
          priority={true}
        />
      </div>
      <div className={styles.intro}>
        <div ref={introImage} className={styles.introImage}>
          <Image
            src={"/images/intro.png"}
            alt="intro image"
            fill={true}
            priority={true}
          />
        </div>
        <h1 ref={textRef} className={styles.animatedText}>
          {greeting}
        </h1>
      </div>
    </div>
  );
}
