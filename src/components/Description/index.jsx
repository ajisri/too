import React, { useLayoutEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import styles from "./style.module.css";
import Lenis from "@studio-freight/lenis"; // Import Lenis

const phrases = [
  "Frontend Developer",
  "Ajis Riyananta",
  "available for work",
  "based in Semarang Indonesia",
];

export default function Index() {
  return (
    <div className={styles.description}>
      {phrases.map((phrase, index) => {
        return <AnimatedText key={index}>{phrase}</AnimatedText>;
      })}
    </div>
  );
}

function AnimatedText({ children }) {
  const text = useRef(null);

  useLayoutEffect(() => {
    if (!text.current) return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      text.current,
      {
        opacity: 0,
        x: -1500,
      },
      {
        opacity: 1,
        x: 0,
        ease: "power3.out",
        scrollTrigger: {
          trigger: text.current,
          scrub: true,
          start: "10px bottom",
          end: "bottom+=400px bottom",
        },
      }
    );
  }, []);

  return <p ref={text}>{children}</p>;
}
