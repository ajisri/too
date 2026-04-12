import React, { useLayoutEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import styles from "./style.module.css";
import Lenis from "@studio-freight/lenis"; // Import Lenis

const phrases = [
  { text: "Frontend Developer", color: "#ffffff", textColor: "black" },
  { text: "Ajis Riyananta", color: "#e8f0fe", textColor: "black" },
  { text: "available for work", color: "#222222", textColor: "white" },
  { text: "based in Semarang Indonesia", color: "#000000", textColor: "white" },
];

export default function Index() {
  return (
    <div className={styles.description}>
      {phrases.map((phrase, index) => {
        return (
          <AnimatedText key={index} color={phrase.color} textColor={phrase.textColor}>
            {phrase.text}
          </AnimatedText>
        );
      })}
    </div>
  );
}

function AnimatedText({ children, color, textColor }) {
  const text = useRef(null);

  useLayoutEffect(() => {
    if (!text.current) return;
    gsap.registerPlugin(ScrollTrigger);

    // Animation for text entry
    gsap.fromTo(
      text.current,
      {
        opacity: 0,
        x: -1500,
        color: "black",
      },
      {
        opacity: 1,
        x: 0,
        color: textColor,
        ease: "power3.out",
        scrollTrigger: {
          trigger: text.current,
          scrub: true,
          start: "10px bottom",
          end: "bottom+=400px bottom",
        },
      }
    );

    // Trigger for background color change
    ScrollTrigger.create({
      trigger: text.current,
      start: "top center",
      onEnter: () => {
        gsap.to("#main-bg", {
          backgroundColor: color,
          duration: 1,
          ease: "power2.inOut",
        });
      },
      onEnterBack: () => {
        gsap.to("#main-bg", {
          backgroundColor: color,
          duration: 1,
          ease: "power2.inOut",
        });
      },
    });
  }, [color]);

  return <p ref={text}>{children}</p>;
}
