"use client";

import React from "react";
import { X, Share, PlusSquare, CheckCircle2 } from "lucide-react";
import { usePwa } from "@/lib/pwa-context";
import BrandLogo from "./BrandLogo";

export default function PwaInstallModal() {
  const { installModalOpen, closeInstallModal, isIos, isInstalled } = usePwa();

  if (!installModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#0F172A] border border-white/15 p-6 shadow-2xl shadow-black/90 space-y-5 text-white relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeInstallModal}
          aria-label="Close installation instructions"
          className="absolute top-5 right-5 h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 text-[#A6B0BE] hover:text-white flex items-center justify-center transition border border-white/5 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header with Brand Logo */}
        <div className="flex items-center gap-3 pr-8">
          <BrandLogo size="md" href={null} withSubtitle={false} />
          <div>
            <h3 id="pwa-install-title" className="text-sm font-bold text-white tracking-tight">
              Install Horizon Equity App
            </h3>
            <span className="text-[11px] text-[#27C58B] flex items-center gap-1 font-medium">
              <CheckCircle2 className="h-3 w-3" /> Progressive Web Application
            </span>
          </div>
        </div>

        {isInstalled ? (
          <div className="p-4 rounded-xl bg-[#27C58B]/10 border border-[#27C58B]/20 text-xs text-[#27C58B] space-y-1">
            <span className="font-bold block text-sm">Application Already Installed</span>
            <p className="text-[#A6B0BE]">
              Horizon Equity is already installed on this device. You can launch it directly from your home screen or applications menu.
            </p>
          </div>
        ) : isIos ? (
          /* iOS Safari Specific Instructions */
          <div className="space-y-4">
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Install Horizon Equity directly to your iPhone or iPad home screen for instant biometric login, full-screen dashboard access, and zero address bar clutter:
            </p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-[#111827] border border-white/10 flex items-start gap-3 text-xs">
                <div className="h-7 w-7 rounded-lg bg-[#4388F5]/15 border border-[#4388F5]/30 flex items-center justify-center text-[#4388F5] shrink-0 font-bold">
                  1
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-white block">Tap the Share Icon</span>
                  <span className="text-[11px] text-[#7D8998] flex items-center gap-1 mt-0.5">
                    Tap the <Share className="h-3.5 w-3.5 text-[#4388F5] inline" /> button in Safari's bottom toolbar.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#111827] border border-white/10 flex items-start gap-3 text-xs">
                <div className="h-7 w-7 rounded-lg bg-[#4388F5]/15 border border-[#4388F5]/30 flex items-center justify-center text-[#4388F5] shrink-0 font-bold">
                  2
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-white block">Select "Add to Home Screen"</span>
                  <span className="text-[11px] text-[#7D8998] flex items-center gap-1 mt-0.5">
                    Scroll down and tap <PlusSquare className="h-3.5 w-3.5 text-[#C5A059] inline" /> <strong>Add to Home Screen</strong>.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#111827] border border-white/10 flex items-start gap-3 text-xs">
                <div className="h-7 w-7 rounded-lg bg-[#4388F5]/15 border border-[#4388F5]/30 flex items-center justify-center text-[#4388F5] shrink-0 font-bold">
                  3
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-white block">Tap "Add" in Top Corner</span>
                  <span className="text-[11px] text-[#7D8998] mt-0.5 block">
                    Confirm by tapping <strong>Add</strong> at the top right to complete installation.
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Android / Desktop / Chrome / Edge Instructions */
          <div className="space-y-4">
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Install Horizon Equity directly on your device for fast access, native window styling, and institutional portfolio management:
            </p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-[#111827] border border-white/10 flex items-start gap-3 text-xs">
                <div className="h-7 w-7 rounded-lg bg-[#4388F5]/15 border border-[#4388F5]/30 flex items-center justify-center text-[#4388F5] shrink-0 font-bold">
                  1
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-white block">Browser Installation Prompt</span>
                  <span className="text-[11px] text-[#7D8998] mt-0.5 block">
                    Look for the <strong>Install</strong> icon in your browser address bar, or tap browser menu (⋮).
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#111827] border border-white/10 flex items-start gap-3 text-xs">
                <div className="h-7 w-7 rounded-lg bg-[#4388F5]/15 border border-[#4388F5]/30 flex items-center justify-center text-[#4388F5] shrink-0 font-bold">
                  2
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-white block">Click "Install Horizon Equity"</span>
                  <span className="text-[11px] text-[#7D8998] mt-0.5 block">
                    Confirm prompt to pin the application to your desktop or mobile app launcher.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={closeInstallModal}
            className="px-5 py-2 rounded-lg bg-[#4388F5] hover:bg-[#4388F5]/90 text-xs font-semibold text-white transition cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
