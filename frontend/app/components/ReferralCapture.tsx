"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ReferralCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      const ref =
        searchParams.get("ref") ||
        searchParams.get("referral") ||
        searchParams.get("referral_code") ||
        searchParams.get("r");

      if (ref && ref.trim()) {
        const cleanRef = ref.trim().toUpperCase();
        // Persist in localStorage for cross-page navigation persistence
        localStorage.setItem("he_referral_code", cleanRef);
        // Persist in cookie (30 days)
        document.cookie = `he_referral_code=${encodeURIComponent(cleanRef)}; path=/; max-age=2592000; SameSite=Lax`;
      }
    } catch {
      // Ignore client-side storage access errors in restricted modes
    }
  }, [searchParams]);

  return null;
}
