"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";
import PublicNav from "@/app/components/PublicNav";
import PublicFooter from "@/app/components/PublicFooter";

const MARKET_CATEGORIES = [
  {
    name: "Digital Cryptocurrencies",
    description: "24/7 global spot & perpetual liquidity with multi-currency settlement.",
    items: [
      { symbol: "BTC/USD", name: "Bitcoin", price: "$97,243.50", change: "+2.41%", up: true, volume: "$840M" },
      { symbol: "ETH/USD", name: "Ethereum", price: "$3,412.18", change: "-0.45%", up: false, volume: "$520M" },
      { symbol: "SOL/USD", name: "Solana", price: "$184.62", change: "+5.12%", up: true, volume: "$310M" },
      { symbol: "USDT", name: "Tether USD", price: "$1.0001", change: "+0.01%", up: true, volume: "$1.2B" },
    ],
  },
  {
    name: "Global Indices & Equities",
    description: "Direct exposure to top industrial conglomerates and tech giants.",
    items: [
      { symbol: "SPX", name: "S&P 500 Index", price: "5,432.10", change: "+0.85%", up: true, volume: "$2.1B" },
      { symbol: "NVDA", name: "Nvidia Corporation", price: "$128.40", change: "+3.85%", up: true, volume: "$950M" },
      { symbol: "AAPL", name: "Apple Inc.", price: "$198.50", change: "+0.92%", up: true, volume: "$780M" },
      { symbol: "TSLA", name: "Tesla Inc.", price: "$267.30", change: "-1.24%", up: false, volume: "$620M" },
    ],
  },
  {
    name: "Commodities & Sovereign Bonds",
    description: "Safe-haven assets and inflation-hedging reserves.",
    items: [
      { symbol: "GOLD", name: "Spot Gold (XAU)", price: "$2,510.40", change: "+1.20%", up: true, volume: "$430M" },
      { symbol: "EUR/USD", name: "Euro / US Dollar", price: "1.0924", change: "+0.15%", up: true, volume: "$3.4B" },
      { symbol: "CRUDE", name: "Brent Crude Oil", price: "$74.80", change: "-0.80%", up: false, volume: "$280M" },
      { symbol: "US10Y", name: "US 10-Year Bond Yield", price: "4.21%", change: "+0.04%", up: true, volume: "$1.5B" },
    ],
  },
];

export default function MarketsPage() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F5F7FA] selection:bg-[#4388F5]/30">
      <PublicNav />

      {/* Header */}
      <section className="pt-16 pb-16 border-b border-white/5 bg-[#0E141B]">
        <div className="container-page max-w-4xl text-center">
          <span className="t-eyebrow mb-2 block">Global Market Registry</span>
          <h1 className="t-page mb-4 font-semibold">Institutional Market Overview</h1>
          <p className="t-lead mx-auto">
            Real-time multi-asset liquidity feeds across crypto perpetuals, global indices, and safe-haven commodities.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container-page flex flex-col gap-10">
          {MARKET_CATEGORIES.map((cat, idx) => (
            <div key={idx} className="panel p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-white/5">
                <div>
                  <h2 className="t-title font-semibold text-white">{cat.name}</h2>
                  <p className="t-small text-[#A6B0BE] mt-0.5">{cat.description}</p>
                </div>
                <span className="badge badge-accent shrink-0 text-xs">
                  Tier-1 Aggregated Orderbook
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cat.items.map((item, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-md bg-[#0B0F14] border border-white/10 hover:border-white/20 transition-colors flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-semibold text-white block">{item.symbol}</span>
                        <span className="text-[11px] text-[#7D8998]">{item.name}</span>
                      </div>
                      <span
                        className={`num text-xs font-semibold inline-flex items-center gap-0.5 ${
                          item.up ? "text-[#27C58B]" : "text-[#F06464]"
                        }`}
                      >
                        {item.up ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        {item.change}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline pt-2 border-t border-white/5">
                      <span className="num text-lg font-bold text-white">{item.price}</span>
                      <span className="num text-[11px] text-[#7D8998]">Vol: {item.volume}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Callout */}
          <div className="panel p-8 sm:p-10 text-center bg-[#0E141B]">
            <h3 className="t-title mb-2 text-white">Trade Across All Asset Classes With One Account</h3>
            <p className="t-small text-[#A6B0BE] max-w-lg mx-auto mb-6">
              Zero account maintenance fees, institutional segregation, and automated daily payouts.
            </p>
            <Link href="/register" className="btn btn-primary font-semibold shadow-md">
              <span>Open Free Institutional Account</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
