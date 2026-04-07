import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance Visualizer",
  description: "누구나 이해하는 재무 데이터 시각화 분석 서비스",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
