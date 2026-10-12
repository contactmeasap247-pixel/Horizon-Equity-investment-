"use client";

import { useState, useId } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import PublicNav from "@/app/components/PublicNav";
import PublicFooter from "@/app/components/PublicFooter";

const TIERS = [
  { id: "starter", name: "Starter Allocation", rate: 1.8, days: 7, min: 250, max: 2500 },
  { id: "growth", name: "Growth Momentum", rate: 2.5, days: 14, min: 2500, max: 10000 },
  { id: "institutional", name: "Institutional Yield", rate: 3.2, days: 30, min: 10000, max: 50000 },
  { id: "executive", name: "Executive Syndicate", rate: 4.0, days: 60, min: 50000, max: 250000 },
];

export default function CalculatorPage() {
  const [selectedTier, setSelectedTier] = useState(TIERS[1]);
  const [capital, setCapital] = useState(5000);
  const inputId = useId();

  const dailyProfit = capital * (selectedTier.rate / 100);
  const totalProfit = dailyProfit * selectedTier.days;
  const totalPayout = capital + totalProfit;
  const netRoi = ((totalProfit / capital) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F5F7FA] selection:bg-[#4388F5]/30">
      <PublicNav />

      {/* Header */}
      <section className="pt-16 pb-16 border-b border-white/5 bg-[#0E141B]">
        <div className="container-page max-w-4xl text-center">
          <span className="t-eyebrow mb-2 block">Yield Simulator</span>
          <h1 className="t-page mb-4 font-semibold">Portfolio Growth Calculator</h1>
          <p className="t-lead mx-auto">
            Simulate expected daily yields, compounding schedules, and total capital payouts before funding your account.
          </p>
        </div>
      </section>

      {/* Calculator Body */}
      <section className="section">
        <div className="container-page max-w-4xl">
          <div className="panel p-7 sm:p-10 lg:p-12">
            {/* Tier Selector */}
            <div className="mb-8">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#A6B0BE] block mb-3">
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
                          ? "bg-[#151F2B] border-[#4388F5] text-white"
                          : "bg-[#111821] border-white/10 text-[#A6B0BE] hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <span className="block text-xs font-semibold text-white">
                        {tier.name.split(" ")[0]}
                      </span>
                      <span className="num text-[11px] text-[#27C58B] mt-0.5 block font-medium">
                        {tier.rate}% Daily • {tier.days}d
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Capital Slider */}
            <div className="mb-10">
              <div className="flex justify-between items-baseline mb-3">
                <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-[#A6B0BE]">
                  2. Investment Capital (USD)
                </label>
                <span className="num text-xl sm:text-2xl font-bold text-white bg-[#151F2B] px-3.5 py-1 rounded border border-white/10">
                  ${capital.toLocaleString()}
                </span>
              </div>

              <input
                id={inputId}
                type="range"
                min={selectedTier.min}
                max={selectedTier.max}
                step={50}
                value={capital}
                onChange={(e) => setCapital(Number(e.target.value))}
                className="range"
                style={{
                  ["--fill" as any]: `${
                    ((capital - selectedTier.min) / (selectedTier.max - selectedTier.min)) * 100
                  }%`,
                }}
              />

              <div className="flex justify-between text-xs text-[#7D8998] mt-2 num">
                <span>Min: ${selectedTier.min.toLocaleString()}</span>
                <span>Max: ${selectedTier.max.toLocaleString()}</span>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 sm:p-6 rounded-lg bg-[#0B0F14] border border-white/10 mb-8">
              <div className="metric">
                <span className="metric-label">Daily Return</span>
                <span className="num text-xl sm:text-2xl font-bold text-[#27C58B]">
                  +${dailyProfit.toFixed(2)}
                </span>
              </div>

              <div className="metric">
                <span className="metric-label">Cycle Duration</span>
                <span className="num text-xl sm:text-2xl font-bold text-white">
                  {selectedTier.days} Days
                </span>
              </div>

              <div className="metric">
                <span className="metric-label">Net Projected ROI</span>
                <span className="num text-xl sm:text-2xl font-bold text-[#4388F5]">
                  +{netRoi}%
                </span>
              </div>

              <div className="metric">
                <span className="metric-label">Total Payout Settlement</span>
                <span className="num text-xl sm:text-2xl font-bold text-white">
                  ${totalPayout.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs text-[#7D8998]">
                <ShieldCheck className="w-4 h-4 text-[#27C58B]" />
                <span>Principal capital is 100% safeguarded and returned at maturity.</span>
              </div>

              <Link
                href="/register"
                className="btn btn-primary btn-md w-full sm:w-auto font-semibold shadow-md"
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
