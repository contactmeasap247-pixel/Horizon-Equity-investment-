"use client";

import { useState, useId } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import PublicNav from "@/app/components/PublicNav";
import PublicFooter from "@/app/components/PublicFooter";

const TIERS = [
  { id: "silver", name: "Silver Tier", rate: 8.0, days: 2, min: 100, max: 499, unlimited: false },
  { id: "gold", name: "Gold Tier", rate: 16.0, days: 3, min: 500, max: 999, unlimited: false },
  { id: "platinum", name: "Platinum Tier", rate: 28.0, days: 7, min: 1000, max: 4999, unlimited: false },
  { id: "diamond", name: "Diamond Tier", rate: 45.0, days: 7, min: 5000, max: 100000, unlimited: true },
];

export default function CalculatorPage() {
  const [selectedTier, setSelectedTier] = useState(TIERS[1]);
  const [capital, setCapital] = useState(750);
  const inputId = useId();

  const totalProfit = capital * (selectedTier.rate / 100);
  const dailyProfit = totalProfit / selectedTier.days;
  const totalPayout = capital + totalProfit;
  const netRoi = selectedTier.rate.toFixed(1);

  return (
    <div className="min-h-screen bg-[#080C12] text-[#F1F5F9] selection:bg-[#4C8DFF]/30">
      <PublicNav />

      {/* Header */}
      <section className="pt-20 pb-16 border-b border-[#263345] bg-[#0D131C] relative overflow-hidden">
        <div className="hero-grid opacity-30 pointer-events-none" />
        <div className="container-page max-w-4xl text-center relative z-10">
          <span className="t-eyebrow mb-2 block font-mono text-[#4C8DFF]">
            STRUCTURED YIELD ENGINE
          </span>
          <h1 className="t-page text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 font-mono">
            Portfolio Growth Simulator
          </h1>
          <p className="text-sm sm:text-base text-[#A0AEC0] max-w-2xl mx-auto leading-relaxed">
            Simulate expected contract yields, compounding maturity schedules, and net payouts across all four investment tiers.
          </p>
        </div>
      </section>

      {/* Calculator Body */}
      <section className="section py-16">
        <div className="container-page max-w-4xl">
          <div className="panel p-7 sm:p-10 lg:p-12 bg-[#111A26] border border-[#263345]">
            {/* Tier Selector */}
            <div className="mb-8">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#A0AEC0] block mb-3">
                1. Select Allocation Tier
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TIERS.map((tier) => {
                  const isSelected = selectedTier.id === tier.id;
                  return (
                    <button
                      type="button"
                      key={tier.id}
                      onClick={() => {
                        setSelectedTier(tier);
                        if (capital < tier.min) setCapital(tier.min);
                        if (capital > tier.max) setCapital(tier.max);
                      }}
                      className={`p-3.5 rounded-md border text-left transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#172333] border-[#4C8DFF] text-white shadow-md"
                          : "bg-[#0D131C] border-[#263345] text-[#A0AEC0] hover:border-[#4C8DFF]/40 hover:text-white"
                      }`}
                    >
                      <span className="block text-xs font-mono font-semibold text-white">
                        {tier.name.split(" ")[0]}
                      </span>
                      <span className="num font-mono text-[11px] text-[#31C48D] mt-0.5 block font-medium">
                        +{tier.rate}% Net • {tier.days}d
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Capital Slider */}
            <div className="mb-10">
              <div className="flex justify-between items-baseline mb-3">
                <label htmlFor={inputId} className="text-xs font-mono uppercase tracking-wider text-[#A0AEC0]">
                  2. Investment Capital (USD)
                </label>
                <span className="num font-mono text-xl sm:text-2xl font-bold text-white bg-[#0D131C] px-3.5 py-1 rounded border border-[#263345]">
                  ${capital.toLocaleString()}
                </span>
              </div>

              <input
                id={inputId}
                type="range"
                min={selectedTier.min}
                max={selectedTier.max}
                step={selectedTier.min >= 1000 ? 250 : 25}
                value={capital}
                onChange={(e) => setCapital(Number(e.target.value))}
                className="range"
                style={{
                  ["--fill" as any]: `${
                    ((capital - selectedTier.min) / (selectedTier.max - selectedTier.min)) * 100
                  }%`,
                }}
              />

              <div className="flex justify-between text-xs text-[#718096] mt-2 num font-mono">
                <span>Min: ${selectedTier.min.toLocaleString()}</span>
                <span>
                  {selectedTier.unlimited ? "Unlimited ($5,000+ Permitted)" : `Max: $${selectedTier.max.toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 sm:p-6 rounded-lg bg-[#0D131C] border border-[#263345] mb-8">
              <div className="metric">
                <span className="metric-label">Daily Return</span>
                <span className="num font-mono text-xl sm:text-2xl font-bold text-[#31C48D]">
                  +${dailyProfit.toFixed(2)}
                </span>
              </div>

              <div className="metric">
                <span className="metric-label">Cycle Duration</span>
                <span className="num font-mono text-xl sm:text-2xl font-bold text-white">
                  {selectedTier.days} Days
                </span>
              </div>

              <div className="metric">
                <span className="metric-label">Net Projected ROI</span>
                <span className="num font-mono text-xl sm:text-2xl font-bold text-[#4C8DFF]">
                  +{netRoi}%
                </span>
              </div>

              <div className="metric">
                <span className="metric-label">Total Payout Settlement</span>
                <span className="num font-mono text-xl sm:text-2xl font-bold text-white">
                  ${totalPayout.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#263345]">
              <div className="flex items-center gap-2 text-xs text-[#A0AEC0]">
                <ShieldCheck className="w-4 h-4 text-[#31C48D]" />
                <span>Principal capital is 100% safeguarded in cold vaults and returned at maturity.</span>
              </div>

              <Link
                href="/register"
                className="btn btn-primary btn-md w-full sm:w-auto font-mono font-semibold shadow-md"
              >
                <span>Deposit With {selectedTier.name.split(" ")[0]} Plan</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
