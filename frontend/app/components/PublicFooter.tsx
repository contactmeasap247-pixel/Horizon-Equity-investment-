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
              {t("footer_desc") ||
                "Horizon Equity delivers institutional-grade multi-asset allocation, algorithmic yield strategies, and deep liquidity across digital currencies, equities, and sovereign debt."}
            </p>

            <div className="inline-flex items-center gap-2 self-start px-2.5 py-1 rounded bg-[#111821] border border-white/10 text-[11px] text-[#27C58B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#27C58B] animate-pulse" />
              <span>{t("footer_cluster") || "Core Systems Operational • 100% Uptime"}</span>
            </div>
          </div>

          {/* Investment Products */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#F5F7FA]">
              {t("footer_ecosystem") || "Products"}
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li>
                <Link href="/plans" className="hover:text-white transition-colors">
                  {t("nav_plans") || "Investment Plans"}
                </Link>
              </li>
              <li>
                <Link href="/markets" className="hover:text-white transition-colors">
                  {t("nav_markets") || "Markets & Liquidity"}
                </Link>
              </li>
              <li>
                <Link href="/calculator" className="hover:text-white transition-colors">
                  {t("nav_calculator") || "Yield Simulator"}
                </Link>
              </li>
              <li>
                <Link href="/copy-trading" className="hover:text-white transition-colors">
                  {t("nav_copy") || "Copy Trading Network"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Asset Classes */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#F5F7FA]">
              {t("footer_markets") || "Asset Classes"}
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li>
                <Link href="/markets" className="hover:text-white transition-colors">
                  Digital Assets (BTC / ETH / SOL)
                </Link>
              </li>
              <li>
                <Link href="/markets" className="hover:text-white transition-colors">
                  Global Indices (S&amp;P 500)
                </Link>
              </li>
              <li>
                <Link href="/markets" className="hover:text-white transition-colors">
                  Precious Metals &amp; Spot Gold
                </Link>
              </li>
              <li>
                <Link href="/markets" className="hover:text-white transition-colors">
                  G10 Forex Liquidity
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional Governance */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#F5F7FA]">
              {t("footer_governance") || "Governance"}
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li>
                <Link href="/security" className="hover:text-white transition-colors">
                  Cold Vault Architecture
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  {t("nav_signin") || "Client Sign In"}
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  {t("nav_open_account") || "Open Account"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer & Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-[#7D8998]">
          <p>© {currentYear} Horizon Equity Inc. {t("footer_rights") || "All rights reserved."}</p>
          <p className="text-[11px] leading-relaxed max-w-xl text-left md:text-right">
            {t("footer_disclaimer") ||
              "Risk Disclosure: Multi-asset digital investments carry volatility and risk of capital loss. Past algorithmic performance does not guarantee future results. Capital accounts are segregated in multi-signature cold storage custody."}
          </p>
        </div>
      </div>
    </footer>
  );
}
