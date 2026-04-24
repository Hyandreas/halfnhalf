import type { Metadata } from "next";
import { Press_Start_2P, Nunito } from "next/font/google";
import Script from "next/script";
import { GrainOverlay } from "@/components/layout/GrainOverlay";
import "./globals.css";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "halfnhalf — split screen shorts maker",
  description: "Stack two clips top and bottom into a YouTube Shorts-ready video. Free to use.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${pressStart.variable} ${nunito.variable}`}>
      <body>
        <GrainOverlay />
        {children}
        {process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}
      </body>
    </html>
  );
}
