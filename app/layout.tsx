import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RX Resolve — Intelligent Refill Resolution",
  description: "Closed-loop prescription refill workflow orchestration demo",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
