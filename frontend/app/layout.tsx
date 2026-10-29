import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/language-context";
import NavigationProgress from "@/app/components/NavigationProgress";
import ServerKeepAlive from "@/app/components/ServerKeepAlive";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://horizon-equity-investment.vercel.app")
  ),
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
      <head>
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
      </head>
      <body className="min-h-screen bg-canvas text-text selection:bg-accent/25 selection:text-text antialiased">
        <ServerKeepAlive />
        <NavigationProgress />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
