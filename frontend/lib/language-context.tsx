"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { LanguageCode, translations, SUPPORTED_LANGUAGES, LanguageMeta } from "./translations";
import { translatePhrase } from "./i18n/phrases";
import { api } from "./api";
import { useAuthStore } from "./auth-store";

interface LanguageContextType {
  lang: LanguageCode;
  setLang: (code: LanguageCode) => void;
  t: (keyOrPhrase: string) => string;
  currentMeta: LanguageMeta;
  dir: "ltr" | "rtl";
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (value: number, currency?: string) => string;
  formatDate: (value: string | number | Date, options?: Intl.DateTimeFormatOptions) => string;
}

const STORAGE_KEY = "horizon_preferred_lang";
const EXPLICIT_SESSION_KEY = "horizon_explicit_lang";

const KEY_ALIASES: Record<string, string[]> = {
  auth_back_home: ["nav_back_home"],
  auth_login_title: ["auth_signin_title"],
  auth_login_sub: ["auth_signin_subtitle"],
  auth_email: ["auth_email_label", "auth_email_req_label"],
  auth_password: ["auth_password_label"],
  auth_password_min: ["auth_password_req_label"],
  auth_sign_in_btn: ["auth_signin_btn"],
  auth_signing_in: ["auth_authenticating"],
  auth_no_account: ["auth_no_account"],
  auth_open_account: ["nav_open_account", "auth_register_title"],
  auth_register_title: ["auth_register_title"],
  auth_register_sub: ["auth_register_subtitle"],
  auth_full_name: ["auth_fullname_label"],
  auth_referral: ["auth_referral_label"],
  auth_agree_terms: ["auth_terms_prefix"],
  auth_complete_reg: ["auth_register_btn"],
};

function isValidLang(code: unknown): code is LanguageCode {
  return typeof code === "string" && Object.prototype.hasOwnProperty.call(translations, code);
}

function readStoredLang(): LanguageCode {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isValidLang(saved)) return saved;

    const cookieMatch = document.cookie.match(/(?:^|;\s*)horizon_preferred_lang=([^;]+)/);
    if (cookieMatch && isValidLang(cookieMatch[1])) {
      return cookieMatch[1];
    }
  } catch {
    // ignore storage errors
  }
  return "en";
}

function persistLangToBrowser(code: LanguageCode) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, code);
    document.cookie = `${STORAGE_KEY}=${code}; path=/; max-age=31536000; SameSite=Lax`;
    const meta = SUPPORTED_LANGUAGES.find((l) => l.code === code);
    document.documentElement.lang = code;
    document.documentElement.dir = meta?.dir || "ltr";
  } catch {
    // ignore storage errors
  }
}

interface CustomTextNode extends Text {
  __heOrigText?: string;
  __heLastLang?: LanguageCode;
}

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA", "SVG"]);

function shouldSkipText(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 2) return true;
  // Skip pure numbers, prices, percentages, crypto hashes, emails, or URLs
  if (/^[$€£¥+\-0-9.,%\s/:•·→←]+$/.test(trimmed)) return true;
  if (/^(0x[a-fA-F0-9]{10,}|[13bc1][a-zA-HJ-NP-Z0-9]{20,}|T[a-zA-Z0-9]{25,})$/.test(trimmed)) return true;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return true;
  if (/^HE-[A-Z0-9]+$/.test(trimmed)) return true;
  return false;
}

