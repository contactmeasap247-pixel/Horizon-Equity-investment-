"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { MarketItem } from "@/lib/use-market-prices";

interface MarketTickerProps {
  items: MarketItem[];
  isStale?: boolean;
}

export default function MarketTicker({ items, isStale }: MarketTickerProps) {
  const { t } = useLanguage();

  // If no items loaded yet, provide baseline initial items
  const fallbackItems: MarketItem[] = [
    { symbol: "BTC/USD", name: "Bitcoin", price: "$77,464.02", rawPrice: 77464.02, change: "+0.91%", up: true, volume: "$1.8B", marketType: "crypto", marketStatus: "open", quoteType: "realtime", timestamp: "", currency: "USD" },
    { symbol: "ETH/USD", name: "Ethereum", price: "$2,251.23", rawPrice: 2251.23, change: "+0.71%", up: true, volume: "$820M", marketType: "crypto", marketStatus: "open", quoteType: "realtime", timestamp: "", currency: "USD" },
    { symbol: "SOL/USD", name: "Solana", price: "$95.68", rawPrice: 95.68, change: "+0.65%", up: true, volume: "$460M", marketType: "crypto", marketStatus: "open", quoteType: "realtime", timestamp: "", currency: "USD" },
    { symbol: "GOLD", name: "Spot Gold (XAU)", price: "$3,898.90", rawPrice: 3898.9, change: "-3.29%", up: false, volume: "$720M", marketType: "commodity", marketStatus: "open", quoteType: "realtime", timestamp: "", currency: "USD" },
    { symbol: "SILVER", name: "Spot Silver (XAG)", price: "$49.28", rawPrice: 49.28, change: "-5.59%", up: false, volume: "$240M", marketType: "commodity", marketStatus: "open", quoteType: "delayed", timestamp: "", currency: "USD" },
    { symbol: "SPX", name: "S&P 500 Index", price: "7,580.07", rawPrice: 7580.07, change: "-2.12%", up: false, volume: "$4.2B", marketType: "index", marketStatus: "closed", quoteType: "close", timestamp: "", currency: "USD" },
    { symbol: "AAPL", name: "Apple Inc.", price: "$344.63", rawPrice: 344.63, change: "+0.23%", up: true, volume: "$980M", marketType: "stock", marketStatus: "closed", quoteType: "close", timestamp: "", currency: "USD" },
    { symbol: "TSLA", name: "Tesla Inc.", price: "$399.81", rawPrice: 399.81, change: "-1.09%", up: false, volume: "$890M", marketType: "stock", marketStatus: "closed", quoteType: "close", timestamp: "", currency: "USD" },
    { symbol: "NVDA", name: "Nvidia Corp.", price: "$204.64", rawPrice: 204.64, change: "-4.99%", up: false, volume: "$1.4B", marketType: "stock", marketStatus: "closed", quoteType: "close", timestamp: "", currency: "USD" },
    { symbol: "EUR/USD", name: "Euro / US Dollar", price: "1.1166", rawPrice: 1.1166, change: "+0.15%", up: true, volume: "$4.8B", marketType: "forex", marketStatus: "closed", quoteType: "reference", timestamp: "", currency: "USD" },
  ];

  const displayItems = items && items.length > 0 ? items : fallbackItems;

  return (
    <section
      className="relative w-full bg-[#0B0F14] border-b border-[#263345] py-2.5 overflow-hidden select-none"
      aria-label="Real-Time Market Data Ticker"
    >
      {/* Pinned Left Desk Badge */}
      <div className="absolute left-0 inset-y-0 z-20 flex items-center pl-4 pr-3.5 bg-gradient-to-r from-[#0B0F14] via-[#0B0F14] via-85% to-transparent border-r border-[#263345]/60 shadow-[4px_0_12px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A0AEC0] font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              isStale ? "bg-amber-400" : "bg-[#27C58B] animate-pulse"
            }`}
          />
          <span className="hidden sm:inline font-semibold text-[#E2E8F0] text-[11px] tracking-widest">
            {isStale ? "DATA CACHED" : t("live_markets")}
          </span>
          <span className="sm:hidden font-semibold text-[#E2E8F0] text-[10px]">
            {isStale ? "CACHED" : "LIVE"}
          </span>
        </div>
      </div>

      {/* Right Soft Vignette Fade */}
      <div className="pointer-events-none absolute right-0 inset-y-0 w-12 sm:w-20 bg-gradient-to-l from-[#0B0F14] to-transparent z-10" />

      {/* Continuously Scrolling Track (Track A + Track B for 100% seamless looping) */}
      <div className="ticker-track flex items-center pl-32 sm:pl-44">
        {/* Track A */}
        <div className="flex items-center gap-7 sm:gap-9 shrink-0 pr-7 sm:pr-9">
          {displayItems.map((item, idx) => (
            <TickerItem key={`track-a-${item.symbol}-${idx}`} item={item} />
          ))}
        </div>

        {/* Track B (Identical clone for gapless infinite scrolling) */}
        <div className="flex items-center gap-7 sm:gap-9 shrink-0 pr-7 sm:pr-9" aria-hidden="true">
          {displayItems.map((item, idx) => (
            <TickerItem key={`track-b-${item.symbol}-${idx}`} item={item} isAriaHidden />
          ))}
        </div>
      </div>
    </section>
  );
}

function TickerItem({ item, isAriaHidden }: { item: MarketItem; isAriaHidden?: boolean }) {
  const isUp = item.up;
  const isClosed = item.marketStatus === "closed";

  return (
    <Link
      href="/markets"
      tabIndex={isAriaHidden ? -1 : 0}
      className="group inline-flex items-center gap-2.5 text-xs transition-transform hover:scale-105"
    >
      {/* Symbol */}
      <span className="font-semibold text-[#F1F5F9] font-mono tracking-tight group-hover:text-[#4C8DFF] transition-colors">
        {item.symbol}
      </span>

      {/* Price */}
      <span className="font-mono text-[#CBD5E1] tracking-tight">{item.price}</span>

      {/* Percentage Change */}
      <span
        className={`font-mono font-semibold inline-flex items-center text-[11px] gap-0.5 px-1 py-0.5 rounded ${
          isUp
            ? "text-[#27C58B] bg-[#27C58B]/10"
            : "text-[#F06464] bg-[#F06464]/10"
        }`}
      >
        {isUp ? (
          <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
        ) : (
          <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
        )}
        {item.change}
      </span>

      {/* Market Closed indicator if applicable */}
      {isClosed && (
        <span className="text-[9px] uppercase tracking-wider font-mono text-[#718096] bg-[#1A2332] px-1 py-0.5 rounded border border-white/5">
          Close
        </span>
      )}
    </Link>
  );
}
