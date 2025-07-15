//component/ThreeDModel/index.jsx
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
      lenisRef.current.on("scroll", () => ScrollTrigger.update());

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

      // Enhanced title animation
      if (titleRef.current && !splitTitleRef.current) {
        splitTitleRef.current = new SplitType(titleRef.current, {
          types: "chars",
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top center",
            end: "bottom top",
            toggleActions: "play reverse play reverse",
            markers: false,
          },
        });

        tl.fromTo(
          splitTitleRef.current.chars,
          {
            opacity: 0,
            x: 100,
            rotationY: 90,
            transformOrigin: "center center",
          },
          {
            opacity: 1,
            x: 0,
            rotationY: 0,
            duration: 1.2,
            ease: "back.out(1.7)",
            stagger: 0.05,
          }
        ).to(
          splitTitleRef.current.chars,
          {
            opacity: 0,
            x: -100,
            rotationY: -90,
            duration: 0.8,
            ease: "power3.in",
            stagger: 0.03,
          },
          "+=0.6"
        );
      }

      const masterTL = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${endScroll}`,
          scrub: 0.8,
          pin: true,
          markers: false,
          onUpdate: (self) => {
            const normalizedProgress = Math.min(1, Math.max(0, self.progress));
            setProgress(normalizedProgress);
            if (normalizedProgress >= 3 / totalParts && !botReady) {
              setBotReady(true);
            }
          },
          onRefresh: () => {
            if (typeof window === "undefined") return;
            ScrollTrigger.update();
            if (
              !("ontouchstart" in window) &&
              lenisRef.current &&
              isInitialLoad.current &&
              progress === 0
            ) {
              lenisRef.current.scrollTo(0, { immediate: true });
            }
          },
        },
      });

      floorTexts.forEach((floor, i) => {
        const textRef = textRefs.current[i];
        const backgroundTextRef = backgroundTextRefs.current[i];
        if (!textRef || !backgroundTextRef) return;

        const contentLength = floor.content.length;
        const baseDuration = Math.min(1.2, Math.max(0.6, contentLength / 120));
        const start = i * durationPerPart;
        const end = start + durationPerPart;

        // Enhanced text panel animations
        masterTL.fromTo(
          textRef,
          {
            opacity: 0,
            y: 120,
            scale: 0.9,
            filter: "blur(15px)",
            rotationX: 15,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            rotationX: 0,
            duration: baseDuration,
            ease: "power3.out",
          },
          start
        );

        // Background text animations
        if (backgroundTextRef) {
          masterTL.fromTo(
            backgroundTextRef,
            {
              opacity: 0,
              scale: 0.8,
              xPercent: -100, // Untuk centering
              yPercent: -100, // Untuk centering
              filter: "blur(20px)",
            },
            {
              opacity: 0.08,
              scale: 1,
              filter: "blur(0px)",
              xPercent: -100, // Untuk centering
              yPercent: -100, // Untuk centering
              duration: baseDuration * 1.2,
              ease: "power2.out",
            },
            start - 0.2
          );

          masterTL.to(
            backgroundTextRef,
            {
              opacity: 0,
              scale: 1.1,
              filter: "blur(10px)",
              xPercent: -100, // Untuk centering
              yPercent: -100, // Untuk centering
              duration: baseDuration * 0.8,
              ease: "power2.in",
            },
            end - 0.4
          );
        }

        // Animasi khusus untuk setiap bagian
        if (floor.id === 1) {
          // Teks muncul di atas bot
          masterTL.to(
            textRef,
            {
              x: -320,
              y: -229,
              duration: baseDuration,
              ease: "power4.out",
            },
            start
          );
        } else if (floor.id === 2) {
          // Teks muncul di samping kanan bot
          masterTL.to(
            textRef,
            {
              x: 70, // Geser teks lebih ke kanan
              y: 0,
              duration: baseDuration,
              ease: "power4.out",
            },
            start
          );
        } else if (floor.id === 3) {
          masterTL.to(
            textRef,
            {
              x: -150,
              y: 0,
              duration: baseDuration,
              ease: "power4.out",
            },
            start
          );
        } else if (floor.id === 4) {
          masterTL.to(
            textRef,
            {
              x: 120,
              y: -20,
              duration: baseDuration,
              ease: "power4.out",
            },
            start
          );
        } else if (floor.id === 5) {
          masterTL.to(
            textRef,
            {
              x: -720,
              y: -20,
              duration: baseDuration,
              ease: "power4.out",
            },
            start
          );
        }

        masterTL.to(
          textRef,
          {
            opacity: 0,
            y: -120,
            scale: 0.9,
            filter: "blur(15px)",
            rotationX: -15,
            duration: baseDuration * 0.9,
            ease: "power3.in",
          },
          end - 0.4
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

  // In index.jsx, modify the return statement:
  return (
    <section ref={containerRef} className={styles.container}>
      <div className={styles.progressBarWrapper}>
        <div
          className={styles.progressBar}
          style={{ width: `${(progress * 100).toFixed(2)}%` }}
        />
      </div>

      {/* ThreeCanvas now appears before slidesContainer in DOM order */}
      <ThreeCanvas scrollY={progress} botReady={botReady} />

      <section className={styles.backgroundTitleWrapper}>
        <div className="header-tag">Story of Aksa</div>
        <h2 ref={titleRef} className={`${styles.backgroundTitle} main-heading`}>
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
                  top: 100,
                  left: 100,
                  transform: "translate(-50%, -50%)",
                  fontSize: "20vw",
                  fontWeight: "bold",
                  color: "rgba(255,255,255,0.1)",
                  zIndex: 0,
                  pointerEvents: "none",
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
