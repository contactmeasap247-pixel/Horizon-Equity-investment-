"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, ArrowRight, RefreshCw } from "lucide-react";
import PublicNav from "@/app/components/PublicNav";
import PublicFooter from "@/app/components/PublicFooter";
import { useMarketPrices } from "@/lib/use-market-prices";

export default function MarketsPage() {
  const { categories, isLoading, lastUpdated, refresh } = useMarketPrices();

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F5F7FA] selection:bg-[#4388F5]/30">
      <PublicNav />

      {/* Header */}
      <section className="pt-16 pb-16 border-b border-white/5 bg-[#0E141B]">
        <div className="container-page max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4388F5]/10 border border-[#4388F5]/20 text-[#4388F5] text-xs font-mono mb-3">
            <span className="w-2 h-2 rounded-full bg-[#27C58B] animate-pulse" />
            <span>REAL-TIME STREAMING FEEDS (COINBASE &amp; GLOBAL FX)</span>
          </div>
          <h1 className="t-page mb-4 font-semibold text-white">Live Multi-Asset Financial Markets</h1>
          <p className="t-lead mx-auto text-[#A6B0BE]">
            Institutional-grade live spot pricing, orderbook liquidity, and daily volatility across digital assets, precious metals, forex pairs, and commodities.
          </p>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-[#7D8998] font-mono">
            <span>
              Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "Synchronizing..."}
            </span>
            <button
              type="button"
              onClick={() => refresh()}
              className="inline-flex items-center gap-1 text-[#4388F5] hover:text-[#6FA4FF] transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh Rates</span>
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section py-12">
        <div className="container-page flex flex-col gap-10">
          {categories.map((cat, idx) => (
            <div key={idx} className="panel p-6 sm:p-8 bg-[#111821] border border-white/10 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-white/5">
                <div>
                  <h2 className="t-title font-semibold text-white">{cat.name}</h2>
                  <p className="t-small text-[#A6B0BE] mt-0.5">{cat.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-accent shrink-0 text-xs">
                    Live Spot Feed
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cat.items.map((item, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-md bg-[#0B0F14] border border-white/10 hover:border-[#4388F5]/40 transition-all flex flex-col justify-between group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-semibold text-white block group-hover:text-[#4388F5] transition-colors">
                          {item.symbol}
                        </span>
                        <span className="text-[11px] text-[#7D8998]">{item.name}</span>
                      </div>
                      <span
                        className={`num text-xs font-semibold inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded ${
                          item.up
                            ? "text-[#27C58B] bg-[#27C58B]/10"
                            : "text-[#F06464] bg-[#F06464]/10"
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

                    <div className="flex justify-between items-baseline pt-3 border-t border-white/5">
                      <span className="num text-lg font-bold text-white tracking-tight font-mono">
                        {item.price}
                      </span>
                      <span className="num text-[11px] text-[#7D8998]">Vol: {item.volume}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Callout */}
          <div className="panel p-8 sm:p-10 text-center bg-[#0E141B] border border-white/10">
            <h3 className="t-title mb-2 text-white">Trade Across All Asset Classes With One Account</h3>
            <p className="t-small text-[#A6B0BE] max-w-lg mx-auto mb-6">
              Zero account maintenance fees, segregated cold-storage custody, and daily automated yield distributions.
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
