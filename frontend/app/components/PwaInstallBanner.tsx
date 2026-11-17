"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, X, Smartphone } from "lucide-react";
import { usePwa } from "@/lib/pwa-context";

const COOLDOWN_HOURS = 24;

export default function PwaInstallBanner() {
  const pathname = usePathname();
  const { isInstalled, isStandalone, promptInstall } = usePwa();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Do not show if already installed or standalone
    if (isInstalled || isStandalone) {
      setVisible(false);
      return;
    }

    // Do not show on administrative pages
    if (pathname?.startsWith("/dashboard/admin")) {
      setVisible(false);
      return;
    }

    // Check cooldown from localStorage
    try {
      const dismissedAt = localStorage.getItem("he_pwa_banner_dismissed_at");
      if (dismissedAt) {
        const timePassedMs = Date.now() - parseInt(dismissedAt, 10);
        const hoursPassed = timePassedMs / (1000 * 60 * 60);
        if (hoursPassed < COOLDOWN_HOURS) {
          setVisible(false);
          return;
        }
      }
    } catch {
      // ignore
    }

    // Show after slight delay so it doesn't jarringly pop up immediately on mount
    const timer = setTimeout(() => {
      setVisible(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [isInstalled, isStandalone, pathname]);

  const handleDismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem("he_pwa_banner_dismissed_at", Date.now().toString());
    } catch {
      // ignore
    }
  };

  const handleInstallClick = async () => {
    await promptInstall();
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Install Horizon Equity Progressive Web App"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-40 rounded-2xl bg-[#0F172A]/95 backdrop-blur-xl border border-[#4388F5]/30 p-4 shadow-2xl shadow-black/80 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        {/* App Icon */}
        <div className="h-11 w-11 rounded-xl bg-[#151F2B] border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
          <Smartphone className="h-6 w-6 text-[#4388F5]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white tracking-tight">
              Install Horizon Equity
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#27C58B]/15 text-[#27C58B] border border-[#27C58B]/30 uppercase tracking-wider">
              Native App
            </span>
          </div>
          <p className="text-[11px] text-[#94A3B8] leading-relaxed mt-1">
            Get faster access to your investment dashboard with the Horizon Equity app.
          </p>

          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 rounded-lg bg-[#4388F5] hover:bg-[#4388F5]/90 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Install Now</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#7D8998] hover:text-white text-xs font-medium transition cursor-pointer"
            >
              Maybe Later
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss app installation prompt"
          className="h-6 w-6 rounded-md bg-white/5 hover:bg-white/10 text-[#7D8998] hover:text-white flex items-center justify-center transition border border-white/5 shrink-0 cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
}
