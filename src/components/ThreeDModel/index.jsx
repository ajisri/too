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
                duration: 2.5,
                gap: 1.5
            },
            {
                id: 2,
                content: `<p><strong>Namanya Aksa.</strong></p><p>Pernah, di masa silam, ia dikenal sebagai sosok yang menyala. Dalam diamnya, ada nyala tekad. Dalam langkahnya, ada arah yang selalu jelas.</p><p>Ia bukan hanya cerdas, tapi juga penuh visi. Seakan segala hal yang disentuhnya, tumbuh menjadi sesuatu yang berarti.</p>`,
                backgroundText: "AKSA",
                duration: 3.5,
                gap: 1.8
            },
            {
                id: 3,
                content: `<p>Namun waktu… tak selalu bersahabat.</p><p>Perlahan, tanpa disadarinya, Aksa mulai berjalan tanpa arah. Bukan karena ia kehilangan tujuan, tapi karena terlalu lama membiarkan dirinya terjebak dalam kenyamanan semu.</p>`,
                backgroundText: "TIME",
                duration: 3.2,
                gap: 2.0
            },
            {
                id: 4,
                content: `<p>Hari-harinya diisi dengan distraksi kecil yang menjelma besar. Ia menunda, menanti, lalu mengulanginya. Hari demi hari, tanpa progres. Ia tahu itu, <br><br><strong>tapi seperti lumpur, makin ia mencoba bergerak, makin dalam ia tenggelam.</strong></p>`,
                backgroundText: "STUCK",
                duration: 4.2,
                gap: 2.2
            },
            {
                id: 5,
                content: `<p>Hingga akhirnya… datang ujian itu.</p><p>Bukan bencana besar, bukan pula kegagalan mencolok. Tapi cukup untuk menyentaknya.</p>`,
                backgroundText: "TEST",
                duration: 2.8,
                gap: 1.5
            },
            {
                id: 6,
                content: `<p>Sebuah kesempatan besar—yang dulu akan ia taklukkan dengan mudah—kini berdiri di hadapannya, dan <br><br><strong>ia sadar: ia tidak lagi siap.</strong></p><p>Tangannya ragu, pikirannya lambat, hatinya ciut.</p>`,
                backgroundText: "REALIZE",
                duration: 3.5,
                gap: 1.8
            },
            {
                id: 7,
                content: `<p>Saat itulah ia melihat bayangannya sendiri.</p><p>Bukan yang ada di cermin, tapi yang ada dalam ingatannya—versi dirinya yang dulu. Yang penuh bara. Yang bisa menyala kapan saja.</p><p><strong>Ia tidak ingin menjadi penonton dari hidupnya sendiri.</strong></p>`,
                backgroundText: "REFLECTION",
                duration: 3.8,
                gap: 2.0
            },
            {
                id: 8,
                content: `<p>Perjalanan kembali dimulai. Berat. Lambat. Penuh rasa malu karena harus mengulang.</p><p>Tapi satu hal yang kini tertanam kuat di dadanya: <strong>ia masih punya nyala.</strong> Meskipun kecil, ia menyimpannya. Dan itu cukup untuk membuatnya bergerak.</p>`,
                backgroundText: "JOURNEY",
                duration: 3.0,
                gap: 1.6
            },
            {
                id: 9,
                content: `<p>Hari ini, Aksa belum kembali menjadi dirinya yang dulu.</p><p>Tapi setiap langkahnya kini adalah <strong>pilihan sadar untuk tidak menyerah.</strong></p><p>Setiap detik, ia bertaruh pada kemungkinan bahwa dirinya masih bisa kembali menjadi sosok yang bukan hanya baik, tapi berarti.</p>`,
                backgroundText: "HOPE",
                duration: 3.5,
                gap: 2.2
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
            // Hide title after initial animation with longer duration
            gsap.to(titleRef.current, {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "25% top",
                    scrub: true,
                    toggleActions: "play none none reverse",
                    once: true,
                },

                opacity: 0,
                y: -50,            // Added subtle upward movement
                duration: 1,       // Increased duration
                ease: "power2.inOut",
                onComplete: () => {
                    gsap.set(titleRef.current, { display: 'none' });
                }
            });

            const totalParts = floorTexts.length;
            const durationPerPart = 2.5;
            const gap = 1.8;
            const windowHeight = window.innerHeight;

            // Hitung endScroll agar lebih longgar sesuai durasi+gap setiap floor
            const endScroll = floorTexts.reduce((sum, floor) => {
                return sum + ((floor.duration || durationPerPart) + (floor.gap || gap)) * windowHeight;
            }, 0);

            const masterTL = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: `+=${endScroll}`,
                    scrub: 1.5,
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
            }

            // Perbaikan timing untuk title
            floorTexts.forEach((floor, i) => {
                const textRef = textRefs.current[i];
                const backgroundTextRef = backgroundTextRefs.current[i];
                if (!textRef || !backgroundTextRef) return;

                // Hitung start berdasarkan durasi+gap semua floor sebelumnya
                let start = 0;
                for (let j = 0; j < i; j++) {
                    const prev = floorTexts[j];
                    start += (prev.duration || durationPerPart) + (prev.gap || gap);
                }

                const thisDuration = floor.duration || durationPerPart;
                const thisGap = floor.gap || gap;
                const exitStart = start + (thisDuration * 0.8);

                // Position adjustments
                let yPosition = 0;
                let xPosition = 0;
                let scale = 1;
                let bgPosition = {};

                if (floor.id === 1) {
                    yPosition = -20;
                    xPosition = -348;
                    scale = 1;
                    bgPosition = { top: "5%", left: "5%", transform: "none" };
                } else {
                    yPosition = 0;
                    xPosition = 0;
                    bgPosition = { top: "5%", right: "5%", left: "auto", transform: "none" };
                }

                // Background text animation
                masterTL.fromTo(
                    backgroundTextRef,
                    {
                        opacity: 0,
                        scale: 0.8,
                        filter: "blur(20px)",
                        ...bgPosition
                    },
                    {
                        opacity: 0.08,
                        scale: 1,
                        filter: "blur(0px)",
                        duration: thisDuration,
                        ease: "power2.out",
                        ...bgPosition
                    },
                    start
                );

                // Text entry animation
                masterTL.fromTo(
                    textRef,
                    {
                        opacity: 0,
                        y: 120,
                        x: xPosition,
                        scale: scale,
                        filter: "blur(15px)",
                        rotationX: 15,
                    },
                    {
                        opacity: 1,
                        y: yPosition,
                        x: xPosition,
                        scale: scale,
                        filter: "blur(0px)",
                        rotationX: 0,
                        duration: thisDuration,
                        ease: "power3.out",
                    },
                    start
                );

                // Text exit animation
                masterTL.to(
                    textRef,
                    {
                        opacity: 0,
                        y: yPosition - 80,
                        scale: 0.9,
                        filter: "blur(15px)",
                        rotationX: -15,
                        duration: thisDuration * 0.6,
                        ease: "power3.in",
                    },
                    exitStart
                );
            });

            if (lenisRef.current && isInitialLoad.current) {
                lenisRef.current.scrollTo(0, { immediate: true });
                isInitialLoad.current = false;
            }


            ScrollTrigger.refresh();
        }, containerRef);

        return () => {
            if (splitTitleRef.current) {
                splitTitleRef.current.revert();
                splitTitleRef.current = null;
            }
            ctx.revert();
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
                        textTransform: "uppercase"
                    }}
                >
                    Bayangan yang ia tinggalkan
                </h2>
            </section>

            <div className={styles.slidesContainer}>
                {floorTexts.map((floor, i) => {
                    const isId1 = floor.id === 1;
                    return (
                        <section
                            key={floor.id}
                            className={`${styles.slide} ${styles.floorText} ${
                                isId1 ? styles.leftTopAlign : ""
                            }`}
                            style={isId1 ? {
                                position: 'absolute',
                                left: '80px',
                                top: '15%',
                                transform: 'none',
                                width: '100%',
                                maxWidth: '90vw',
                                textAlign: 'left' // Tambahkan alignment kiri
                            } : {}}
                        >
                            <div
                                ref={(el) => (backgroundTextRefs.current[i] = el)}
                                className={styles.backgroundTextElement}
                                style={
                                    isId1
                                        ? {
                                            position: "absolute",
                                            top: "5%",
                                            left: "5%",
                                            transform: "none",
                                            textAlign: "left" // Tambahkan alignment kiri
                                        }
                                        : {
                                            top: "5%",
                                            right: "5%",
                                            left: "auto",
                                            transform: "none",
                                        }
                                }
                            >
                                {floor.backgroundText}
                            </div>
                            <div
                                ref={(el) => (textRefs.current[i] = el)}
                                className={`${styles.textPanel} ${
                                    isId1 ? styles.leftPanel : ""
                                }`}
                                style={isId1 ? {
                                    textAlign: 'left',
                                    padding: '0',
                                    width: '100%'
                                } : {}}
                            >
                                <div
                                    className={styles.textFrame}
                                    style={{
                                        fontFamily: "'Bebas Neue', sans-serif",
                                        fontWeight: 400,
                                        fontSize: isId1 ? "44px" : "36px",
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