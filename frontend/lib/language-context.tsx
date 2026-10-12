"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { LanguageCode, translations, SUPPORTED_LANGUAGES, LanguageMeta } from "./translations";

interface LanguageContextType {
  lang: LanguageCode;
  setLang: (code: LanguageCode) => void;
  t: (key: string) => string;
  currentMeta: LanguageMeta;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
  currentMeta: SUPPORTED_LANGUAGES[0],
  dir: "ltr",
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>("en");

  useEffect(() => {
    const saved = localStorage.getItem("horizon_preferred_lang") as LanguageCode;
    if (saved && translations[saved]) {
      setLangState(saved);
    }
  }, []);

  const setLang = (code: LanguageCode) => {
    if (translations[code]) {
      setLangState(code);
      localStorage.setItem("horizon_preferred_lang", code);
      const meta = SUPPORTED_LANGUAGES.find((l) => l.code === code);
      if (typeof document !== "undefined") {
        document.documentElement.lang = code;
        document.documentElement.dir = meta?.dir || "ltr";
      }
    }
  };

  const currentMeta = SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];
  const dir = currentMeta.dir || "ltr";

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, currentMeta, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
