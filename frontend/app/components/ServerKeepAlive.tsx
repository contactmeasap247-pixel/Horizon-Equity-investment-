"use client";

import { useEffect, useRef } from "react";
import { warmUpBackend } from "@/lib/api";

const KEEPALIVE_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes (below 5m DB idle & 15m Render sleep)
const MIN_FOCUS_PING_GAP_MS = 45 * 1000; // 45 seconds minimum gap on tab focus

export default function ServerKeepAlive() {
  const lastPingRef = useRef<number>(0);

  useEffect(() => {
    const triggerPing = () => {
      const now = Date.now();
      if (now - lastPingRef.current < MIN_FOCUS_PING_GAP_MS) {
        return;
      }
      lastPingRef.current = now;
      warmUpBackend().catch(() => {});
    };

    // 1. Immediate pre-warm on initial app mount
    triggerPing();

    // 2. Periodic heartbeat while browser tab is open and visible
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        triggerPing();
      }
    }, KEEPALIVE_INTERVAL_MS);

    // 3. Re-warm immediately when user returns to tab or window regains focus
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        triggerPing();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
    };
  }, []);

  return null;
}

