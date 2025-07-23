// component/ThreeDModel/index.jsx
"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import styles from "./style.module.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

const ThreeCanvas = dynamic(() => import("./ThreeCanvas"), {
  ssr: false,
  loading: () => <div className={styles.loadingFallback}>Loading 3D...</div>,
});

export default function ThreeScene() {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [botReady, setBotReady] = useState(false);
  const [lenisReady, setLenisReady] = useState(false);
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
        content: `<p>Di sebuah pagi yang tampak biasa, seseorang terbangun—namun dunia di sekitarnya tidak lagi terasa sama.</p>`,
        backgroundText: "AWAKENING",
      },
      {
        id: 2,
        content: `<p><strong>Namanya Aksa.</strong></p><p>Pernah, di masa silam, ia dikenal sebagai sosok yang menyala. Dalam diamnya, ada nyala tekad. Dalam langkahnya, ada arah yang selalu jelas.</p><p>Ia bukan hanya cerdas, tapi juga penuh visi. Seakan segala hal yang disentuhnya, tumbuh menjadi sesuatu yang berarti.</p>`,
        backgroundText: "AKSA",
      },
      {
        id: 3,
        content: `<p>Namun waktu… tak selalu bersahabat.</p><p>Perlahan, tanpa disadarinya, Aksa mulai berjalan tanpa arah. Bukan karena ia kehilangan tujuan, tapi karena terlalu lama membiarkan dirinya terjebak dalam kenyamanan semu.</p>`,
        backgroundText: "TIME",
      },
      {
        id: 4,
        content: `<p>Hari-harinya diisi dengan distraksi kecil yang menjelma besar. Ia menunda, menanti, lalu mengulanginya. Hari demi hari, tanpa progres. Ia tahu itu, <br><br><strong>tapi seperti lumpur, makin ia mencoba bergerak, makin dalam ia tenggelam.</strong></p>`,
        backgroundText: "STUCK",
      },
      {
        id: 5,
        content: `<p>Hingga akhirnya… datang ujian itu.</p><p>Bukan bencana besar, bukan pula kegagalan mencolok. Tapi cukup untuk menyentaknya.</p>`,
        backgroundText: "TEST",
      },
      {
        id: 6,
        content: `<p>Sebuah kesempatan besar—yang dulu akan ia taklukkan dengan mudah—kini berdiri di hadapannya, dan <br><br><strong>ia sadar: ia tidak lagi siap.</strong></p><p>Tangannya ragu, pikirannya lambat, hatinya ciut.</p>`,
        backgroundText: "REALIZE",
      },
      {
        id: 7,
        content: `<p>Saat itulah ia melihat bayangannya sendiri.</p><p>Bukan yang ada di cermin, tapi yang ada dalam ingatannya—versi dirinya yang dulu. Yang penuh bara. Yang bisa menyala kapan saja.</p><p><strong>Ia tidak ingin menjadi penonton dari hidupnya sendiri.</strong></p>`,
        backgroundText: "REFLECTION",
      },
      {
        id: 8,
        content: `<p>Perjalanan kembali dimulai. Berat. Lambat. Penuh rasa malu karena harus mengulang.</p><p>Tapi satu hal yang kini tertanam kuat di dadanya: <strong>ia masih punya nyala.</strong> Meskipun kecil, ia menyimpannya. Dan itu cukup untuk membuatnya bergerak.</p>`,
        backgroundText: "JOURNEY",
      },
      {
        id: 9,
        content: `<p>Hari ini, Aksa belum kembali menjadi dirinya yang dulu.</p><p>Tapi setiap langkahnya kini adalah <strong>pilihan sadar untuk tidak menyerah.</strong></p><p>Setiap detik, ia bertaruh pada kemungkinan bahwa dirinya masih bisa kembali menjadi sosok yang bukan hanya baik, tapi berarti.</p>`,
        backgroundText: "HOPE",
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
      loader.load("/models/bot.glb", () => {});
    };
    preloadGLTF();
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const initLenis = async () => {
      const Lenis = (await import("@studio-freight/lenis")).default;
      lenisRef.current = new Lenis({
        lerp: 0.08,
        smoothWheel: true,
        syncTouch: true,
        smooth: true,
        touchMultiplier: 2,
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

    return () => {
      lenisRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (!lenisReady) return;

    const ctx = gsap.context(() => {
      const totalParts = floorTexts.length - 1;
      const durationPerPart = 2.2;
      const windowHeight = window.innerHeight;
      const endScroll = windowHeight * totalParts;

      // Create master timeline first
      const masterTL = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${endScroll}`,
          scrub: 1,
          pin: true,
          markers: false,
          onUpdate: (self) => {
            const normalizedProgress = Math.min(1, Math.max(0, self.progress));
            setProgress(normalizedProgress);
            if (self.progress >= 0.33 && !botReady) {
              setBotReady(true);
            }
          },
        },
      });

      // Title animation
      if (titleRef.current && (!splitTitleRef.current || !splitTitleRef.current.chars)) {
        splitTitleRef.current = new SplitType(titleRef.current, {
          types: "chars",
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top center",
            end: "+=400", // Reduced distance to prevent reappearing
            toggleActions: "play none reverse none", // Changed to prevent reappearing
            markers: false,
          },
        });

        tl.fromTo(
          splitTitleRef.current.chars,
          {
            opacity: 0,
            x: 100,
            rotationY: 90,
          },
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
      }

      // Floor texts animations
      floorTexts.forEach((floor, i) => {
        const textRef = textRefs.current[i];
        const backgroundTextRef = backgroundTextRefs.current[i];
        if (!textRef || !backgroundTextRef) return;

        const contentLength = floor.content.length;
        const baseDuration = Math.min(1.2, Math.max(0.6, contentLength / 120));
        const gap = 0.8;
        const start = i * (durationPerPart + gap);
        const end = start + (durationPerPart * 0.6);
        const exitStart = end - 0.3;

        // Position adjustments for specific IDs
        let yPosition = 0;
        let xPosition = 0;

        switch (floor.id) {
          case 1:
            yPosition = -180;
            break;
          case 6:
            yPosition = -150;
            break;
          case 8:
            yPosition = -120;
            xPosition = 120;
            break;
        }

        // Entry animation
        masterTL.fromTo(
          textRef,
          {
            opacity: 0,
            y: 120,
            x: xPosition,
            scale: 0.9,
            filter: "blur(15px)",
            rotationX: 15,
          },
          {
            opacity: 1,
            y: yPosition,
            x: xPosition,
            scale: 1,
            filter: "blur(0px)",
            rotationX: 0,
            duration: baseDuration,
            ease: "power3.out",
          },
          start
        );

        // Background text animations with adjusted timing
        masterTL.fromTo(
          backgroundTextRef,
          {
            opacity: 0,
            scale: 0.8,
            filter: "blur(20px)",
          },
          {
            opacity: 0.08,
            scale: 1,
            filter: "blur(0px)",
            duration: baseDuration,
            ease: "power2.out",
          },
          start
        );

        // Exit animation
        masterTL.to(
          textRef,
          {
            opacity: 0,
            y: yPosition - 120,
            scale: 0.9,
            filter: "blur(15px)",
            rotationX: -15,
            duration: baseDuration * 0.6,
            ease: "power3.in",
          },
          exitStart
        );
      });

      if (lenisRef.current && isInitialLoad.current) {
        lenisRef.current.scrollTo(0, { immediate: true });
      }

      ScrollTrigger.refresh();

      const handleScroll = () => {
        if (isInitialLoad.current) {
          isInitialLoad.current = false;
          lenisRef.current?.off("scroll", handleScroll);
        }
      };
      lenisRef.current?.on("scroll", handleScroll);
    }, containerRef);

    return () => {
      if (splitTitleRef.current) {
        splitTitleRef.current.revert();
        splitTitleRef.current = null;
      }
      ctx.revert();
      lenisRef.current?.off("scroll");
    };
  }, [floorTexts, botReady, lenisReady]);

  return (
    <section ref={containerRef} className={styles.container}>
      <div className={styles.progressBarWrapper}>
        <div
          className={styles.progressBar}
          style={{ width: `${(progress * 100).toFixed(2)}%` }}
        />
      </div>

      <ThreeCanvas scrollY={progress} botReady={botReady} />

      <section className={styles.backgroundTitleWrapper}>
        <div className="header-tag">Story of Aksa</div>
        <h2
          ref={titleRef}
          className={styles.backgroundTitle}
          style={{
            fontFamily: "'Bebas Neue', sans-serif", // Changed font
            fontWeight: 700,
            fontSize: "82px",
            lineHeight: "1.1",
            color: "#fff",
            textShadow: "0 0 15px rgba(0,0,0,0.7)",
            mixBlendMode: "normal",
            letterSpacing: "0.5px",
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
          return (
            <section
              key={floor.id}
              className={`${styles.slide} ${styles.floorText} ${
                floor.id === 1 ? styles.centerAlign : ""
              }`}
            >
              <div
                ref={(el) => (backgroundTextRefs.current[i] = el)}
                className={styles.backgroundTextElement}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "clamp(8rem, 20vw, 24rem)",
                  fontWeight: 900,
                  color: "rgba(255,255,255,0.05)",
                  zIndex: 0,
                  pointerEvents: "none",
                  textTransform: "uppercase",
                  letterSpacing: "-0.02em",
                  fontFamily: "'Bebas Neue', sans-serif",
                  textShadow: "0 0 60px rgba(255,255,255,0.1)",
                  mixBlendMode: "overlay",
                  whiteSpace: "nowrap",
                  willChange: "transform, opacity",
                  filter: "blur(1px)",
                }}
              >
                {floor.backgroundText}
              </div>
              <div
                ref={(el) => (textRefs.current[i] = el)}
                className={`${styles.textPanel} ${
                  floor.id === 1 ? styles.centerPanel : ""
                }`}
              >
                <div
                  className={styles.textFrame}
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontWeight: 400,
                    fontSize: "36px",
                    lineHeight: "1.3",
                    color: "#fff",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}
                  dangerouslySetInnerHTML={{ __html: floor.content }}
                />
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
