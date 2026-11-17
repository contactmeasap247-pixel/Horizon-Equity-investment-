"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Shield, Settings2, Check, X, Lock, ExternalLink } from "lucide-react";
import Link from "next/link";
import {
  getStoredConsent,
  saveConsentRecord,
  CookiePreferences,
} from "@/lib/cookie-consent";

export default function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Preference selections for modal
  const [preferences, setPreferences] = useState<Omit<CookiePreferences, "essential">>({
    functional: false,
    analytics: false,
    marketing: false,
  });

  // Check consent status on mount
  useEffect(() => {
    setMounted(true);
    const existing = getStoredConsent();
    if (!existing) {
      // Small timeout so it doesn't clash abruptly with splash screen
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      setPreferences({
        functional: existing.categories.functional,
        analytics: existing.categories.analytics,
        marketing: existing.categories.marketing,
      });
    }
  }, []);

  // Listen for open-cookie-preferences event from footer or anywhere
  useEffect(() => {
    const handleOpen = () => {
      const current = getStoredConsent();
      if (current) {
        setPreferences({
          functional: current.categories.functional,
          analytics: current.categories.analytics,
          marketing: current.categories.marketing,
        });
      }
      setShowModal(true);
    };

    window.addEventListener("open-cookie-preferences", handleOpen);
    return () => window.removeEventListener("open-cookie-preferences", handleOpen);
  }, []);

  // Keyboard escape to close modal
  useEffect(() => {
    if (!showModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showModal]);

  const handleAcceptAll = useCallback(() => {
    saveConsentRecord({
      functional: true,
      analytics: true,
      marketing: true,
    });
    setPreferences({
      functional: true,
      analytics: true,
      marketing: true,
    });
    setShowBanner(false);
    setShowModal(false);
  }, []);

  const handleRejectOptional = useCallback(() => {
    saveConsentRecord({
      functional: false,
      analytics: false,
      marketing: false,
    });
    setPreferences({
      functional: false,
      analytics: false,
      marketing: false,
    });
    setShowBanner(false);
    setShowModal(false);
  }, []);

  const handleSavePreferences = useCallback(() => {
    saveConsentRecord(preferences);
    setShowBanner(false);
    setShowModal(false);
  }, [preferences]);

  const openCustomizeModal = useCallback(() => {
    setShowBanner(false);
    setShowModal(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* INITIAL COOKIE BANNER (Bottom Bar / Floating Card) */}
      {showBanner && !showModal && (
        <aside
          role="region"
          aria-label="Cookie consent"
          className="fixed bottom-0 inset-x-0 z-[9990] p-4 sm:p-6 bg-[#070A0E]/95 backdrop-blur-xl border-t border-[#C5A059]/25 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            {/* Banner Left: Icon & Narrative */}
            <div className="flex items-start gap-3.5 max-w-4xl">
              <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] shrink-0 mt-0.5">
                <Shield className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#F5F7FA] tracking-wide">
                  Your Privacy Matters
                </h3>
                <p className="text-xs text-[#A6B0BE] leading-relaxed">
                  Horizon Equity uses cookies and similar technologies to improve your experience, understand platform performance and maintain essential functionality. We never sell your personal financial data. Review our{" "}
                  <Link
                    href="/privacy"
                    className="text-[#C5A059] hover:underline underline-offset-2 transition-colors font-medium"
                  >
                    Privacy Policy
                  </Link>{" "}
                  for complete transparency.
                </p>
              </div>
            </div>

            {/* Banner Right: 3 Balanced Actions */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0 justify-end">
              <button
                type="button"
                onClick={openCustomizeModal}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-[#A6B0BE] hover:text-white bg-[#111821] hover:bg-[#182330] border border-white/10 transition-colors cursor-pointer w-full sm:w-auto"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Customize Preferences</span>
              </button>

              <button
                type="button"
                onClick={handleRejectOptional}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-medium text-[#A6B0BE] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer w-full sm:w-auto"
              >
                Reject Optional Cookies
              </button>

              <button
                type="button"
                onClick={handleAcceptAll}
                className="inline-flex items-center justify-center px-5 py-2 rounded-lg text-xs font-semibold text-[#070A0E] bg-gradient-to-r from-[#D4AF37] to-[#C5A059] hover:from-[#E5BE48] hover:to-[#D4AF37] shadow-lg shadow-[#C5A059]/20 transition-all cursor-pointer w-full sm:w-auto"
              >
                Accept All
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* DETAILED PREFERENCES MODAL */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-preferences-title"
          className="fixed inset-0 z-[9995] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            className="w-full max-w-2xl bg-[#0B0F14] border border-[#C5A059]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#070A0E]/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="cookie-preferences-title" className="text-base font-semibold text-white">
                    Cookie & Data Preferences
                  </h3>
                  <p className="text-xs text-[#7D8998]">
                    Control how Horizon Equity stores and processes browser information.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7D8998] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Category Cards */}
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Category 1: Essential (Strictly Required) */}
              <div className="p-4 rounded-xl bg-[#111821]/70 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">Essential Cookies</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#27C58B]/10 text-[#27C58B] border border-[#27C58B]/20">
                      <Lock className="w-2.5 h-2.5" />
                      Always Active
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#A6B0BE] leading-relaxed">
                  Strictly necessary for security, account authentication, session persistence, CSRF protection, and high-integrity financial operations. These cannot be disabled.
                </p>
              </div>

              {/* Category 2: Functional */}
              <div className="p-4 rounded-xl bg-[#111821]/70 border border-white/10 space-y-2 transition-colors hover:border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Functional Cookies</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={(e) =>
                        setPreferences((prev) => ({ ...prev, functional: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5.5 bg-[#1F2937] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#C5A059]"></div>
                  </label>
                </div>
                <p className="text-xs text-[#A6B0BE] leading-relaxed">
                  Enable enhanced functionality such as preserving language selections, personalized market view configurations, and interface ergonomics.
                </p>
              </div>

              {/* Category 3: Analytics & Performance */}
              <div className="p-4 rounded-xl bg-[#111821]/70 border border-white/10 space-y-2 transition-colors hover:border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Analytics & Performance</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        setPreferences((prev) => ({ ...prev, analytics: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5.5 bg-[#1F2937] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#C5A059]"></div>
                  </label>
                </div>
                <p className="text-xs text-[#A6B0BE] leading-relaxed">
                  Help us understand how investors interact with charts, calculators, and pages to diagnose latency, optimize server routes, and improve stability.
                </p>
              </div>

              {/* Category 4: Marketing & Outreach */}
              <div className="p-4 rounded-xl bg-[#111821]/70 border border-white/10 space-y-2 transition-colors hover:border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Marketing & Referral Attribution</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) =>
                        setPreferences((prev) => ({ ...prev, marketing: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5.5 bg-[#1F2937] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#C5A059]"></div>
                  </label>
                </div>
                <p className="text-xs text-[#A6B0BE] leading-relaxed">
                  Used exclusively to verify institutional referral campaign effectiveness and prevent fraudulent affiliate credit duplication.
                </p>
              </div>

              <div className="text-xs text-[#7D8998] pt-2 flex items-center justify-between">
                <span>Consent Version: 1.0</span>
                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-1 text-[#C5A059] hover:underline"
                >
                  <span>Read Privacy Policy</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-6 border-t border-white/10 bg-[#070A0E]/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRejectOptional}
                className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-medium text-[#A6B0BE] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              >
                Reject Optional
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#111821] hover:bg-[#182330] border border-white/15 transition-colors cursor-pointer"
                >
                  Save My Preferences
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold text-[#070A0E] bg-gradient-to-r from-[#D4AF37] to-[#C5A059] hover:from-[#E5BE48] hover:to-[#D4AF37] shadow-lg shadow-[#C5A059]/20 transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept All</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

