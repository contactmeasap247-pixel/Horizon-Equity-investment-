"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Headphones, X, Mail, Sparkles } from "lucide-react";
import { SupportWidgetConfig, SupportChannel } from "./FloatingSupportWidget";
import { getStoredConsent } from "@/lib/cookie-consent";

interface ProactiveSupportPopupProps {
  config: SupportWidgetConfig;
  launcherOpen: boolean;
  activePosition?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  activeOffsetX?: number;
  activeOffsetY?: number;
}

// Platform Telegram SVG Icon
function TelegramBrandIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.784-.962 4.129-1.36 5.865-.168.734-.438.98-.698 1.004-.567.052-1-.375-1.55-.735-.86-.563-1.347-.913-2.181-1.463-.965-.635-.34-.984.21-1.554.144-.15 2.645-2.424 2.693-2.632.006-.026.012-.124-.047-.176-.059-.052-.145-.034-.208-.02-.089.02-1.503.955-4.244 2.806-.402.276-.766.411-1.092.404-.36-.008-1.053-.204-1.568-.372-.633-.206-1.137-.315-1.093-.665.023-.183.272-.37 0.748-.563 2.928-1.275 4.88-2.115 5.856-2.52 2.787-1.156 3.366-1.357 3.744-1.363.083-.001.268.02.388.118.101.082.13.193.143.27.014.077.031.252.017.391z" />
    </svg>
  );
}

