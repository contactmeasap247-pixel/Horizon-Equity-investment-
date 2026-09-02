import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Horizon Equity | Premium Crypto Investment Platform",
  description: "Experience the next generation of asset growth with Horizon Equity, a premium institutional cryptocurrency investment platform offering structured plans and transparent returns.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.variable} font-sans min-h-screen bg-[#07111F] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
