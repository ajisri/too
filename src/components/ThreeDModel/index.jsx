"use client";
import { useRef, useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import styles from "./style.module.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const ThreeCanvas = dynamic(() => import("./ThreeCanvas"), {
  ssr: false,
  loading: () => <div className={styles.loadingFallback}>Loading 3D...</div>,
});

export default function ThreeScene() {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [botReady, setBotReady] = useState(false);
  const textRefs = useRef([]);
  const lenisRef = useRef(null);

  const floorTexts = useMemo(
    () => [
      {
        id: 1,
        content: `<p><em>Bayangan yang Ia Tinggalkan</em></p><p>Di sebuah pagi yang tampak biasa, seseorang terbangun—namun dunia di sekitarnya tidak lagi terasa sama.</p>`,
      },
      {
        id: 2,
        content: `<p><strong>Namanya Aksa.</strong></p><p>Pernah, di masa silam, ia dikenal sebagai sosok yang menyala. Dalam diamnya, ada nyala tekad. Dalam langkahnya, ada arah yang selalu jelas.</p><p>Ia bukan hanya cerdas, tapi juga penuh visi. Seakan segala hal yang disentuhnya, tumbuh menjadi sesuatu yang berarti.</p>`,
      },
      {
        id: 3,
        content: `<p>Namun waktu… tak selalu bersahabat.</p><p>Perlahan, tanpa disadarinya, Aksa mulai berjalan tanpa arah. Bukan karena ia kehilangan tujuan, tapi karena terlalu lama membiarkan dirinya terjebak dalam kenyamanan semu.</p><p>Hari-harinya diisi dengan distraksi kecil yang menjelma besar. Ia menunda, menanti, lalu mengulanginya. Hari demi hari, tanpa progres. Ia tahu itu, <strong>tapi seperti lumpur, makin ia mencoba bergerak, makin dalam ia tenggelam.</strong></p>`,
      },
      {
        id: 4,
        content: `<p>Hingga akhirnya… datang ujian itu.</p><p>Bukan bencana besar, bukan pula kegagalan mencolok. Tapi cukup untuk menyentaknya.</p><p>Sebuah kesempatan besar—yang dulu akan ia taklukkan dengan mudah—kini berdiri di hadapannya, dan <strong>ia sadar: ia tidak lagi siap.</strong></p><p>Tangannya ragu, pikirannya lambat, hatinya ciut.</p>`,
      },
      {
        id: 5,
        content: `<p>Saat itulah ia melihat bayangannya sendiri.</p><p>Bukan yang ada di cermin, tapi yang ada dalam ingatannya—versi dirinya yang dulu. Yang penuh bara. Yang bisa menyala kapan saja.</p><p><strong>Ia tidak ingin menjadi penonton dari hidupnya sendiri.</strong></p>`,
      },
      {
        id: 6,
        content: `<p>Perjalanan kembali dimulai. Berat. Lambat. Penuh rasa malu karena harus mengulang.</p><p>Tapi satu hal yang kini tertanam kuat di dadanya: <strong>ia masih punya nyala.</strong> Meskipun kecil, ia menyimpannya. Dan itu cukup untuk membuatnya bergerak.</p>`,
      },
      {
        id: 7,
        content: `<p>Hari ini, Aksa belum kembali menjadi dirinya yang dulu.</p><p>Tapi setiap langkahnya kini adalah <strong>pilihan sadar untuk tidak menyerah.</strong></p><p>Setiap detik, ia bertaruh pada kemungkinan bahwa dirinya masih bisa kembali menjadi sosok yang bukan hanya baik, tapi berarti.</p>`,
      },
    ],
    []
  );

  // GLTF preload sebelum visible
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
        lerp: 0.05,
        smoothWheel: true,
        syncTouch: true,
      });

      lenisRef.current.on("scroll", ScrollTrigger.update);

      const raf = (time) => {
        lenisRef.current.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    };
    initLenis();

    const ctx = gsap.context(() => {
      const totalParts = floorTexts.length;
      const durationPerPart = 1;

      const masterTL = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${window.innerHeight * totalParts}`,
          scrub: 0.5,
          pin: true,
          markers: false,
          onUpdate: (self) => {
            setProgress(self.progress);
            if (self.progress > 0.05 && !botReady) setBotReady(true);
          },
        },
      });

      // Transisi masuk dari fog
      masterTL.fromTo(
        "#bot-fog",
        { opacity: 0 },
        { opacity: 1, duration: 1.5, ease: "power2.out" },
        0.1
      );

      // Gerak bot masuk dari atas, kabut menyebar
      masterTL.fromTo(
        "#bot-position",
        { y: -2, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5, ease: "power2.out" },
        0.3
      );

      // Floor text animation
      floorTexts.forEach((_, i) => {
        const ref = textRefs.current[i];
        if (!ref) return;

        const start = i * durationPerPart;
        const end = start + durationPerPart;

        masterTL.fromTo(
          ref,
          { opacity: 0, y: 100, scale: 0.95, filter: "blur(10px)" },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.8,
            ease: "power2.out",
          },
          start
        );

        masterTL.to(
          ref,
          {
            opacity: 0,
            y: -100,
            scale: 0.9,
            filter: "blur(10px)",
            duration: 0.6,
            ease: "power2.inOut",
          },
          end - 0.3
        );
      });

      // Ekspresi emosi bot
      masterTL.to(
        "#bot-head",
        { rotationX: -0.2, duration: 1, ease: "power2.out" },
        3
      );
      masterTL.to(
        "#bot-head",
        { rotationX: 0, duration: 1, ease: "power2.inOut" },
        5
      );

      masterTL.fromTo(
        "#epicText",
        { opacity: 0, scale: 0.8, y: 100, filter: "blur(10px)" },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.2,
          ease: "power4.out",
        },
        (floorTexts.length - 1) * durationPerPart + 0.2
      );

      masterTL.to(
        "#epicText",
        {
          opacity: 0,
          scale: 1.05,
          y: -100,
          filter: "blur(6px)",
          duration: 1,
          ease: "power2.inOut",
        },
        floorTexts.length * durationPerPart - 0.2
      );
    }, containerRef);

    return () => {
      ctx.revert();
      lenisRef.current?.destroy();
    };
  }, [floorTexts, botReady]);

  return (
    <section
      ref={containerRef}
      className={styles.container}
      aria-label="3D Interactive Experience"
    >
      <div className={styles.progressBarWrapper}>
        <div
          className={styles.progressBar}
          style={{ width: `${(progress * 100).toFixed(2)}%` }}
        />
      </div>

      <ThreeCanvas scrollY={progress} botReady={botReady} />

      <div className={styles.slidesContainer}>
        {floorTexts.map((floor, i) => (
          <section
            key={floor.id}
            ref={(el) => (textRefs.current[i] = el)}
            className={`${styles.slide} ${styles.floorText}`}
          >
            <div className={styles.textPanel}>
              <div
                className={styles.textFrame}
                dangerouslySetInnerHTML={{ __html: floor.content }}
              />
            </div>
          </section>
        ))}
      </div>

      <div className={styles.epicTextWrapper}>
        <div className={styles.epicText} id="epicText">
          IA MASIH PUNYA NYALA
        </div>
      </div>
    </section>
  );
}
