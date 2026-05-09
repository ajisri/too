"use client";
import React, { useLayoutEffect, useRef } from "react";
import styles from "./style.module.css";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ─── Hero Section — Swiss Style × Brutalism
//
// EDITORIAL PRINCIPLES:
//   Swiss Style  → strict grid, typographic hierarchy, functional structure
//   Brutalism    → raw honesty, no decorative copy, direct statements
//
// COPY HIERARCHY:
//   [01] CATEGORY MARKER  — structural index, not a label
//   [02] DISPLAY TITLE    — oversized, compressed — typographic weight is content
//   [03] SUBTITLE         — lowercase italic contrast against uppercase mass
//   [04] DATA STRIP       — cold factual metadata: duration, language, format
//   [05] OPENING LINE     — first sentence of the story, verbatim — no summary
//   [06] SCROLL INDEX     — coordinate, not instruction

export default function HeroSection() {
  const sectionRef   = useRef(null);
  const bgRef        = useRef(null);
  const overlayRef   = useRef(null);
  const markerRef    = useRef(null);    // [01] category marker
  const titleARef    = useRef(null);    // [02] display title
  const titleBRef    = useRef(null);    // [03] subtitle
  const dataStripRef = useRef(null);    // [04] metadata strip
  const openingRef   = useRef(null);    // [05] opening line
  const scrollCueRef = useRef(null);    // [06] scroll index
  const panelRef     = useRef(null);    // image panel
  const ruleTopRef   = useRef(null);    // horizontal rule — top
  const ruleBotRef   = useRef(null);    // horizontal rule — bottom

  // ─── [A] Entrance: strict sequential, no overlap
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Hard initial states — nothing visible
      gsap.set(
        [markerRef.current, titleARef.current, titleBRef.current,
         dataStripRef.current, openingRef.current, scrollCueRef.current],
        { opacity: 0, y: 24 }
      );
      gsap.set(panelRef.current,  { opacity: 0, x: 40 });
      gsap.set(overlayRef.current, { opacity: 1 });
      gsap.set([ruleTopRef.current, ruleBotRef.current], { scaleX: 0, transformOrigin: "left" });

      // Timeline — delay until preloader exits
      const tl = gsap.timeline({ delay: 2.1 });

      tl
        // BG stabilizes
        .to(overlayRef.current,  { opacity: 0.75, duration: 1.0, ease: "power1.out" })

        // Rules draw left-to-right (Swiss grid reveal)
        .to(ruleTopRef.current,  { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, "-=0.5")
        .to(ruleBotRef.current,  { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, "-=0.4")

        // Category marker
        .to(markerRef.current,   { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, "-=0.2")

        // Display title — slams in
        .to(titleARef.current,   { opacity: 1, y: 0, duration: 0.7, ease: "expo.out" }, "-=0.1")
        .to(titleBRef.current,   { opacity: 1, y: 0, duration: 0.65, ease: "expo.out" }, "-=0.5")

        // Data strip
        .to(dataStripRef.current,{ opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, "-=0.2")

        // Image panel slides in from right
        .to(panelRef.current,    { opacity: 1, x: 0, duration: 1.0, ease: "power3.out" }, "-=0.7")

        // Opening line
        .to(openingRef.current,  { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.4")

        // Scroll cue last
        .to(scrollCueRef.current,{ opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // ─── [B] Scroll: parallax BG + exit content into darkness
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Background parallax
      gsap.to(bgRef.current, {
        yPercent: -18,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end:   "bottom top",
          scrub: true,
        },
      });

      // Rules + marker exit first
      gsap.to([ruleTopRef.current, ruleBotRef.current, markerRef.current, scrollCueRef.current], {
        opacity: 0, y: -20,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "15% top",
          end:   "55% top",
          scrub: true,
        },
      });

      // Title + panel exit
      gsap.to([titleARef.current, titleBRef.current, panelRef.current], {
        opacity: 0, y: -50,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "30% top",
          end:   "75% top",
          scrub: true,
        },
      });

      // Caption exits last
      gsap.to([dataStripRef.current, openingRef.current], {
        opacity: 0, y: -30,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "40% top",
          end:   "80% top",
          scrub: true,
        },
      });

      // Overlay closes to black
      gsap.to(overlayRef.current, {
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "65% top",
          end:   "bottom top",
          scrub: true,
        },
      });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        onEnter:     () => gsap.to("#main-bg", { backgroundColor: "#000", duration: 0.3 }),
        onEnterBack: () => gsap.to("#main-bg", { backgroundColor: "#000", duration: 0.3 }),
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.hero}>

      {/* ── Background ── */}
      <div ref={bgRef} className={styles.bg}>
        <Image
          src="/images/background.jpeg"
          alt="Background"
          fill priority
          sizes="100vw"
          className={styles.bgImage}
        />
      </div>
      <div ref={overlayRef} className={styles.overlay} />

      {/* ── Main Grid ── */}
      <div className={styles.inner}>

        {/* ── Left Column ── */}
        <div className={styles.leftCol}>

          {/* [01] Category marker — Swiss structural index */}
          <div ref={markerRef} className={styles.marker}>
            <span className={styles.markerIndex}>№ 01</span>
            <span className={styles.markerDivider}>/</span>
            <span className={styles.markerLabel}>FIKSI NARATIF</span>
          </div>

          {/* [02 + 03] Display Title block */}
          <div className={styles.titleBlock}>
            {/* Rule — top of title (Swiss baseline marker) */}
            <div ref={ruleTopRef} className={styles.ruleTop} />

            {/* [02] Oversized display — brutalist weight */}
            <h1 ref={titleARef} className={styles.titleA}>
              BAYANGAN
            </h1>

            {/* [03] Subtitle — lowercase serif italic, breaks the all-caps register */}
            <p ref={titleBRef} className={styles.titleB}>
              yang ia tinggalkan
            </p>

            {/* Rule — bottom of title */}
            <div ref={ruleBotRef} className={styles.ruleBot} />
          </div>

          {/* [04] Data strip — cold metadata, no prose */}
          <div ref={dataStripRef} className={styles.dataStrip}>
            <span>Baca <strong>±12 Mnt</strong></span>
            <span className={styles.dataSep}>—</span>
            <span>Bahasa <strong>ID</strong></span>
            <span className={styles.dataSep}>—</span>
            <span>Format <strong>Scroll</strong></span>
          </div>

          {/* [05] Opening line — verbatim from story. No paraphrase. */}
          <p ref={openingRef} className={styles.opening}>
            Ada nama yang pernah disebut<br />
            dengan nada kagum.<br />
            Kini tidak ada yang menyebutnya.
          </p>

        </div>

        {/* ── Right Column — Image panel ── */}
        <div ref={panelRef} className={styles.panel}>
          <div className={styles.panelInner}>
            <Image
              src="/images/intro.png"
              alt="Scene"
              fill priority
              sizes="(max-width: 900px) 80vw, 42vw"
              className={styles.panelImage}
            />
          </div>
          {/* Panel index label — Swiss corner annotation */}
          <span className={styles.panelLabel}>FIG. 01</span>
        </div>

      </div>

      {/* [06] Scroll index — coordinate, not instruction */}
      <div ref={scrollCueRef} className={styles.scrollCue}>
        <span className={styles.scrollCoord}>0,0 → ↓</span>
        <div className={styles.scrollTrack}>
          <div className={styles.scrollRunner} />
        </div>
      </div>

    </section>
  );
}
