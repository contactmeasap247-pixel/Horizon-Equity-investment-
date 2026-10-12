"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight, ShieldCheck, Check } from "lucide-react";
import PublicNav from "@/app/components/PublicNav";
import PublicFooter from "@/app/components/PublicFooter";

const DETAILED_PLANS = [
  {
    id: "starter",
    name: "Starter Allocation",
    badge: "Entry Tier",
    dailyRate: 1.8,
    durationDays: 7,
    minDeposit: 250,
    maxDeposit: 2500,
    popular: false,
    features: [
      "1.8% daily automated return",
      "7-day maturity period",
      "Principal returned automatically at term completion",
      "Automated portfolio rebalancing algorithm",
      "Multi-currency support: BTC, USDT, ETH, SOL",
      "Standard email & ticket assistance",
    ],
  },
  {
    id: "growth",
    name: "Growth Momentum",
    badge: "Most Popular",
    dailyRate: 2.5,
    durationDays: 14,
    minDeposit: 2500,
    maxDeposit: 10000,
    popular: true,
    features: [
      "2.5% daily automated return",
      "14-day maturity period",
      "Daily automated yield compounding",
      "Priority automated withdrawal channel",
      "Dedicated account portfolio strategist",
      "Zero management or performance deduction fees",
      "Weekly market analysis briefing",
    ],
  },
  {
    id: "institutional",
    name: "Institutional Yield",
    badge: "High Yield",
    dailyRate: 3.2,
    durationDays: 30,
    minDeposit: 10000,
    maxDeposit: 50000,
    popular: false,
    features: [
      "3.2% daily automated return",
      "30-day maturity period",
      "Institutional-grade orderbook matching",
      "Direct VIP communication line",
      "Custom multi-asset allocation hedge",
      "Full principal insurance protection guarantee",
      "Private Telegram liaison support",
    ],
  },
  {
    id: "executive",
    name: "Executive Syndicate",
    badge: "Exclusive VIP",
    dailyRate: 4.0,
    durationDays: 60,
    minDeposit: 50000,
    maxDeposit: 250000,
    popular: false,
    features: [
      "4.0% daily automated return",
      "60-day maximum compounding",
      "Bespoke private wealth management",
      "Instant priority wire & on-chain settlements",
      "Direct algorithmic hedging protocol",
      "Quarterly institutional audit certificates",
      "Custom legal custodian documentation",
    ],
  },
];

const COMPARISON_ROWS = [
  { feature: "Daily Automated Return", starter: "1.8%", growth: "2.5%", inst: "3.2%", exec: "4.0%" },
  { feature: "Term Duration", starter: "7 Days", growth: "14 Days", inst: "30 Days", exec: "60 Days" },
  { feature: "Minimum Allocation", starter: "$250", growth: "$2,500", inst: "$10,000", exec: "$50,000" },
  { feature: "Maximum Allocation", starter: "$2,500", growth: "$10,000", inst: "$50,000", exec: "$250,000" },
  { feature: "Principal Return Guarantee", starter: true, growth: true, inst: true, exec: true },
  { feature: "Daily Automated Compounding", starter: false, growth: true, inst: true, exec: true },
  { feature: "Dedicated Account Strategist", starter: false, growth: true, inst: true, exec: true },
  { feature: "Priority Automated Withdrawal", starter: false, growth: true, inst: true, exec: true },
  { feature: "Principal Insurance Coverage", starter: false, growth: false, inst: true, exec: true },
  { feature: "Bespoke Wealth Management", starter: false, growth: false, inst: false, exec: true },
];