function applyDomLocalization(root: Node, lang: LanguageCode) {
  if (typeof document === "undefined") return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.closest("[data-no-translate='true']")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let current: Node | null = walker.nextNode();
  while (current) {
    const textNode = current as CustomTextNode;
    const currentVal = textNode.nodeValue || "";

    // Capture original English text before first translation or if React updated the node
    if (textNode.__heOrigText === undefined) {
      if (!shouldSkipText(currentVal)) {
        textNode.__heOrigText = currentVal;
      }
    } else if (textNode.__heLastLang && currentVal !== translatePhrase(textNode.__heOrigText, textNode.__heLastLang)) {
      // React updated the underlying text node content dynamically
      textNode.__heOrigText = currentVal;
    }

    const orig = textNode.__heOrigText;
    if (orig && !shouldSkipText(orig)) {
      const nextVal = lang === "en" ? orig : translatePhrase(orig, lang);
      if (textNode.nodeValue !== nextVal) {
        textNode.nodeValue = nextVal;
      }
      textNode.__heLastLang = lang;
    }

    current = walker.nextNode();
  }

  // Also localize input placeholders and aria-labels
  if (root instanceof Element || root instanceof Document) {
    const elements = (root as ParentNode).querySelectorAll?.("[placeholder], [title]") || [];
    elements.forEach((el) => {
      if (el.closest("[data-no-translate='true']")) return;

      const placeholder = el.getAttribute("placeholder");
      if (placeholder) {
        const origPlaceholder = el.getAttribute("data-he-orig-placeholder") || placeholder;
        if (!el.hasAttribute("data-he-orig-placeholder")) {
          el.setAttribute("data-he-orig-placeholder", origPlaceholder);
        }
        const nextPlaceholder = lang === "en" ? origPlaceholder : translatePhrase(origPlaceholder, lang);
        if (placeholder !== nextPlaceholder) {
          el.setAttribute("placeholder", nextPlaceholder);
        }
      }

      const titleAttr = el.getAttribute("title");
      if (titleAttr) {
        const origTitle = el.getAttribute("data-he-orig-title") || titleAttr;
        if (!el.hasAttribute("data-he-orig-title")) {
          el.setAttribute("data-he-orig-title", origTitle);
        }
        const nextTitle = lang === "en" ? origTitle : translatePhrase(origTitle, lang);
        if (titleAttr !== nextTitle) {
          el.setAttribute("title", nextTitle);
        }
      }
    });
  }
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
  currentMeta: SUPPORTED_LANGUAGES[0],
  dir: "ltr",
  formatNumber: (v) => String(v),
  formatCurrency: (v) => `$${v.toFixed(2)}`,
  formatDate: (v) => new Date(v).toLocaleDateString(),
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>("en");
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const syncedUserRef = useRef<string | null>(null);

  // 1. Restore saved language immediately on client hydration
  useEffect(() => {
    const initial = readStoredLang();
    setLangState(initial);
    persistLangToBrowser(initial);
  }, []);

  // 2. Synchronize with authenticated user's profile preference without overriding an explicit session choice
  useEffect(() => {
    if (!user) {
      syncedUserRef.current = null;
      return;
    }
    if (syncedUserRef.current === user.id) return;
    syncedUserRef.current = user.id;

    const explicitSessionLang =
      typeof window !== "undefined" ? sessionStorage.getItem(EXPLICIT_SESSION_KEY) : null;
    const profileLang = (user as { preferred_language?: string }).preferred_language;

    if (isValidLang(explicitSessionLang)) {
      // User explicitly chose a language in this browser session — keep it and sync to profile
      if (profileLang !== explicitSessionLang) {
        api.put("/users/profile", { preferred_language: explicitSessionLang }).catch(() => {});
      }
    } else if (isValidLang(profileLang) && profileLang !== lang) {
      // Apply user's saved account language only if no local preference was explicitly set
      const storedLocal = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (!isValidLang(storedLocal)) {
        setLangState(profileLang);
        persistLangToBrowser(profileLang);
      } else if (storedLocal !== profileLang) {
        api.put("/users/profile", { preferred_language: storedLocal }).catch(() => {});
      }
    }
  }, [user, lang]);

  const setLang = useCallback(
    (code: LanguageCode) => {
      if (!isValidLang(code)) return;
      setLangState(code);
      persistLangToBrowser(code);
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(EXPLICIT_SESSION_KEY, code);
        } catch {
          // ignore
        }
      }
      // Persist to authenticated user profile in background
      if (user) {
        api.put("/users/profile", { preferred_language: code }).catch(() => {});
      }
    },
    [user]
  );

  // 3. Apply DOM localization across all routes and dynamic mutations
  useEffect(() => {
    if (typeof document === "undefined") return;

    let rafId: number | null = null;
    const runPass = () => {
      if (document.body) {
        applyDomLocalization(document.body, lang);
      }
    };

    runPass();
    const timer = window.setTimeout(runPass, 120);

    const observer = new MutationObserver(() => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(runPass);
    });

    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      window.clearTimeout(timer);
      if (rafId !== null) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [lang, pathname]);

  const currentMeta = SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];
  const dir = currentMeta.dir || "ltr";

  const t = useCallback(
    (keyOrPhrase: string): string => {
      if (!keyOrPhrase) return "";
      const dictHit = translations[lang]?.[keyOrPhrase];
      if (dictHit) return dictHit;

      const aliases = KEY_ALIASES[keyOrPhrase];
      if (aliases) {
        for (const alias of aliases) {
          const aliasHit = translations[lang]?.[alias];
          if (aliasHit) return aliasHit;
        }
      }

      const enHit = translations.en[keyOrPhrase];
      if (enHit) {
        return lang === "en" ? enHit : translatePhrase(enHit, lang);
      }

      if (aliases) {
        for (const alias of aliases) {
          const enAliasHit = translations.en[alias];
          if (enAliasHit) {
            return lang === "en" ? enAliasHit : translatePhrase(enAliasHit, lang);
          }
        }
      }

      if (!keyOrPhrase.includes("_")) {
        return lang === "en" ? keyOrPhrase : translatePhrase(keyOrPhrase, lang);
      }

      const humanized = keyOrPhrase
        .replace(/^(auth|nav|dash|admin|settings|footer)_/, "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return lang === "en" ? humanized : translatePhrase(humanized, lang);
    },
    [lang]
  );

  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions): string => {
      try {
        return new Intl.NumberFormat(currentMeta.locale, options).format(value);
      } catch {
        return String(value);
      }
    },
    [currentMeta.locale]
  );

  const formatCurrency = useCallback(
    (value: number, currency = "USD"): string => {
      try {
        return new Intl.NumberFormat(currentMeta.locale, {
          style: "currency",
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
      } catch {
        return `$${value.toFixed(2)}`;
      }
    },
    [currentMeta.locale]
  );

  const formatDate = useCallback(
    (value: string | number | Date, options?: Intl.DateTimeFormatOptions): string => {
      try {
        const d = value instanceof Date ? value : new Date(value);
        if (isNaN(d.getTime())) return String(value);
        return new Intl.DateTimeFormat(currentMeta.locale, options).format(d);
      } catch {
        return String(value);
      }
    },
    [currentMeta.locale]
  );

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t,
        currentMeta,
        dir,
        formatNumber,
        formatCurrency,
        formatDate,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
