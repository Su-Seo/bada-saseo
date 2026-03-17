import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import SoundToggle from "@/components/SoundToggle";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "바다사서 — 누구에게도 말 못한 마음, 바다에 흘려보내세요",
  description: "익명의 편지를 바다에 던지고, 누군가의 마음을 주워 읽는 힐링 플랫폼",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${geist.variable} font-sans antialiased`}>
        <SoundToggle />
        {children}
      </body>
    </html>
  );
}