export default function PlansPage() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F5F7FA] selection:bg-[#4388F5]/30">
      <PublicNav />

      {/* Hero Header */}
      <section className="pt-16 pb-16 border-b border-white/5 bg-[#0E141B]">
        <div className="container-page max-w-4xl text-center">
          <span className="t-eyebrow mb-2 block">Institutional Investment Tiers</span>
          <h1 className="t-page mb-4 font-semibold">Structured Allocation Plans</h1>
          <p className="t-lead mx-auto">
            Algorithmic diversification, daily automated liquidity, and strict cold-custody capital preservation across every tier.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="section">
        <div className="container-page">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {DETAILED_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`panel p-6 sm:p-7 flex flex-col justify-between ${
                  plan.popular ? "border-[#4388F5]/40 bg-[#131B26] shadow-lg" : "bg-[#111821]"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#A6B0BE]">
                      {plan.name}
                    </span>
                    <span className={`badge ${plan.popular ? "badge-accent font-semibold" : ""}`}>
                      {plan.badge}
                    </span>
                  </div>

                  <div className="mb-6 flex items-baseline gap-2">
                    <span className="num text-3xl sm:text-4xl font-bold text-white">
                      {plan.dailyRate}%
                    </span>
                    <span className="text-xs text-[#7D8998]">/ daily</span>
                  </div>

                  <div className="inset p-3.5 space-y-2 mb-6 text-xs text-[#A6B0BE]">
                    <div className="flex justify-between">
                      <span className="text-[#7D8998]">Min Entry:</span>
                      <span className="num font-semibold text-white">${plan.minDeposit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7D8998]">Max Entry:</span>
                      <span className="num font-semibold text-white">${plan.maxDeposit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-2">
                      <span className="text-[#7D8998]">Duration:</span>
                      <span className="num font-semibold text-[#4388F5]">{plan.durationDays} Days</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 mb-8 text-xs text-[#A6B0BE]">
                    {plan.features.map((feat, fidx) => (
                      <li key={fidx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#27C58B] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/register"
                  className={`btn btn-block text-xs font-semibold ${
                    plan.popular ? "btn-primary" : "btn-secondary"
                  }`}
                >
                  <span>Select {plan.name.split(" ")[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            ))}
          </div>

          {/* Full Comparison Table */}
          <div className="panel p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="t-title mb-1 text-white">Feature &amp; Terms Comparison</h2>
              <p className="t-small text-[#A6B0BE]">
                Direct comparison of maturity schedules, security guarantees, and execution parameters.
              </p>
            </div>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Specification</th>
                    <th>Starter</th>
                    <th>Growth</th>
                    <th>Institutional</th>
                    <th>Executive</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td className="font-medium text-white">{row.feature}</td>
                      <td className="cell-num">
                        {typeof row.starter === "boolean" ? (
                          row.starter ? <Check className="w-4 h-4 text-[#27C58B] inline" /> : <span className="text-[#7D8998]">—</span>
                        ) : (
                          row.starter
                        )}
                      </td>
                      <td className="cell-num">
                        {typeof row.growth === "boolean" ? (
                          row.growth ? <Check className="w-4 h-4 text-[#27C58B] inline" /> : <span className="text-[#7D8998]">—</span>
                        ) : (
                          row.growth
                        )}
                      </td>
                      <td className="cell-num">
                        {typeof row.inst === "boolean" ? (
                          row.inst ? <Check className="w-4 h-4 text-[#27C58B] inline" /> : <span className="text-[#7D8998]">—</span>
                        ) : (
                          row.inst
                        )}
                      </td>
                      <td className="cell-num">
                        {typeof row.exec === "boolean" ? (
                          row.exec ? <Check className="w-4 h-4 text-[#27C58B] inline" /> : <span className="text-[#7D8998]">—</span>
                        ) : (
                          row.exec
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Assurance Notice */}
          <div className="mt-12 panel p-6 sm:p-8 flex items-start gap-4 bg-[#0E141B]">
            <ShieldCheck className="w-5 h-5 text-[#4388F5] shrink-0 mt-0.5" />
            <div className="text-xs text-[#A6B0BE] leading-relaxed">
              <strong className="text-white block mb-1">Principal Protection Safeguards</strong>
              All deposit principals are locked strictly for their designated duration period and automatically credited back to your liquid balance upon cycle completion. Daily returns are liquid and withdrawable at any time without penalty.
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
