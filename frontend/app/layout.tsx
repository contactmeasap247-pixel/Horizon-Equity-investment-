import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/language-context";

export const metadata: Metadata = {
  title: "Horizon Equity | Premium Multi-Asset Investment Platform",
  description:
    "Access institutional-grade allocations across digital assets, fixed-yield plans, forex liquidity, and global equities. Invest beyond the horizon with transparent compounding returns.",
  keywords: [
    "investment platform",
    "crypto investments",
    "digital assets",
    "fixed return investment",
    "forex trading",
    "copy trading",
    "institutional investing",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-canvas text-text selection:bg-accent/25 selection:text-text antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
