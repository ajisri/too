import React, { useEffect, useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

export default function Footer() {
  const container = useRef();
  const texts = useRef([]);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "end end"],
  });

  useEffect(() => {
    scrollYProgress.on("change", (e) => {
      texts.current.forEach((text, i) => {
        text.setAttribute("startOffset", -22 + i * 22 + e * 22 + "%");
      });
    });
  }, []);

  return (
    <div ref={container}>
      <svg className="mb-40" viewBox="0 0 250 90">
        <path
          fill="none"
          id="curve"
          d="m0,88.5c61.37,0,61.5-68,126.5-68,58,0,51,68,123,68"
        />
        <text className="text-[8px]">
          {[...Array(5)].map((_, i) => (
            <textPath
              ref={(ref) => (texts.current[i] = ref)}
              key={i}
              href="#curve"
              startOffset={`${i * 22}%`}
            >
              The Other Opinion
            </textPath>
          ))}
        </text>
      </svg>
      <Logos scrollProgress={scrollYProgress} />
    </div>
  );
}

const Logos = ({ scrollProgress }) => {
  const y = useTransform(scrollProgress, [0, 1], [-700, 0]);
  return (
    <div className="h-[300px] bg-black overflow-hidden">
      <motion.div
        style={{ y }}
        className="h-full bg-black flex justify-center gap-10 items-center p-10"
      >
        {[...Array(5)].map((_, i) => {
          return (
            <img
              alt=""
              key={`img_${i}`}
              className="w-[80px] h-[80px]"
              src={`/medias/${i + 1}.jpg`}
            />
          );
        })}
      </motion.div>
    </div>
  );
};
