"use client";

import { useRef } from "react";
import styles from "./LycagonFace.module.css";

export default function LycagonFace() {
  const leftAuraRef = useRef();
  const rightAuraRef = useRef();

  return (
    <div className={styles.lycagonFace}>
      <div className={styles.faceWrapper}>
        {/* Base head image (transparent background, bulu + kepala) */}
        <img
          src="/images/lycagonface.png"
          alt="Lycagon base"
          className={styles.baseImage}
        />

        {/* SVG Overlay: Mata dan Mulut Interaktif */}
        <svg
          viewBox="0 0 600 600"
          className={styles.lycagonSVG}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="solid-orange"
              patternUnits="userSpaceOnUse"
              width="1"
              height="1"
            >
              <rect width="100%" height="100%" fill="#ff4500" />
            </pattern>

            <filter
              id="solar-corona"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.9"
                numOctaves="3"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="12"
                xChannelSelector="R"
                yChannelSelector="G"
              />
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter
              id="intense-glow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Mata kiri */}
          <g>
            <path
              ref={leftAuraRef}
              d="M200,280 C205,275 255,275 260,305 C255,325 205,325 200,280"
              fill="url(#solid-orange)"
              filter="url(#intense-glow)"
              stroke="rgba(255, 204, 0, 0.99)"
              strokeWidth="1.8"
            />
            <path
              d="M200,280 C205,275 255,275 260,305 C255,325 205,325 200,280"
              fill="rgba(255, 60, 0, 0.9)"
              filter="url(#solar-corona)"
            />
          </g>

          {/* Mata kanan hasil cerminan */}
          <g transform="scale(-1,1) translate(-595,0)">
            <path
              ref={rightAuraRef}
              d="M200,280 C205,275 255,275 260,305 C255,325 205,325 200,280"
              fill="url(#solid-orange)"
              filter="url(#intense-glow)"
              stroke="rgba(255, 204, 0, 0.99)"
              strokeWidth="1.8"
            />
            <path
              d="M200,280 C205,275 255,275 260,305 C255,325 205,325 200,280"
              fill="rgba(255, 60, 0, 0.9)"
              filter="url(#solar-corona)"
            />
          </g>

          {/* Mulut dan Gigi */}
          <g id="mouth" transform="translate(0, 0) scale(1)">
            {/* Definisi gradasi gigi */}
            <defs>
              <linearGradient id="tooth-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(245,235,200)" />{" "}
                {/* atas gigi terang */}
                <stop offset="100%" stopColor="rgb(200,190,150)" />{" "}
                {/* bawah gigi gelap */}
              </linearGradient>
            </defs>

            {/* Barisan gigi atas */}
            <path
              d="M262,405 Q261,398 264,395 Q266,398 265,405 Z"
              fill="url(#tooth-gradient)"
              stroke="rgb(160,150,120)"
              strokeWidth="0.5"
            />
            <path
              d="M338,405 Q337,398 340,395 Q342,398 341,405 Z"
              fill="url(#tooth-gradient)"
              stroke="rgb(160,150,120)"
              strokeWidth="0.5"
            />
            <path
              d="M272,405 Q271,396 273,398 Q275,396 274,405 Z"
              fill="url(#tooth-gradient)"
              stroke="rgb(160,150,120)"
              strokeWidth="0.5"
            />
            <path
              d="M282,410 Q281,400 283,401 Q285,400 284,410 Z"
              fill="url(#tooth-gradient)"
              stroke="rgb(160,150,120)"
              strokeWidth="0.5"
            />
            <path
              d="M292,415 Q291,403 293,403 Q295,403 294,415 Z"
              fill="url(#tooth-gradient)"
              stroke="rgb(160,150,120)"
              strokeWidth="0.5"
            />
            <path
              d="M308,415 Q307,403 309,403 Q311,403 310,415 Z"
              fill="url(#tooth-gradient)"
              stroke="rgb(160,150,120)"
              strokeWidth="0.5"
            />
            <path
              d="M318,410 Q317,400 319,401 Q321,400 320,410 Z"
              fill="url(#tooth-gradient)"
              stroke="rgb(160,150,120)"
              strokeWidth="0.5"
            />
            <path
              d="M328,405 Q327,396 329,398 Q331,396 330,405 Z"
              fill="url(#tooth-gradient)"
              stroke="rgb(160,150,120)"
              strokeWidth="0.5"
            />
            <path
              d="M252,400 Q251,395 253,395 Q255,395 254,400 Z"
              fill="url(#tooth-gradient)"
              stroke="rgb(160,150,120)"
              strokeWidth="0.5"
            />
            <path
              d="M348,400 Q347,395 349,395 Q351,395 350,400 Z"
              fill="url(#tooth-gradient)"
              stroke="rgb(160,150,120)"
              strokeWidth="0.5"
            />

            {/* Taring luar kiri-kanan */}
            <path
              d="M238,395 Q240,385 242,395 Q240,393 238,395 Z"
              fill="url(#tooth-gradient)"
              stroke="rgb(140,130,100)"
              strokeWidth="0.6"
            />
            <path
              d="M358,395 Q360,385 362,395 Q360,393 358,395 Z"
              fill="url(#tooth-gradient)"
              stroke="rgb(140,130,100)"
              strokeWidth="0.6"
            />

            {/* Barisan gigi bawah */}
            <path
              d="M251,408 Q253,398 255,408 Q253,406 251,408 Z"
              fill="url(#tooth-gradient)"
              stroke="rgb(160,150,120)"
              strokeWidth="0.5"
            />
            <path
              d="M264,418 Q266,408 268,418 Q266,416 264,418 Z"
              fill="url(#tooth-gradient)"
              stroke="rgb(160,150,120)"
              strokeWidth="0.5"
            />
            <path
              d="M277,424 Q279,414 281,424 Q279,422 277,424 Z"
              fill="url(#tooth-gradient)"
              stroke="rgb(160,150,120)"
              strokeWidth="0.5"
            />
            <path
              d="M290,427 Q292,417 294,427 Q292,425 290,427 Z"
              fill="url(#tooth-gradient)"
              stroke="rgb(160,150,120)"
              strokeWidth="0.5"
            />
            <path
              d="M305,427 Q307,417 309,427 Q307,425 305,427 Z"
              fill="url(#tooth-gradient)"
              stroke="rgb(160,150,120)"
              strokeWidth="0.5"
            />
            <path
              d="M318,424 Q320,414 322,424 Q320,422 318,424 Z"
              fill="url(#tooth-gradient)"
              stroke="rgb(160,150,120)"
              strokeWidth="0.5"
            />
            <path
              d="M331,418 Q333,408 335,418 Q333,416 331,418 Z"
              fill="url(#tooth-gradient)"
              stroke="rgb(160,150,120)"
              strokeWidth="0.5"
            />
            <path
              d="M344,408 Q346,398 348,408 Q346,406 344,408 Z"
              fill="url(#tooth-gradient)"
              stroke="rgb(160,150,120)"
              strokeWidth="0.5"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
