"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { SUPPORTED_LANGUAGES } from "@/lib/translations";

interface LanguageSelectorProps {
  compact?: boolean;
}

export default function LanguageSelector({ compact = false }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { lang, setLang, currentMeta } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select Language"
        className="inline-flex items-center gap-2 h-9 px-2.5 rounded-md bg-[#111821] border border-white/10 text-xs font-medium text-[#F5F7FA] hover:bg-[#151F2B] hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4388F5] transition-colors cursor-pointer"
      >
        <span className="text-sm leading-none" aria-hidden="true">{currentMeta.flag}</span>
        {!compact && <span className="hidden sm:inline font-medium">{currentMeta.label}</span>}
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#7D8998] transition-transform duration-150 ${isOpen ? "rotate-180 text-[#F5F7FA]" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Languages"
          className="absolute right-0 mt-1.5 w-48 rounded-md bg-[#151F2B] border border-white/10 p-1.5 shadow-2xl z-50 animate-rise"
        >
          <div className="px-2 py-1 text-[10px] font-semibold tracking-wider uppercase text-[#7D8998]">
            Interface Language
          </div>
          <div className="flex flex-col gap-0.5 mt-0.5 max-h-64 overflow-y-auto">
            {SUPPORTED_LANGUAGES.map((item) => {
              const isSelected = item.code === lang;
              return (
                <button
                  type="button"
                  key={item.code}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setLang(item.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-colors text-left cursor-pointer ${
                    isSelected
                      ? "bg-[#4388F5]/15 text-[#F5F7FA] font-semibold"
                      : "text-[#A6B0BE] hover:text-[#F5F7FA] hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm" aria-hidden="true">{item.flag}</span>
                    <span>{item.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#4388F5]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
