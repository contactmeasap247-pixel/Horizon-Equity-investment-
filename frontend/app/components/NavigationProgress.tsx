"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function NavigationProgressContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Complete the progress bar when the route resolves
  useEffect(() => {
    if (isNavigating) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams, isNavigating]);

  // Intercept click on internal links to trigger the progress bar immediately
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("#") &&
        target.target !== "_blank" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        const currentUrl = window.location.pathname + window.location.search;
        if (href !== currentUrl) {
          setIsNavigating(true);
          setProgress(25);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, true);
    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, []);

  // Animate progress smoothly while navigating
  useEffect(() => {
    if (!isNavigating) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 70) return prev + Math.random() * 15;
        if (prev < 90) return prev + Math.random() * 5;
        return prev;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isNavigating]);

  if (!isNavigating && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none transition-opacity duration-300"
      style={{ opacity: isNavigating || progress > 0 ? 1 : 0 }}
      aria-hidden="true"
    >
      {/* Top glowing progress bar */}
      <div
        className="h-[3px] bg-gradient-to-r from-[#4388F5] via-[#5A9AFF] to-[#27C58B] transition-all duration-200 ease-out shadow-[0_0_12px_rgba(67,136,245,0.85)]"
        style={{
          width: `${progress}%`,
        }}
      />
      {/* Glowing light pulse at head */}
      <div
        className="absolute top-0 h-[3px] w-24 bg-white/50 blur-[2px] transition-all duration-200"
        style={{
          left: `calc(${progress}% - 96px)`,
        }}
      />
    </div>
  );
}

export default function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressContent />
    </Suspense>
  );
}
