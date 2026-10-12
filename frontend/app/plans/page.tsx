"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight, ShieldCheck, Check } from "lucide-react";
import PublicNav from "@/app/components/PublicNav";
import PublicFooter from "@/app/components/PublicFooter";

const DETAILED_PLANS = [
  {
    id: "silver",
    name: "Silver Tier",
    badge: "Entry Tier",
    roi: "8.0%",
    durationDays: 14,
    minDeposit: 100,
    maxDeposit: 499,
    popular: false,
    features: [
      "8.0% fixed contract return",
      "14-day maturity period",
      "Principal returned automatically at completion",
      "Automated cross-asset liquidity balancing",
      "Multi-currency support: BTC, ETH, USDT, SOL",
      "Standard email & ticketing liaison",
    ],
  },
  {
    id: "gold",
    name: "Gold Tier",
    badge: "Most Popular",
    roi: "16.0%",
    durationDays: 30,
    minDeposit: 500,
    maxDeposit: 999,
    popular: true,
    features: [
      "16.0% fixed contract return",
      "30-day maturity period",
      "Automated yield compounding option",
      "Priority automated withdrawal channel",
      "Dedicated account portfolio strategist",
      "Zero management or performance deduction fees",
      "Bi-weekly market analysis briefings",
    ],
  },
  {
    id: "platinum",
    name: "Platinum Tier",
    badge: "High Yield",
    roi: "28.0%",
    durationDays: 60,
    minDeposit: 1000,
    maxDeposit: 4999,
    popular: false,
    features: [
      "28.0% fixed contract return",
      "60-day maturity period",
      "Institutional orderbook routing",
      "Direct VIP communication line",
      "Custom multi-asset allocation hedge",
      "Full principal insurance protection guarantee",
      "Private Telegram & Signal desk support",
    ],
  },
  {
    id: "diamond",
    name: "Diamond Tier",
    badge: "VIP Unlimited",
    roi: "45.0%",
    durationDays: 90,
    minDeposit: 5000,
    maxDeposit: null, // Unlimited
    popular: false,
    features: [
      "45.0% fixed contract return",
      "90-day maximum compounding cycle",
      "Unlimited allocation ceiling ($5,000+)",
      "Bespoke private wealth management",
      "Instant priority wire & on-chain settlements",
      "Direct algorithmic hedging protocol",
      "Quarterly institutional audit certificates",
      "Custom legal custodian documentation",
    ],
  },
];

const COMPARISON_ROWS = [
  { feature: "Fixed Contract Return", silver: "8.0%", gold: "16.0%", platinum: "28.0%", diamond: "45.0%" },
  { feature: "Term Duration", silver: "14 Days", gold: "30 Days", platinum: "60 Days", diamond: "90 Days" },
  { feature: "Minimum Allocation", silver: "$100", gold: "$500", platinum: "$1,000", diamond: "$5,000" },
  { feature: "Maximum Allocation", silver: "$499", gold: "$999", platinum: "$4,999", diamond: "Unlimited" },
  { feature: "Principal Return Guarantee", silver: true, gold: true, platinum: true, diamond: true },
  { feature: "Daily Automated Compounding", silver: false, gold: true, platinum: true, diamond: true },
  { feature: "Dedicated Account Strategist", silver: false, gold: true, platinum: true, diamond: true },
  { feature: "Priority Automated Withdrawal", silver: false, gold: true, platinum: true, diamond: true },
  { feature: "Principal Insurance Coverage", silver: false, gold: false, platinum: true, diamond: true },
  { feature: "Bespoke Wealth Management", silver: false, gold: false, platinum: false, diamond: true },
];

export default function PlansPage() {
  return (
    <div className="min-h-screen bg-[#080C12] text-[#F1F5F9] selection:bg-[#4C8DFF]/30">
      <PublicNav />

      {/* Hero Header */}
      <section className="pt-20 pb-16 border-b border-[#263345] bg-[#0D131C] relative overflow-hidden">
        <div className="hero-grid opacity-30 pointer-events-none" />
        <div className="container-page max-w-4xl text-center relative z-10">
          <span className="t-eyebrow mb-2 block font-mono text-[#4C8DFF]">
            INSTITUTIONAL INVESTMENT TIERS
          </span>
          <h1 className="t-page text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 font-mono">
            Structured Allocation Plans
          </h1>
          <p className="text-sm sm:text-base text-[#A0AEC0] max-w-2xl mx-auto leading-relaxed">
            Algorithmic diversification, daily automated liquidity, and strict cold-custody capital preservation across every structured tier.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="section py-16">
        <div className="container-page">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {DETAILED_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`panel p-6 sm:p-7 flex flex-col justify-between relative border ${
                  plan.popular
                    ? "border-[#4C8DFF] bg-[#131B26] shadow-xl"
                    : "border-[#263345] bg-[#111A26] hover:border-[#4C8DFF]/40"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#A0AEC0]">
                      {plan.name}
                    </span>
                    <span
                      className={`badge text-[10px] font-mono ${
                        plan.popular
                          ? "badge-accent font-semibold"
                          : "bg-[#172333] text-[#A0AEC0] border border-[#263345]"
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>

                  <div className="mb-6 flex items-baseline gap-2">
                    <span className="num font-mono text-3xl sm:text-4xl font-bold text-white">
                      {plan.roi}
                    </span>
                    <span className="text-xs text-[#718096] font-mono">Net Fixed</span>
                  </div>

                  <div className="inset p-3.5 space-y-2 mb-6 text-xs text-[#A0AEC0] bg-[#0D131C] border border-[#263345] rounded">
                    <div className="flex justify-between">
                      <span className="text-[#718096]">Min Entry:</span>
                      <span className="num font-mono font-semibold text-white">
                        ${plan.minDeposit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#718096]">Max Entry:</span>
                      <span className="num font-mono font-semibold text-white">
                        {plan.maxDeposit ? `$${plan.maxDeposit.toLocaleString()}` : "Unlimited"}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-[#263345] pt-2">
                      <span className="text-[#718096]">Term Duration:</span>
                      <span className="num font-mono font-semibold text-[#4C8DFF]">
                        {plan.durationDays} Days
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 mb-8 text-xs text-[#A0AEC0]">
                    {plan.features.map((feat, fidx) => (
                      <li key={fidx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#31C48D] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/register"
                  className={`btn btn-block text-xs font-mono font-semibold ${
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
                    <th>Silver</th>
                    <th>Gold</th>
                    <th>Platinum</th>
                    <th>Diamond</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td className="font-medium text-white">{row.feature}</td>
                      <td className="cell-num">
                        {typeof row.silver === "boolean" ? (
                          row.silver ? <Check className="w-4 h-4 text-[#31C48D] inline" /> : <span className="text-[#718096]">—</span>
                        ) : (
                          row.silver
                        )}
                      </td>
                      <td className="cell-num">
                        {typeof row.gold === "boolean" ? (
                          row.gold ? <Check className="w-4 h-4 text-[#31C48D] inline" /> : <span className="text-[#718096]">—</span>
                        ) : (
                          row.gold
                        )}
                      </td>
                      <td className="cell-num">
                        {typeof row.platinum === "boolean" ? (
                          row.platinum ? <Check className="w-4 h-4 text-[#31C48D] inline" /> : <span className="text-[#718096]">—</span>
                        ) : (
                          row.platinum
                        )}
                      </td>
                      <td className="cell-num">
                        {typeof row.diamond === "boolean" ? (
                          row.diamond ? <Check className="w-4 h-4 text-[#31C48D] inline" /> : <span className="text-[#718096]">—</span>
                        ) : (
                          row.diamond
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
