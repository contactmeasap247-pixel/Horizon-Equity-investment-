// ============================================
// HORIZON EQUITY - COOKIE CONSENT MANAGEMENT LOGIC
// Compliant, persistent, and category-aware consent system
// ============================================

export type CookieCategory = "essential" | "functional" | "analytics" | "marketing";

export interface CookiePreferences {
  essential: true; // Always active
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface CookieConsentRecord {
  version: string;
  timestamp: string;
  categories: CookiePreferences;
}

export const CURRENT_COOKIE_VERSION = "1.0";
export const COOKIE_STORAGE_KEY = "he_cookie_consent_v1";

export function getStoredConsent(): CookieConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (!raw) return null;
    const parsed: CookieConsentRecord = JSON.parse(raw);
    // If version changed, mandate new consent
    if (parsed.version !== CURRENT_COOKIE_VERSION) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveConsentRecord(prefs: Omit<CookiePreferences, "essential">): CookieConsentRecord {
  const record: CookieConsentRecord = {
    version: CURRENT_COOKIE_VERSION,
    timestamp: new Date().toISOString(),
    categories: {
      essential: true,
      functional: Boolean(prefs.functional),
      analytics: Boolean(prefs.analytics),
      marketing: Boolean(prefs.marketing),
    },
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(record));
      window.dispatchEvent(new CustomEvent("cookie-consent-updated", { detail: record }));
    } catch {
      // ignore
    }
  }

  return record;
}

export function hasCookieConsent(category: CookieCategory): boolean {
  if (category === "essential") return true;
  const stored = getStoredConsent();
  if (!stored) return false;
  return Boolean(stored.categories[category]);
}

export function triggerOpenCookiePreferences(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-cookie-preferences"));
  }
}