export default function ProactiveSupportPopup({
  config,
  launcherOpen,
  activePosition = "bottom-right",
  activeOffsetX = 24,
  activeOffsetY = 24,
}: ProactiveSupportPopupProps) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [cookieConsentChecked, setCookieConsentChecked] = useState(false);

  // Monitor cookie consent status
  useEffect(() => {
    const checkConsent = () => {
      setCookieConsentChecked(Boolean(getStoredConsent()));
    };
    checkConsent();
    window.addEventListener("cookie-consent-updated", checkConsent);
    return () => window.removeEventListener("cookie-consent-updated", checkConsent);
  }, []);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Resolve Telegram Channel from centralized configuration
  const telegramChannel = useMemo<SupportChannel | null>(() => {
    if (!config.channels || !Array.isArray(config.channels)) return null;
    const tg = config.channels.find(
      (c) => c.enabled && c.type.toLowerCase().trim() === "telegram" && c.value && c.value.trim() !== ""
    );
    return tg || null;
  }, [config.channels]);

  // Resolve Email Channel from centralized configuration
  const emailChannel = useMemo<SupportChannel | null>(() => {
    if (!config.channels || !Array.isArray(config.channels)) return null;
    const em = config.channels.find(
      (c) => c.enabled && c.type.toLowerCase().trim() === "email" && c.value && c.value.trim() !== ""
    );
    return em || null;
  }, [config.channels]);

  // Construct valid Telegram destination URL
  const telegramUrl = useMemo<string | null>(() => {
    if (!telegramChannel) return null;
    const val = telegramChannel.value.trim();
    if (val.startsWith("http://") || val.startsWith("https://")) {
      return val;
    }
    const cleanUser = val.replace("@", "").trim();
    return cleanUser ? `https://t.me/${cleanUser}` : null;
  }, [telegramChannel]);

  // Construct valid Email mailto URL
  const emailMailto = useMemo<string | null>(() => {
    if (!emailChannel) return null;
    const val = emailChannel.value.trim();
    const subject = encodeURIComponent("Horizon Equity Support Request");
    return `mailto:${val}?subject=${subject}`;
  }, [emailChannel]);

  // Determine if popup should display based on route, settings, and cooldown
  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    // 0. Do not clash with initial Cookie Consent banner if not yet handled
    if (!cookieConsentChecked) {
      setVisible(false);
      return;
    }

    // 1. Master enable checks
    const proactiveEnabled = config.proactive_enabled !== false;
    if (!config.enabled || !proactiveEnabled) {
      setVisible(false);
      return;
    }

    // 2. Viewport visibility checks
    if (isMobile && config.proactive_show_on_mobile === false) {
      setVisible(false);
      return;
    }
    if (!isMobile && config.proactive_show_on_desktop === false) {
      setVisible(false);
      return;
    }

    // 3. Excluded Page Filtering
    const isExcluded =
      pathname?.startsWith("/dashboard/admin") ||
      pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/forgot-password" ||
      pathname === "/reset-password" ||
      pathname === "/verify-email" ||
      pathname === "/dashboard/deposits" ||
      pathname === "/dashboard/withdrawals" ||
      pathname?.startsWith("/dashboard/transactions/receipt") ||
      pathname === "/verify-receipt";

    if (isExcluded) {
      setVisible(false);
      return;
    }

    // 4. Visibility Scope Filtering
    const isDashboard = pathname?.startsWith("/dashboard");
    if (config.visibility_scope === "primary" && !isDashboard) {
      setVisible(false);
      return;
    }
    if (config.visibility_scope === "secondary" && isDashboard) {
      setVisible(false);
      return;
    }

    // 5. Must have at least one valid active destination
    const showTelegram = config.proactive_show_telegram !== false && Boolean(telegramUrl);
    const showEmail = config.proactive_show_email !== false && Boolean(emailMailto);
    if (!showTelegram && !showEmail) {
      setVisible(false);
      return;
    }

    // 6. Suppression if user already contacted or opened support during this session
    try {
      const contactedInSession = sessionStorage.getItem("he_support_contacted_session") === "true";
      if (contactedInSession) {
        setVisible(false);
        return;
      }
    } catch {
      // ignore
    }

    // 7. Session dismissal check: Do not show repeatedly on every internal page navigation
    try {
      const dismissedInSession = sessionStorage.getItem("he_proactive_dismissed_session") === "true";
      if (dismissedInSession) {
        setVisible(false);
        return;
      }
    } catch {
      // ignore
    }

    // 8. Cooldown check across visits (localStorage)
    const cooldownHours = config.proactive_cooldown_hours ?? 24;
    try {
      const dismissedAt = localStorage.getItem("he_proactive_dismissed_at");
      if (dismissedAt) {
        const diffMs = Date.now() - parseInt(dismissedAt, 10);
        const hoursPassed = diffMs / (1000 * 60 * 60);
        if (hoursPassed < cooldownHours) {
          setVisible(false);
          return;
        }
      }
    } catch {
      // ignore
    }

    // 9. Countdown Timer: Wait approximately 8-12 seconds (configured delay)
    // Delay starts after the visitor enters and page finishes initial render
    const delaySec = Math.max(5, Math.min(60, config.proactive_delay_seconds ?? 10));
    const delayMs = delaySec * 1000;

    const timer = setTimeout(() => {
      // Re-verify that user didn't open launcher or contact support during countdown
      try {
        if (sessionStorage.getItem("he_support_contacted_session") === "true") return;
        if (sessionStorage.getItem("he_proactive_dismissed_session") === "true") return;
      } catch {
        // ignore
      }

      setVisible(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [
    pathname,
    config,
    isMobile,
    telegramUrl,
    emailMailto,
    cookieConsentChecked,
  ]);

  // Listen for support interaction events (e.g. user clicked floating launcher or contacted desk)
  useEffect(() => {
    const handleSupportContacted = () => {
      setVisible(false);
      try {
        sessionStorage.setItem("he_support_contacted_session", "true");
      } catch {
        // ignore
      }
    };

    window.addEventListener("support-channel-contacted", handleSupportContacted);
    return () => window.removeEventListener("support-channel-contacted", handleSupportContacted);
  }, []);

  // Suppress popup if the full floating support launcher is currently expanded
  useEffect(() => {
    if (launcherOpen && visible) {
      setVisible(false);
    }
  }, [launcherOpen, visible]);

  // Close / Dismiss action with persistent cooldown
  const handleDismiss = useCallback(() => {
    setVisible(false);
    try {
      sessionStorage.setItem("he_proactive_dismissed_session", "true");
      localStorage.setItem("he_proactive_dismissed_at", Date.now().toString());
    } catch {
      // ignore
    }
  }, []);

  // Telegram Click Handler: Opens exact configured Telegram account in new tab
  const handleTelegramClick = useCallback(() => {
    if (!telegramUrl) return;
    try {
      sessionStorage.setItem("he_support_contacted_session", "true");
    } catch {
      // ignore
    }
    setVisible(false);
    window.open(telegramUrl, "_blank", "noopener,noreferrer");
  }, [telegramUrl]);

  // Email Click Handler: Opens default mail application
  const handleEmailClick = useCallback(() => {
    if (!emailMailto) return;
    try {
      sessionStorage.setItem("he_support_contacted_session", "true");
    } catch {
      // ignore
    }
    setVisible(false);
    window.location.href = emailMailto;
  }, [emailMailto]);

  if (!mounted || !visible) return null;

  const showTelegram = config.proactive_show_telegram !== false && Boolean(telegramUrl);
  const showEmail = config.proactive_show_email !== false && Boolean(emailMailto);

  // Position docked directly above or adjacent to the floating support button
  const getPopupStyle = (): React.CSSProperties => {
    if (isMobile) {
      return {
        position: "fixed",
        bottom: `${activeOffsetY + 68}px`,
        left: "16px",
        right: "16px",
        zIndex: 9998,
      };
    }

    const style: React.CSSProperties = {
      position: "fixed",
      zIndex: 9998,
      maxWidth: "360px",
      width: "100%",
    };

    if (activePosition === "bottom-right") {
      style.bottom = `${activeOffsetY + 68}px`;
      style.right = `${activeOffsetX}px`;
    } else if (activePosition === "bottom-left") {
      style.bottom = `${activeOffsetY + 68}px`;
      style.left = `${activeOffsetX}px`;
    } else if (activePosition === "top-right") {
      style.top = `${activeOffsetY + 68}px`;
      style.right = `${activeOffsetX}px`;
    } else if (activePosition === "top-left") {
      style.top = `${activeOffsetY + 68}px`;
      style.left = `${activeOffsetX}px`;
    }

    return style;
  };

  const headingText = config.proactive_heading || "Need Assistance?";
  const descriptionText =
    config.proactive_description ||
    "Have questions about Horizon Equity? Our support team is available to help you. Reach out to us and we'll be happy to assist.";

  return (
    <aside
      role="dialog"
      aria-labelledby="proactive-support-title"
      aria-describedby="proactive-support-desc"
      style={getPopupStyle()}
      className="animate-in fade-in slide-in-from-bottom-3 duration-300 pointer-events-auto"
    >
      <div className="relative rounded-2xl bg-[#0B0F14]/98 backdrop-blur-xl border border-[#C5A059]/30 p-5 shadow-2xl shadow-black/80 text-white overflow-hidden ring-1 ring-white/5">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent opacity-60" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss assistance invitation"
          className="absolute top-3.5 right-3.5 h-6 w-6 rounded-lg bg-white/5 hover:bg-white/10 text-[#7D8998] hover:text-white flex items-center justify-center transition border border-white/5 cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Header & Status Indicator */}
        <div className="flex items-center gap-3 pr-6 mb-2.5">
          <div className="relative">
            <div className="h-9 w-9 rounded-xl bg-[#111821] border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] shadow-inner">
              <Headphones className="h-4.5 w-4.5" />
            </div>
            {/* Live Online Beacon */}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#27C58B] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#27C58B] border border-[#0B0F14]" />
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 id="proactive-support-title" className="text-sm font-bold text-white tracking-tight">
                {headingText}
              </h4>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-[#27C58B]/10 text-[#27C58B] border border-[#27C58B]/30 uppercase tracking-wider">
                Online
              </span>
            </div>
            <span className="text-[10px] text-[#C5A059] font-medium flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 inline" /> Priority Concierge Desk
            </span>
          </div>
        </div>

        {/* Invitation Narrative */}
        <p id="proactive-support-desc" className="text-xs text-[#A6B0BE] leading-relaxed mb-4">
          {descriptionText}
        </p>

        {/* Contact Action Buttons */}
        <div className="flex flex-col gap-2">
          {/* PRIMARY ACTION: Telegram (Strong Visual Priority) */}
          {showTelegram && (
            <button
              type="button"
              onClick={handleTelegramClick}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-[#229ED9] to-[#0088CC] hover:from-[#2BA9E5] hover:to-[#0094DE] shadow-lg shadow-[#0088CC]/25 hover:shadow-[#0088CC]/40 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <TelegramBrandIcon className="h-4 w-4" />
              <span>Chat with us on Telegram</span>
            </button>
          )}

          {/* SECONDARY ACTION: Email */}
          {showEmail && (
            <button
              type="button"
              onClick={handleEmailClick}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-[#A6B0BE] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            >
              <Mail className="h-3.5 w-3.5 text-[#C5A059]" />
              <span>Contact us via Email</span>
            </button>
          )}
        </div>

        {/* Subtle Dismiss Link */}
        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-[#64748B]">
          <span>Encrypted Client Support</span>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-[#7D8998] hover:text-[#A6B0BE] transition-colors cursor-pointer"
          >
            Maybe later
          </button>
        </div>
      </div>
    </aside>
  );
}
