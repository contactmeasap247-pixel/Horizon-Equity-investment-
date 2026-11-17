"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

export default function SplashScreen() {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Do not show repeatedly during same browsing session
    const alreadyShown = sessionStorage.getItem("he_splash_shown");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (alreadyShown || prefersReducedMotion) {
      setHidden(true);
      return;
    }

    setMounted(true);

    // Smooth institutional progress animation (0 -> 100% over ~1.2s)
    const startTime = Date.now();
    const duration = 1200;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        // Begin graceful exit transition
        setTimeout(() => {
          setExiting(true);
          sessionStorage.setItem("he_splash_shown", "true");
          // Remove from DOM after fade-out
          setTimeout(() => {
            setHidden(true);
          }, 500);
        }, 150);
      }
    }, 25);

    // Hard safety timeout: Guaranteed dismiss after 2.2s maximum
    const safetyTimeout = setTimeout(() => {
      clearInterval(interval);
      setExiting(true);
      sessionStorage.setItem("he_splash_shown", "true");
      setTimeout(() => setHidden(true), 400);
    }, 2200);

    return () => {
      clearInterval(interval);
      clearTimeout(safetyTimeout);
    };
  }, []);

  if (hidden || !mounted) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] bg-[#070A0E] flex flex-col items-center justify-between py-12 px-6 transition-all duration-500 ease-out select-none ${
        exiting ? "opacity-0 scale-98 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Top spacer */}
      <div className="w-full flex justify-end">
        <span className="text-[10px] font-mono tracking-widest text-[#7D8998] uppercase">
          SECURE PROTOCOL v2.4
        </span>
      </div>

      {/* Center Brand Cluster */}
      <div className="flex flex-col items-center text-center relative max-w-sm">
        {/* Ambient Subtle Radial Glow */}
        <div className="absolute -inset-16 rounded-full bg-gradient-to-tr from-[#4388F5]/10 via-[#C5A059]/10 to-transparent blur-3xl pointer-events-none" />

        {/* Precision Geometric Emblem */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="h-20 w-20 rounded-2xl bg-[#111821] border border-[#C5A059]/30 flex items-center justify-center shadow-2xl shadow-[#4388F5]/20 relative overflow-hidden">
            {/* Subtle light sweep across emblem */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-pulse" />

            <svg
              width="44"
              height="44"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow"
            >
              <path
                d="M7 6V26M13 13V26M19 18V26M25 6V26"
                stroke="#4388F5"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.35"
              />
              <path
                d="M6 23C12 21 18 16 26 8"
                stroke="#C5A059"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M20 7H26V13"
                stroke="#C5A059"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect x="7" y="16" width="3.5" height="10" rx="1" fill="#4388F5" fillOpacity="0.85" />
              <rect x="13.5" y="12" width="3.5" height="14" rx="1" fill="#4388F5" />
              <rect x="20" y="8" width="3.5" height="18" rx="1" fill="#C5A059" />
            </svg>
          </div>
        </div>

        {/* Wordmark */}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5F7FA] font-sans">
          HORIZON <span className="text-[#4388F5]">EQUITY</span>
        </h1>
        <span className="text-[10px] tracking-widest text-[#7D8998] uppercase font-semibold mt-1">
          FINANCIAL PLATFORM
        </span>

        {/* Tagline */}
        <p className="text-xs text-[#C5A059] font-medium tracking-wide mt-3">
          Global Capital. Strategic Growth.
        </p>

        {/* Loading Progress Bar */}
        <div className="w-48 mt-8 space-y-2">
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden p-0 relative">
            <div
              className="h-full bg-gradient-to-r from-[#1E3A8A] via-[#4388F5] to-[#C5A059] rounded-full transition-all duration-75 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-[#64748B]">
            <span>INITIALIZING</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>

      {/* Bottom Institutional Seal */}
      <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
        <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
        <span>Institutional 256-Bit Ledger Verification</span>
      </div>
    </div>
  );
}

