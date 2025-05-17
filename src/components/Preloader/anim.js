import { gsap } from "gsap";

export const opacity = {
  initial: {
    opacity: 0,
  },
  enter: {
    opacity: 0.75,
    transition: { duration: 1, delay: 0.2 },
  },
};

export const slideUp = {
  initial: {
    top: 0,
  },
  exit: {
    top: "-100vh",
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 },
  },
};

export const gsapAnimations = {
  fadeIn: (element) => {
    gsap.fromTo(
      element,
      { opacity: 0 },
      { opacity: 1, duration: 1, delay: 0.2 }
    );
  },
  slideOut: (element) => {
    gsap.to(element, {
      y: "-100vh",
      duration: 0.8,
      ease: "power2.inOut",
      delay: 0.2,
    });
  },
};
