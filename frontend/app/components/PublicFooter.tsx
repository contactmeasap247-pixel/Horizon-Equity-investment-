"use client";

import React from "react";
import Link from "next/link";
import BrandLogo from "./BrandLogo";
import { useLanguage } from "@/lib/language-context";

export default function PublicFooter() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#070A0E] text-[#A6B0BE] text-xs">
      <div className="container-page py-14 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Brand & Mission Column */}
          <div className="col-span-2 flex flex-col gap-4">
            <BrandLogo size="md" href="/" />
            <p className="text-xs text-[#7D8998] leading-relaxed max-w-sm mt-1">
              {t("footer_desc")}
            </p>

            <div className="inline-flex items-center gap-2 self-start px-2.5 py-1 rounded bg-[#111821] border border-white/10 text-[11px] text-[#27C58B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#27C58B] animate-pulse" />
              <span>{t("footer_cluster")}</span>
            </div>
          </div>

          {/* Investment Products */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#F5F7FA] font-mono">
              {t("footer_ecosystem")}
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs font-mono">
              <li>
                <Link href="/plans" className="hover:text-white transition-colors">
                  {t("nav_plans")}
                </Link>
              </li>
              <li>
                <Link href="/markets" className="hover:text-white transition-colors">
                  {t("nav_markets")}
                </Link>
              </li>
              <li>
                <Link href="/calculator" className="hover:text-white transition-colors">
                  {t("nav_calculator")}
                </Link>
              </li>
              <li>
                <Link href="/copy-trading" className="hover:text-white transition-colors">
                  {t("nav_copy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Asset Classes */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#F5F7FA] font-mono">
              {t("footer_markets")}
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li>
                <Link href="/markets" className="hover:text-white transition-colors">
                  {t("Precious Metals & Gold")}
                </Link>
              </li>
              <li>
                <Link href="/markets" className="hover:text-white transition-colors">
                  {t("Crypto (BTC / ETH / SOL)")}
                </Link>
              </li>
              <li>
                <Link href="/markets" className="hover:text-white transition-colors">
                  {t("Forex Hub (G10 Pairs)")}
                </Link>
              </li>
              <li>
                <Link href="/markets" className="hover:text-white transition-colors">
                  {t("Oil, Gas & Energy Futures")}
                </Link>
              </li>
              <li>
                <Link href="/markets" className="hover:text-white transition-colors">
                  {t("Real Estate Syndicates")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional Desks & Legal */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#F5F7FA] font-mono">
              {t("Desks & Legal")}
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  {t("Global Trading Desks")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  {t("Frequently Asked Questions")}
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-white transition-colors">
                  {t("Cold Vault Security")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  {t("Terms and Conditions")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  {t("Privacy & Data Security")}
                </Link>
              </li>
              <li>
                <Link href="/risk" className="hover:text-[#F16B75] transition-colors">
                  {t("Risk Disclosure")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer & Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-[#718096]">
          <div className="flex flex-wrap items-center gap-4">
            <p>© {currentYear} Horizon Equity Inc. {t("footer_rights")}</p>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <Link href="/terms" className="hover:text-white transition-colors">{t("Terms")}</Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-white transition-colors">{t("Privacy")}</Link>
              <span>•</span>
              <Link href="/risk" className="hover:text-white transition-colors">{t("Risk")}</Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-white transition-colors">{t("Contact")}</Link>
            </div>
          </div>
          <p className="text-[11px] leading-relaxed max-w-xl text-left md:text-right">
            {t("footer_disclaimer")}
          </p>
        </div>
      </div>
    </footer>
  );
}
