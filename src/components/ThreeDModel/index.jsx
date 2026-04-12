// component/ThreeDModel/index.jsx
"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import styles from "./style.module.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import LycagonFace from "./LycagonFace";

const ThreeCanvas = dynamic(() => import("./ThreeCanvas"), {
  ssr: false,
  loading: () => <div className={styles.loadingFallback}>Loading 3D...</div>,
});

const SCROLL_THRESHOLD = 0.33;
const DEFAULT_DURATION = 2.5;
const DEFAULT_GAP = 1.8;
const SCROLL_SCRUB = 1.5;
const EXIT_DURATION_RATIO = 0.6;
const INITIAL_DELAY = 1.5; // Delay agar layar hitam lebih lama sebelum Awakening muncul

export default function ThreeScene() {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [botReady, setBotReady] = useState(false);
  const [lenisReady, setLenisReady] = useState(false);
  const [activeFloorId, setActiveFloorId] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const textRefs = useRef([]);
  const backgroundTextRefs = useRef([]);
  const lenisRef = useRef(null);
  const titleRef = useRef(null);
  const splitTitleRef = useRef(null);
  const isInitialLoad = useRef(true);

  const floorTexts = useMemo(
    () => [
      {
        id: 1,
        content: `<p>Di sebuah pagi yang tampak biasa,<br>seseorang terbangun—namun dunia di sekitarnya<br>tidak lagi terasa sama.</p>`,
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
        content: `<p>Namun waktu… tak selalu bersahabat.</p><p>Perlahan, tanpa disadarinya, Aksa mulai berjalan tanpa arah. Bukan karena ia kehilangan tujuan, tapi karena terlalu lama membiarkan dirinya terjebak dalam kenyamanan semu.</p>`,
        backgroundText: "TIME",
        duration: 3.2,
        gap: 2.0,
      },
      {
        id: 4,
        content: `<p>Hari-harinya diisi dengan distraksi kecil yang menjelma besar. Ia menunda, menanti, lalu mengulanginya. Hari demi hari, tanpa progres. Ia tahu itu, <br><br><strong>tapi seperti lumpur, makin ia mencoba bergerak, makin dalam ia tenggelam.</strong></p>`,
        backgroundText: "STUCK",
        duration: 4.2,
        gap: 2.2,
      },
      {
        id: 5,
        content: `<p>Hingga akhirnya… datang ujian itu.</p><p>Bukan bencana besar, bukan pula kegagalan mencolok. Tapi cukup untuk menyentaknya.</p>`,
        backgroundText: "TEST",
        duration: 2.8,
        gap: 1.5,
      },
      {
        id: 6,
        content: `<p>Sebuah kesempatan besar—yang dulu akan ia taklukkan dengan mudah—kini berdiri di hadapannya, dan <br><br><strong>ia sadar: ia tidak lagi siap.</strong></p><p>Tangannya ragu, pikirannya lambat, hatinya ciut.</p>`,
        backgroundText: "REALIZE",
        duration: 3.5,
        gap: 1.8,
      },
      {
        id: 7,
        content: `<p>Saat itulah ia melihat bayangannya sendiri.</p><p>Bukan yang ada di cermin, tapi yang ada dalam ingatannya—versi dirinya yang dulu. Yang penuh bara. Yang bisa menyala kapan saja.</p><p><strong>Ia tidak ingin menjadi penonton dari hidupnya sendiri.</strong></p>`,
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
    ],
    []
  );

  useEffect(() => {
    const preloadGLTF = async () => {
      const { GLTFLoader } = await import(
        "three/examples/jsm/loaders/GLTFLoader"
      );
      const loader = new GLTFLoader();
      loader.load("/models/bot.glb", () => { });
    };
    preloadGLTF();
  }, []);

  useEffect(() => {
    const initLenis = async () => {
      const Lenis = (await import("@studio-freight/lenis")).default;
      const isMobile = window.innerWidth <= 768;
      lenisRef.current = new Lenis({
        lerp: isMobile ? 0.08 : 0.05,
        smoothWheel: true,
        syncTouch: true,
        touchMultiplier: isMobile ? 1.2 : 1.5,
      });
      lenisRef.current.on("scroll", ScrollTrigger.update);
      const raf = (time) => {
        lenisRef.current.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
      setLenisReady(true);
    };
    initLenis();
    return () => lenisRef.current?.destroy();
  }, []);

  useEffect(() => {
    if (!lenisReady) return;

    // register plugin
    gsap.registerPlugin(ScrollTrigger);

    // --- Reset baseline for left-aligned elements & background text
    // This prevents leftover transforms from previous GSAP runs.
    if (containerRef.current) {
      try {
        const leftSelector = `.${styles.leftTopAlign}`;
        const bgSelector = `.${styles.backgroundTextElement}`;
        const leftEls = containerRef.current.querySelectorAll(leftSelector);
        const bgEls = containerRef.current.querySelectorAll(bgSelector);

        // Set them to a clean baseline: no transform, x=0, y=0
        if (leftEls.length)
          gsap.set(leftEls, { x: 0, y: 0, transform: "none" });
        if (bgEls.length) gsap.set(bgEls, { x: 0, y: 0, transform: "none" });
      } catch (err) {
        // fallback: ignore if selector issues
        // console.warn(err);
      }
    }

    const getStartTimeForIndex = (index) => {
      return INITIAL_DELAY + floorTexts
        .slice(0, index)
        .reduce(
          (sum, f) =>
            sum + (f.duration || DEFAULT_DURATION) + (f.gap || DEFAULT_GAP),
          0
        );
    };

    const calculateEndScroll = () => {
      const windowHeight = window.innerHeight;
      return floorTexts.reduce(
        (sum, floor) =>
          sum +
          ((floor.duration || DEFAULT_DURATION) + (floor.gap || DEFAULT_GAP)) *
          windowHeight,
        0
      );
    };

    const animateTitle = () => {
      splitTitleRef.current = new SplitType(titleRef.current, {
        types: "chars",
      });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top center",
          end: "+=400",
          toggleActions: "play none reverse none",
        },
      });
      tl.fromTo(
        splitTitleRef.current.chars,
        { opacity: 0, x: 100, rotationY: 90 },
        {
          opacity: 1,
          x: 0,
          rotationY: 0,
          duration: 1.5,
          ease: "back.out(1.7)",
          stagger: 0.05,
        }
      ).to(
        splitTitleRef.current.chars,
        {
          opacity: 0,
          x: -100,
          rotationY: -90,
          duration: 1,
          ease: "power3.in",
          stagger: 0.03,
        },
        "+=2"
      );
    };

    const animateFloorTexts = (tl) => {
      floorTexts.forEach((floor, i) => {
        const textRef = textRefs.current[i];
        const backgroundTextRef = backgroundTextRefs.current[i];
        if (!textRef || !backgroundTextRef) return;
        const start = getStartTimeForIndex(i);
        const thisDuration = floor.duration || DEFAULT_DURATION;

        // <-- MATCHING LOGIC: include id 7 here so animations use same baseline as render
        const alignLeft = [1, 3, 5, 7, 9].includes(floor.id);
        const y = alignLeft ? -20 : 0;
        // x offset used in animation (kept from original design)
        const x = alignLeft ? -348 : 0;
        const scale = 1;

        // Standardize background text position to match render (px left)
        // ganti ini
        const bgPosition = {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        };

        // NEW SEQUENCE: BG In -> BG Out -> GAP -> Content In
        const bgInDuration = thisDuration * 0.25;
        const bgStayDuration = thisDuration * 0.15;
        const bgOutDuration = thisDuration * 0.25;
        const gapDuration = thisDuration * 0.05; // Small gap to ensure BG is fully gone
        const contentInDuration = thisDuration * 0.30;

        // 1. Background Text In
        tl.fromTo(
          backgroundTextRef,
          { opacity: 0, scale: 0.95, filter: "blur(8px)" },
          {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: bgInDuration,
            ease: "power2.out",
          },
          start
        );

        // 2. Background Text Out
        tl.to(
          backgroundTextRef,
          {
            opacity: 0,
            scale: 1.05,
            filter: "blur(8px)",
            duration: bgOutDuration,
            ease: "power2.in",
          },
          start + bgInDuration + bgStayDuration
        );

        // 3. Content In (After BG Out + Gap)
        const contentStart = start + bgInDuration + bgStayDuration + bgOutDuration + gapDuration;

        tl.fromTo(
          textRef,
          { 
            opacity: 0, 
            y: 50, 
            x: x - 20, 
            scale: 0.98, 
            filter: "blur(10px)", 
            rotationX: 15,
            skewX: -5 
          },
          {
            opacity: 1,
            y,
            x,
            scale,
            filter: "blur(0px)",
            rotationX: 0,
            skewX: 0,
            duration: contentInDuration,
            ease: "back.out(1.4)",
            onStart: () => {
              setActiveFloorId(floor.id);
            },
            onReverseComplete: () => {
              setActiveFloorId(null);
            },
          },
          contentStart
        );

        // Content Exit (End of section)
        tl.to(
          textRef,
          {
            opacity: 0,
            y: y - 50,
            scale: 0.95,
            filter: "blur(5px)",
            rotationX: -10,
            duration: thisDuration * 0.2, // Quick exit at the end
            ease: "power3.in",
            onComplete: () => {
              // Clear active floor when content exits (except for floor 7 which continues to floor 8)
              if (floor.id !== 7) {
                setActiveFloorId(null);
              }
            },
            onReverseComplete: () => {
              // Restore active floor when scrolling back down into content
              setActiveFloorId(floor.id);
            },
          },
          start + thisDuration - (thisDuration * 0.2)
        );
      });
    };

    const ctx = gsap.context(() => {
      // Background color trigger for transition to black
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top center",
        onEnter: () => {
          gsap.to("#main-bg", { backgroundColor: "#000000", duration: 1 });
        },
      });

      // Title fade - complete before AWAKENING appears
      gsap.to(titleRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "10% top",
          scrub: true,
        },
        opacity: 0,
        y: -100,
        ease: "power2.in",
      });

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
            if (p >= SCROLL_THRESHOLD && !botReady) setBotReady(true);
          },
        },
      });

      animateTitle();
      animateFloorTexts(masterTL);

      if (lenisRef.current && isInitialLoad.current) {
        lenisRef.current.scrollTo(0, { immediate: true });
        isInitialLoad.current = false;
      }

      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, [lenisReady, botReady, floorTexts]);

  return (
    <section 
      ref={containerRef} 
      className={styles.container}
      style={{ backgroundColor: "black" }} // Force full black for this section
    >
      <div className={styles.progressBarWrapper} style={{ display: isActive ? "block" : "none" }}>
        <div
          className={styles.progressBar}
          style={{ width: `${(progress * 100).toFixed(2)}%` }}
        />
      </div>

      <div className={styles.backgroundTextFixedContainer} style={{ opacity: isActive ? 1 : 0, visibility: isActive ? "visible" : "hidden" }}>
        {floorTexts.map((floor, i) => (
          <div
            key={floor.id}
            ref={(el) => (backgroundTextRefs.current[i] = el)}
            className={styles.backgroundTextElement}
          >
            {floor.backgroundText}
          </div>
        ))}
      </div>

      <div className={styles.canvasWrapper} style={{ opacity: isActive ? 1 : 0, visibility: isActive ? "visible" : "hidden" }}>
        <ThreeCanvas scrollY={progress} botReady={botReady} />
      </div>

      <section className={styles.backgroundTitleWrapper} style={{ opacity: progress > 0.1 ? 0 : 1 }}>
        <div className="header-tag">Story of Aksa</div>
        <h2
          ref={titleRef}
          className={styles.backgroundTitle}
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontWeight: 400,
            fontSize: "82px",
            lineHeight: "1.1",
            color: "#fff",
            textShadow: "0 0 15px rgba(0,0,0,0.7)",
            mixBlendMode: "normal",
            letterSpacing: "1px",
            width: "100vw",
            maxWidth: "100vw",
            whiteSpace: "nowrap",
            overflow: "visible",
            textTransform: "uppercase",
          }}
        >
          Bayangan yang ia tinggalkan
        </h2>
      </section>

      <div className={styles.slidesContainer}>
        {floorTexts.map((floor, i) => {
          const isId1 = floor.id === 1;
          const isId3 = floor.id === 3;
          const isId5 = floor.id === 5;
          const isId6 = floor.id === 6;
          const isId7 = floor.id === 7;
          const isId9 = floor.id === 9;

          // MATCH rendering group — id7 included here
          const alignLeft = isId1 || isId3 || isId5 || isId7 || isId9;
          const shiftRightTop = isId6;

          return (
            <section
              key={floor.id}
              className={`${styles.slide} ${styles.floorText} ${alignLeft ? styles.leftTopAlign : ""
                } ${shiftRightTop ? styles.rightTopAlign : ""}`}
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
                className={`${styles.textPanel} ${alignLeft ? styles.leftPanel : ""
                  } ${shiftRightTop ? styles.rightPanel : ""}`}
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
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontWeight: 400,
                    fontSize: alignLeft ? "44px" : "36px",
                    lineHeight: "1.3",
                    color: "#fff",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}
                  dangerouslySetInnerHTML={{ __html: floor.content }}
                />

                {isId5 && (
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
