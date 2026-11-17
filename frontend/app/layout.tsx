import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/language-context";
import { PwaProvider } from "@/lib/pwa-context";
import NavigationProgress from "@/app/components/NavigationProgress";
import ServerKeepAlive from "@/app/components/ServerKeepAlive";
import SmartsuppChat from "@/app/components/SmartsuppChat";
import FloatingSupportWidget from "@/app/components/FloatingSupportWidget";
import ReferralCapture from "@/app/components/ReferralCapture";
import SplashScreen from "@/app/components/SplashScreen";
import PwaInstallBanner from "@/app/components/PwaInstallBanner";
import PwaInstallModal from "@/app/components/PwaInstallModal";
import CookieConsentBanner from "@/app/components/CookieConsentBanner";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0B0F14",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.horizon-equity.net")
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
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Horizon Equity",
  },
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
        <PwaProvider>
          <Suspense fallback={null}>
            <ReferralCapture />
          </Suspense>
          <ServerKeepAlive />
          <NavigationProgress />
          <SplashScreen />
          <SmartsuppChat />
          <FloatingSupportWidget />
          <PwaInstallBanner />
          <PwaInstallModal />
          <CookieConsentBanner />
          <LanguageProvider>{children}</LanguageProvider>
        </PwaProvider>
      </body>
    </html>
  );
}
