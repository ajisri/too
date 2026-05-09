// component/ThreeDModel/index.jsx
"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import styles from "./style.module.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LycagonFace from "./LycagonFace";
import { useLenis } from "../SmoothScrollProvider";

const ThreeCanvas = dynamic(() => import("./ThreeCanvas"), {
  ssr: false,
  loading: () => <div className={styles.loadingFallback}>Loading 3D...</div>,
});

// ─── Constants ───────────────────────────────────────────────────────
const SCROLL_THRESHOLD = 0.33;
const DEFAULT_DURATION = 2.5;
const DEFAULT_GAP = 1.8;
const SCROLL_SCRUB = 1.5;
const INITIAL_DELAY = 0.5; // Minimal delay — straight into the experience

// ─── Floor Text Data ─────────────────────────────────────────────────
// Each floor maps to a narrative beat with unique animation config.

const FLOOR_TEXTS = [
  {
    id: 1,
    content: `<p>Di sebuah pagi yang tampak biasa, seseorang terbangun\u2014namun dunia di sekitarnya tidak lagi terasa sama.</p>`,
    backgroundText: "AWAKENING",
    duration: 2.5,
    gap: 1.5,
  },
  {
    id: 2,
    content: `<p><strong>Namanya Aksa.</strong></p><p>Pernah, di masa silam, ia dikenal sebagai sosok yang menyala. Dalam diamnya, ada nyala tekad. Dalam langkahnya, ada arah yang selalu jelas.</p><p>Ia bukan hanya cerdas, tapi juga penuh visi. Seakan segala hal yang disentuhnya, tumbuh menjadi sesuatu yang berarti.</p>`,
    backgroundText: "AKSA",
    duration: 3.5,
    gap: 1.8,
  },
  {
    id: 3,
    content: `<p>Namun waktu\u2026 tak selalu bersahabat.</p><p>Perlahan, tanpa disadarinya, Aksa mulai berjalan tanpa arah. Bukan karena ia kehilangan tujuan, tapi karena terlalu lama membiarkan dirinya terjebak dalam kenyamanan semu.</p>`,
    backgroundText: "TIME",
    duration: 3.2,
    gap: 2.0,
  },
  {
    id: 4,
    content: `<p>Hari-harinya diisi dengan distraksi kecil yang menjelma besar. Ia menunda, menanti, lalu mengulanginya. Hari demi hari, tanpa progres.</p><p>Ia tahu itu\u2014</p><p><strong>tapi seperti lumpur, makin ia mencoba bergerak, makin dalam ia tenggelam.</strong></p>`,
    backgroundText: "STUCK",
    duration: 4.2,
    gap: 2.2,
  },
  {
    id: 5,
    content: `<p>Hingga akhirnya\u2026 datang ujian itu.</p><p>Bukan bencana besar, bukan pula kegagalan mencolok. Tapi cukup untuk menyentaknya.</p>`,
    backgroundText: "TEST",
    duration: 2.8,
    gap: 1.5,
  },
  {
    id: 6,
    content: `<p>Sebuah kesempatan besar\u2014yang dulu akan ia taklukkan dengan mudah\u2014kini berdiri di hadapannya, dan</p><p><strong>ia sadar: ia tidak lagi siap.</strong></p><p>Tangannya ragu, pikirannya lambat, hatinya ciut.</p>`,
    backgroundText: "REALIZE",
    duration: 3.5,
    gap: 1.8,
  },
  {
    id: 7,
    content: `<p>Saat itulah ia melihat bayangannya sendiri.</p><p>Bukan yang ada di cermin, tapi yang ada dalam ingatannya\u2014versi dirinya yang dulu. Yang penuh bara. Yang bisa menyala kapan saja.</p><p><strong>Ia tidak ingin menjadi penonton dari hidupnya sendiri.</strong></p>`,
    backgroundText: "REFLECTION",
    duration: 3.8,
    gap: 2.0,
  },
  {
    id: 8,
    content: `<p>Perjalanan kembali dimulai. Berat. Lambat. Penuh rasa malu karena harus mengulang.</p><p>Tapi satu hal yang kini tertanam kuat di dadanya: <strong>ia masih punya nyala.</strong> Meskipun kecil, ia menyimpannya. Dan itu cukup untuk membuatnya bergerak.</p>`,
    backgroundText: "JOURNEY",
    duration: 3.0,
    gap: 1.6,
  },
  {
    id: 9,
    content: `<p>Hari ini, Aksa belum kembali menjadi dirinya yang dulu.</p><p>Tapi setiap langkahnya kini adalah <strong>pilihan sadar untuk tidak menyerah.</strong></p><p>Setiap detik, ia bertaruh pada kemungkinan bahwa dirinya masih bisa kembali menjadi sosok yang bukan hanya baik, tapi berarti.</p>`,
    backgroundText: "HOPE",
    duration: 3.5,
    gap: 2.2,
  },
];

