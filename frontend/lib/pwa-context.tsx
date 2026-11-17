"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface PwaContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isIos: boolean;
  isStandalone: boolean;
  installModalOpen: boolean;
  promptInstall: () => Promise<boolean>;
  openInstallModal: () => void;
  closeInstallModal: () => void;
}

const PwaContext = createContext<PwaContextType>({
  isInstallable: false,
  isInstalled: false,
  isIos: false,
  isStandalone: false,
  installModalOpen: false,
  promptInstall: async () => false,
  openInstallModal: () => {},
  closeInstallModal: () => {},
});

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if running in Standalone / PWA mode
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    setIsStandalone(isStandaloneMode);
    if (isStandaloneMode) {
      setIsInstalled(true);
      try {
        localStorage.setItem("he_pwa_installed", "true");
      } catch {
        // ignore
      }
    } else {
      const previouslyInstalled = localStorage.getItem("he_pwa_installed") === "true";
      if (previouslyInstalled) {
        setIsInstalled(true);
      }
    }

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIos(isIosDevice);

    // Register Service Worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            // Check for updates
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                    // Update available
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.warn("[PWA] Service worker registration error:", error);
          });
      });
    }

    // Capture Native BeforeInstallPrompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Detect when user successfully installs the app
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsInstalled(true);
      try {
        localStorage.setItem("he_pwa_installed", "true");
        localStorage.removeItem("he_pwa_banner_dismissed_at");
      } catch {
        // ignore
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const openInstallModal = useCallback(() => {
    setInstallModalOpen(true);
  }, []);

  const closeInstallModal = useCallback(() => {
    setInstallModalOpen(false);
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
          setDeferredPrompt(null);
          setIsInstallable(false);
          try {
            localStorage.setItem("he_pwa_installed", "true");
          } catch {
            // ignore
          }
          return true;
        }
      } catch (err) {
        console.warn("[PWA] Install prompt error:", err);
      }
    }

    // Fallback: If no native deferred prompt, show guided instructions modal
    openInstallModal();
    return false;
  }, [deferredPrompt, openInstallModal]);

  return (
    <PwaContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isIos,
        isStandalone,
        installModalOpen,
        promptInstall,
        openInstallModal,
        closeInstallModal,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}

export function usePwa() {
  return useContext(PwaContext);
}

