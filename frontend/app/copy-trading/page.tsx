"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PublicNav from "@/app/components/PublicNav";
import PublicFooter from "@/app/components/PublicFooter";

const MASTER_TRADERS = [
  {
    name: "Alexandre Vance",
    handle: "@vance_alpha",
    winRate: "98.4%",
    monthlyRoi: "+184.2%",
    copiers: 1420,
    strategy: "Cross-Exchange Arbitrage & Futures",
    badge: "Top Performer",
    desc: "Low drawdown quantitative strategy focusing on statistical arbitrage between spot and perpetual contracts.",
    initials: "AV",
  },
  {
    name: "Elena Rostova",
    handle: "@elena_quant",
    winRate: "96.8%",
    monthlyRoi: "+142.6%",
    copiers: 980,
    strategy: "Algorithmic Forex & Macro Swing",
    badge: "Consistent Yield",
    desc: "Automated quantitative models trading G10 currency momentum with strict non-correlated stop-losses.",
    initials: "ER",
  },
  {
    name: "Marcus Thorne",
    handle: "@thorne_hedge",
    winRate: "95.2%",
    monthlyRoi: "+119.8%",
    copiers: 2150,
    strategy: "Global Equities & Crypto Breakouts",
    badge: "High Volume",
    desc: "Trend-following algorithm capturing verified breakouts in mega-cap technology and sovereign debt.",
    initials: "MT",
  },
  {
    name: "Sophia Lin",
    handle: "@lin_derivatives",
    winRate: "94.7%",
    monthlyRoi: "+108.4%",
    copiers: 840,
    strategy: "Options Strangles & Volatility Skew",
    badge: "Delta Neutral",
    desc: "Market-neutral institutional volatility harvesting designed to extract positive drift across volatile markets.",
    initials: "SL",
  },
];

export default function CopyTradingPage() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F5F7FA] selection:bg-[#4388F5]/30">
      <PublicNav />

      {/* Header */}
      <section className="pt-16 pb-16 border-b border-white/5 bg-[#0E141B]">
        <div className="container-page max-w-4xl text-center">
          <span className="t-eyebrow mb-2 block">Algorithmic Mirror Network</span>
          <h1 className="t-page mb-4 font-semibold">Mirror Verified Pros. Zero Manual Effort.</h1>
          <p className="t-lead mx-auto">
            Automatically duplicate orders executed by our audited algorithmic traders with total custody control, custom position sizing, and automated risk stops.
          </p>
        </div>
      </section>

      {/* Traders Grid */}
      <section className="section">
        <div className="container-page">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {MASTER_TRADERS.map((trader, idx) => (
              <div key={idx} className="panel p-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-md bg-[#151F2B] border border-white/10 flex items-center justify-center font-bold text-white text-base">
                        {trader.initials}
                      </div>
                      <div>
                        <h2 className="font-semibold text-base text-white">{trader.name}</h2>
                        <span className="text-xs text-[#7D8998]">{trader.handle}</span>
                      </div>
                    </div>
                    <span className="badge badge-accent font-semibold text-xs">
                      {trader.badge}
                    </span>
                  </div>

                  <p className="t-small text-[#A6B0BE] leading-relaxed mb-6">
                    {trader.desc}
                  </p>

                  <div className="grid grid-cols-3 gap-3 p-4 rounded-md bg-[#0B0F14] border border-white/10 mb-6 text-center">
                    <div>
                      <span className="text-[10px] text-[#7D8998] uppercase font-semibold block">
                        30D Win Rate
                      </span>
                      <span className="num text-base font-bold text-[#27C58B]">
                        {trader.winRate}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7D8998] uppercase font-semibold block">
                        30D Net ROI
                      </span>
                      <span className="num text-base font-bold text-[#4388F5]">
                        {trader.monthlyRoi}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7D8998] uppercase font-semibold block">
                        Active Copiers
                      </span>
                      <span className="num text-base font-bold text-white">
                        {trader.copiers.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-[#A6B0BE] mb-6">
                    Strategy: <strong className="text-white font-medium">{trader.strategy}</strong>
                  </div>
                </div>

                <Link
                  href="/register"
                  className="btn btn-primary btn-block text-xs font-semibold shadow-sm"
                >
                  <span>Mirror {trader.name.split(" ")[0]}'s Trades</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            ))}
          </div>

          {/* Benefits Callout */}
          <div className="panel p-8 sm:p-10 bg-[#0E141B]">
            <h3 className="t-title mb-3 text-white">How Algorithmic Mirror Trading Works</h3>
            <div className="grid sm:grid-cols-3 gap-6 text-xs text-[#A6B0BE] mt-6">
              <div className="flex flex-col gap-2">
                <span className="font-bold text-sm text-white">1. Select Strategy</span>
                <p className="leading-relaxed">Browse verified track records and select master models aligned with your risk profile.</p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-bold text-sm text-white">2. Set Capital Limits</span>
                <p className="leading-relaxed">Allocate any amount from your multi-currency balance with customizable max-drawdown rules.</p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-bold text-sm text-white">3. Automated Execution</span>
                <p className="leading-relaxed">Signals are executed simultaneously on your account in under 12ms with zero performance fees.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
