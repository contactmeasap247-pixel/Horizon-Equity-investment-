"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import BrandLogo from "./BrandLogo";
import LanguageSelector from "./LanguageSelector";
import { useLanguage } from "@/lib/language-context";

export default function PublicNav() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/markets", label: t("nav_markets") || "Markets" },
    { href: "/plans", label: t("nav_plans") || "Investment Plans" },
    { href: "/calculator", label: t("nav_calculator") || "Yield Calculator" },
    { href: "/copy-trading", label: t("nav_copy") || "Copy Trading" },
    { href: "/security", label: t("nav_governance") || "Security & Governance" },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? "bg-[#0B0F14]/90 backdrop-blur-md border-b border-white/10 shadow-sm"
          : "bg-[#0B0F14]/70 backdrop-blur-sm border-b border-white/5"
      }`}
    >
      <div className="container-page h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <BrandLogo size="md" href="/" />

        {/* Desktop Navigation Links */}
        <nav
          className="hidden lg:flex items-center gap-1 xl:gap-2"
          aria-label="Primary Navigation"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`px-3 py-1.5 rounded-md text-xs xl:text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[#F5F7FA] bg-white/[0.08]"
                    : "text-[#A6B0BE] hover:text-[#F5F7FA] hover:bg-white/[0.04]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <LanguageSelector compact />

          <Link
            href="/login"
            className="btn btn-ghost btn-sm text-[#A6B0BE] hover:text-[#F5F7FA]"
          >
            {t("nav_signin") || "Sign In"}
          </Link>

          <Link
            href="/register"
            className="btn btn-primary btn-sm font-semibold shadow-sm"
          >
            <span>{t("nav_open_account") || "Open Account"}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-2 sm:hidden">
          <LanguageSelector compact />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="p-2 rounded-md bg-[#151F2B] border border-white/10 text-[#A6B0BE] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4388F5]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav"
          className="lg:hidden border-b border-white/10 bg-[#0B0F14]/98 backdrop-blur-xl px-5 py-5 flex flex-col gap-3 animate-rise"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "text-[#F5F7FA] bg-[#4388F5]/15 font-semibold"
                      : "text-[#A6B0BE] hover:text-[#F5F7FA] hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
            <Link
              href="/login"
              className="btn btn-secondary w-full justify-center text-sm font-semibold"
            >
              {t("nav_signin") || "Sign In"}
            </Link>
            <Link
              href="/register"
              className="btn btn-primary w-full justify-center text-sm font-semibold"
            >
              <span>{t("nav_open_account") || "Open Account"}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