// ─── Per-floor Background Text Animation Configs ─────────────────────
// Each config emotionally supports its narrative beat through motion design.

const BG_ANIM_CONFIGS = {
  1: { // AWAKENING — floats up like a first breath, exhales away
    from: { opacity: 0, y: 120, scale: 0.85, filter: "blur(18px)", rotationX: 0, x: 0 },
    to:   { opacity: 0.9, y: 0, scale: 1, filter: "blur(0px)", rotationX: 0, x: 0 },
    out:  { opacity: 0, y: -60, scale: 1.04, filter: "blur(10px)" },
    easeIn: "power1.out", easeOut: "power2.in",
  },
  2: { // AKSA — sweeps in with confident momentum from the left
    from: { opacity: 0, x: -280, scale: 1.08, filter: "blur(6px)", rotationX: 0, y: 0 },
    to:   { opacity: 1, x: 0, scale: 1, filter: "blur(0px)", rotationX: 0, y: 0 },
    out:  { opacity: 0, x: 120, scale: 0.96, filter: "blur(10px)" },
    easeIn: "expo.out", easeOut: "power3.in",
  },
  3: { // TIME — spirals in with a slow rotation, aging in place
    from: { opacity: 0, rotation: -20, scale: 0.92, filter: "blur(8px)", rotationX: 0, x: 0, y: 0 },
    to:   { opacity: 0.85, rotation: 0, scale: 1, filter: "blur(0px)", rotationX: 0, x: 0, y: 0 },
    out:  { opacity: 0, rotation: 12, scale: 1.06, filter: "blur(14px)" },
    easeIn: "power2.out", easeOut: "power2.in",
  },
  4: { // STUCK — jitters into place, barely visible, suffocating
    from: { opacity: 0, x: 8, scale: 1.02, filter: "blur(3px)", rotationX: 0, y: 0 },
    to:   { opacity: 0.6, x: 0, scale: 1, filter: "blur(0px)", rotationX: 0, y: 0 },
    out:  { opacity: 0, scale: 0.98, filter: "blur(20px)" },
    easeIn: "power4.out", easeOut: "power1.in",
  },
  5: { // TEST — slams down from above like a verdict
    from: { opacity: 0, y: -180, scale: 1.4, filter: "blur(12px)", rotationX: 0, x: 0 },
    to:   { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", rotationX: 0, x: 0 },
    out:  { opacity: 0, y: 50, scale: 0.9, filter: "blur(8px)" },
    easeIn: "power4.out", easeOut: "power3.in",
  },
  6: { // REALIZE — materializes from pure blur, slow painful clarity
    from: { opacity: 0, scale: 1.05, filter: "blur(28px)", rotationX: 0, x: 0, y: 0 },
    to:   { opacity: 0.9, scale: 1, filter: "blur(0px)", rotationX: 0, x: 0, y: 0 },
    out:  { opacity: 0, scale: 0.95, filter: "blur(16px)" },
    easeIn: "power1.out", easeOut: "power1.in",
  },
  7: { // REFLECTION — tilts in from 3D perspective, like looking in a mirror
    from: { opacity: 0, scale: 0.9, filter: "blur(10px)", rotationX: 25, x: 0, y: 30 },
    to:   { opacity: 1, scale: 1, filter: "blur(0px)", rotationX: 0, x: 0, y: 0 },
    out:  { opacity: 0, scale: 1.02, filter: "blur(8px)", rotationX: -15 },
    easeIn: "power2.out", easeOut: "power2.in",
  },
  8: { // JOURNEY — walks in from the left, steady forward movement
    from: { opacity: 0, x: -350, scale: 1, filter: "blur(6px)", rotationX: 0, y: 0 },
    to:   { opacity: 1, x: 0, scale: 1, filter: "blur(0px)", rotationX: 0, y: 0 },
    out:  { opacity: 0, x: 250, scale: 1, filter: "blur(6px)" },
    easeIn: "power3.out", easeOut: "power2.in",
  },
  9: { // HOPE — breathes in gently from center, expands like the first clean breath
    from: { opacity: 0, scale: 0.75, filter: "blur(20px)", rotationX: 0, x: 0, y: 0 },
    to:   { opacity: 1, scale: 1, filter: "blur(0px)", rotationX: 0, x: 0, y: 0 },
    out:  { opacity: 0, scale: 1.15, filter: "blur(12px)" },
    easeIn: "power2.out", easeOut: "power1.in",
  },
};

// Per-floor content easing — tighter emotional rhythm
const CONTENT_EASE_MAP = {
  1: "power2.out",          // AWAKENING — gentle, slow arrival
  2: "expo.out",            // AKSA — confident snap into place
  3: "power3.out",          // TIME — measured, deliberate
  4: "elastic.out(1,0.5)",  // STUCK — trapped vibration, unsettling
  5: "power4.out",          // TEST — sudden impact
  6: "sine.out",            // REALIZE — slow, painful clarity
  7: "power3.out",          // REFLECTION — thoughtful emergence
  8: "back.out(1.4)",       // JOURNEY — forward momentum with overshoot
  9: "power2.out",          // HOPE — warm, steady, assured
};

// ─── Helper: Calculate cumulative timeline start ─────────────────────

function getStartTimeForIndex(index) {
  return INITIAL_DELAY + FLOOR_TEXTS
    .slice(0, index)
    .reduce(
      (sum, f) => sum + (f.duration || DEFAULT_DURATION) + (f.gap || DEFAULT_GAP),
      0
    );
}

function calculateEndScroll() {
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  return FLOOR_TEXTS.reduce(
    (sum, floor) =>
      sum + ((floor.duration || DEFAULT_DURATION) + (floor.gap || DEFAULT_GAP)) * vh,
    0
  );
}

// ─── Component ───────────────────────────────────────────────────────

export default function ThreeScene() {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [botReady, setBotReady] = useState(false);
  const botReadyRef = useRef(false); // Ref to avoid re-creating timeline when botReady changes
  const [activeFloorId, setActiveFloorId] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const textRefs = useRef([]);
  const backgroundTextRefs = useRef([]);
  const isInitialLoad = useRef(true);

  // Lenis from centralized provider (no more duplicate instances)
  const { lenis, isReady: lenisReady } = useLenis();

  // ─── Preload GLTF model ───────────────────────────────────────────
  useEffect(() => {
    const preloadGLTF = async () => {
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader");
      const loader = new GLTFLoader();
      loader.load("/models/bot.glb", () => {});
    };
    preloadGLTF();
  }, []);

  // ─── Lenis now provided by SmoothScrollProvider ──────────────────

  // ─── GSAP ScrollTrigger Master Timeline ───────────────────────────
  useEffect(() => {
    if (!lenisReady) return;
    gsap.registerPlugin(ScrollTrigger);

    // Reset baseline: ensure animated elements start clean
    if (containerRef.current) {
      try {
        const bgEls = containerRef.current.querySelectorAll(`.${styles.backgroundTextElement}`);
        if (bgEls.length) {
          gsap.set(bgEls, { opacity: 0, scale: 1, x: 0, y: 0, rotation: 0, rotationX: 0, filter: "blur(8px)" });
        }
      } catch (_) { /* selector issues fallback */ }
    }

    const animateFloorTexts = (tl) => {
      FLOOR_TEXTS.forEach((floor, i) => {
        const textRef = textRefs.current[i];
        const backgroundTextRef = backgroundTextRefs.current[i];
        if (!textRef || !backgroundTextRef) return;

        const start = getStartTimeForIndex(i);
        const thisDuration = floor.duration || DEFAULT_DURATION;

        const alignLeft = [1, 3, 5, 7, 9].includes(floor.id);
        const y = alignLeft ? -20 : 0;
        const x = alignLeft ? -Math.min(window.innerWidth * 0.24, 348) : 0;

        // Timing distribution for BG + content sequencing
        const bgInDuration = thisDuration * 0.20;
        const bgStayDuration = thisDuration * 0.10;
        const bgOutDuration = thisDuration * 0.15;
        const gapDuration = thisDuration * 0.15;
        const contentInDuration = thisDuration * 0.25;
        const contentExitDuration = thisDuration * 0.15;

        const bgConf = BG_ANIM_CONFIGS[floor.id] || BG_ANIM_CONFIGS[1];

        // 1. Background Text IN
        tl.fromTo(backgroundTextRef, bgConf.from, {
          ...bgConf.to,
          duration: bgInDuration,
          ease: bgConf.easeIn,
        }, start);

        // 1b. STUCK glitch shake
        if (floor.id === 4) {
          tl.to(backgroundTextRef, {
            x: "+=3", duration: 0.05, yoyo: true, repeat: 5, ease: "none",
          }, start + bgInDuration);
        }

        // 2. Background Text OUT
        tl.to(backgroundTextRef, {
          ...bgConf.out,
          duration: bgOutDuration,
          ease: bgConf.easeOut,
        }, start + bgInDuration + bgStayDuration);

        // 3. Content IN — after BG exits + gap
        const contentStart = start + bgInDuration + bgStayDuration + bgOutDuration + gapDuration;

        tl.fromTo(textRef,
          { opacity: 0, y: 40, x: x - 15, scale: 0.98, filter: "blur(8px)", rotationX: 8 },
          {
            opacity: 1, y, x, scale: 1, filter: "blur(0px)", rotationX: 0,
            duration: contentInDuration,
            ease: CONTENT_EASE_MAP[floor.id] || "power3.out",
            onStart: () => setActiveFloorId(floor.id),
            onReverseComplete: () => setActiveFloorId(null),
          },
          contentStart
        );

        // 4. Content EXIT
        tl.to(textRef, {
          opacity: 0, y: y - 40, scale: 0.96, filter: "blur(5px)", rotationX: -6,
          duration: contentExitDuration,
          ease: "circ.in",
          onComplete: () => { if (floor.id !== 7) setActiveFloorId(null); },
          onReverseComplete: () => setActiveFloorId(floor.id),
        }, start + thisDuration - contentExitDuration);
      });
    };

    const ctx = gsap.context(() => {
      // Background color ScrollTrigger removed — handled by page.js

      const masterTL = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${calculateEndScroll()}`,
          scrub: SCROLL_SCRUB,
          pin: true,
          onToggle: (self) => setIsActive(self.isActive),
          onUpdate: (self) => {
            const p = Math.min(1, Math.max(0, self.progress));
            setProgress(p);
            if (p >= SCROLL_THRESHOLD && !botReadyRef.current) {
              botReadyRef.current = true;
              setBotReady(true);
            }
          },
        },
      });

      animateFloorTexts(masterTL);

      if (lenis && isInitialLoad.current) {
        lenis.scrollTo(0, { immediate: true });
        isInitialLoad.current = false;
      }

      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, [lenisReady]); // botReady removed — uses ref to avoid timeline re-creation

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <section
      ref={containerRef}
      className={styles.container}
      style={{ backgroundColor: "black" }}
    >
      {/* Progress Bar */}
      <div className={styles.progressBarWrapper} style={{ display: isActive ? "block" : "none" }}>
        <div
          className={styles.progressBar}
          style={{ width: `${(progress * 100).toFixed(2)}%` }}
        />
      </div>

      {/* Background Text Overlay */}
      <div
        className={styles.backgroundTextFixedContainer}
        style={{ opacity: isActive ? 1 : 0, visibility: isActive ? "visible" : "hidden" }}
      >
        {FLOOR_TEXTS.map((floor, i) => (
          <div
            key={floor.id}
            ref={(el) => (backgroundTextRefs.current[i] = el)}
            className={styles.backgroundTextElement}
          >
            {floor.backgroundText}
          </div>
        ))}
      </div>

      {/* Three.js Canvas */}
      <div
        className={styles.canvasWrapper}
        style={{ opacity: isActive ? 1 : 0, visibility: isActive ? "visible" : "hidden" }}
      >
        <ThreeCanvas scrollY={progress} botReady={botReady} activeFloorId={activeFloorId} />
      </div>

      {/* Floor Text Slides */}
      <div className={styles.slidesContainer}>
        {FLOOR_TEXTS.map((floor, i) => {
          const alignLeft = [1, 3, 5, 7, 9].includes(floor.id);
          const shiftRightTop = floor.id === 6;

          return (
            <section
              key={floor.id}
              className={`${styles.slide} ${styles.floorText} ${alignLeft ? styles.leftTopAlign : ""} ${shiftRightTop ? styles.rightTopAlign : ""}`}
              style={
                alignLeft
                  ? {
                    position: "absolute",
                    left: "80px",
                    top: "15%",
                    transform: "none",
                    width: "100%",
                    maxWidth: "90vw",
                    textAlign: "left",
                  }
                  : shiftRightTop
                    ? {
                      position: "absolute",
                      right: "100px",
                      top: "10%",
                      transform: "none",
                      width: "100%",
                      maxWidth: "90vw",
                      textAlign: "right",
                    }
                    : {}
              }
            >
              <div
                ref={(el) => (textRefs.current[i] = el)}
                className={`${styles.textPanel} ${alignLeft ? styles.leftPanel : ""} ${shiftRightTop ? styles.rightPanel : ""}`}
                style={
                  alignLeft
                    ? { textAlign: "left", padding: "0", width: "100%" }
                    : shiftRightTop
                      ? { textAlign: "right", padding: "0", width: "100%" }
                      : {}
                }
              >
                <div
                  className={styles.textFrame}
                  dangerouslySetInnerHTML={{ __html: floor.content }}
                />

                {floor.id === 5 && (
                  <div style={{ marginTop: "40px" }}>
                    <LycagonFace />
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
