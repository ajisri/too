"use client";
import Preloader from "../components/Preloader";
import Intro from "../components/Intro";
import Description from "../components/Description";
import Project from "../components/Project";
import Footer from "../components/Footer";
import styles from "./page.module.css";
import dynamic from "next/dynamic";
import useLenisScroll from "../hooks/useLenisScroll"; // Import hook

const ThreeScene = dynamic(() => import("@/components/ThreeDModel"), {
  ssr: false,
  loading: () => <div className="h-screen bg-black" />, // Loading black screen
});

export default function Home() {
  const scrollY = useLenisScroll(); // Gunakan hook untuk scroll

  return (
    <main className={styles.main}>
      <Preloader />
      <Intro />
      <Description />

      {/* Three Scene Section dengan latar belakang hitam */}
      <section
        className="relative z-10 min-h-[600vh] overflow-hidden bg-black text-white"
        style={{ backgroundColor: "black" }}
      >
        <ThreeScene />
      </section>

      {/* Section dengan background putih (sebelum ThreeScene) */}
      <section className="relative z-0 bg-white">
        <Project />
        <div className="h-[130px]"></div>
        <Footer />
      </section>
    </main>
  );
}
