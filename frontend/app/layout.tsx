import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Horizon Equity | Premium Multi-Asset Investment Platform",
  description:
    "Access institutional-grade allocations across digital assets, real estate, energy, currencies, and mineral resources. Invest beyond the horizon with structured plans and transparent returns.",
  keywords: [
    "investment platform",
    "crypto investments",
    "digital assets",
    "real estate investment",
    "energy investments",
    "mineral resources",
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
      <body
        className="font-sans min-h-screen bg-[#07111F] text-white antialiased"
      >
        {children}
      </body>
    </html>
  );
}
