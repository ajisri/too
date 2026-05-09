import "./globals.css";
import { Noto_Serif_JP, Playfair_Display } from "next/font/google";
import "@fontsource/playfair-display/700.css";
import "@fontsource/bebas-neue";

const notoSerifJP = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-jp",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata = {
  title: "Bayangan yang Ia Tinggalkan",
  description: "Sebuah perjalanan naratif interaktif tentang kehilangan arah, menemukan kembali nyala, dan keberanian untuk tidak menyerah.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${notoSerifJP.variable} ${playfairDisplay.variable}`}>
      <body>{children}</body>
    </html>
  );
}
