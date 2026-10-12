"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Plus,
  Minus,
  Search,
  ArrowRight,
} from "lucide-react";
import PublicNav from "@/app/components/PublicNav";
import PublicFooter from "@/app/components/PublicFooter";

interface FAQItem {
  q: string;
  a: string;
  category: "all" | "plans" | "assets" | "security" | "funding";
}

const FAQS: FAQItem[] = [
  {
    category: "plans",
    q: "How do Horizon Equity structured investment plans work?",
    a: "Horizon Equity offers four structured tiers: Silver ($100–$499, 14 days, 8% ROI), Gold ($500–$999, 30 days, 16% ROI), Platinum ($1,000–$4,999, 60 days, 28% ROI), and Diamond ($5,000+ Unlimited, 90 days, 45% ROI). When you allocate capital into a plan, our automated algorithms deploy your capital across market-making and arbitrage strategies. Principal is returned automatically upon maturity.",
  },
  {
    category: "plans",
    q: "Is there any upper deposit ceiling on the Diamond Tier?",
    a: "No. The Diamond Tier is explicitly unlimited ($5,000+ with no upper ceiling). Institutional allocators and family offices deploying upwards of $1,000,000 receive dedicated portfolio managers, customized hedging schedules, and direct OTC liquidity channels.",
  },
  {
    category: "assets",
    q: "Which asset classes does the platform support?",
    a: "Horizon Equity supports five major asset categories: Precious Metals (physical and spot Gold, Silver, Platinum), Cryptocurrency (Bitcoin, Ethereum, Solana, and top perpetuals), Forex (G10 currencies with micro-pip spreads), Energy (Crude oil, Brent futures, Natural Gas), and Real Estate (tokenized prime real estate syndicates and infrastructure debt).",
  },
  {
    category: "funding",
    q: "What deposit currencies and payment channels are available?",
    a: "You can fund your account natively using Bitcoin (BTC), Ethereum (ETH), Tether (USDT on ERC-20 & TRC-20), and Solana (SOL). Internal balance conversions are executed instantaneously at spot rates with zero network markup.",
  },
  {
    category: "security",
    q: "How are investor deposits protected against market crashes?",
    a: "Over 98% of all digital reserves are kept in air-gapped, multi-signature institutional cold vaults. Our proprietary delta-neutral algorithmic hedging protocols dynamically balance open market exposures so that client capital remains shielded from acute market drawdowns.",
  },
  {
    category: "funding",
    q: "How fast are withdrawals processed?",
    a: "Withdrawals are automated through dedicated node clusters. Once requested, your funds undergo an automated cryptographic check and are dispatched on-chain within minutes. There are no artificial hold delays or exit penalties on matured principal balances.",
  },
  {
    category: "security",
    q: "What verification (KYC) standards are required?",
    a: "Basic trading and entry-tier investments require standard email verification. Higher-tier allocations (Platinum and Diamond) or aggregate account withdrawals exceeding $50,000 require standard KYC identity verification in compliance with international AML regulations.",
  },
  {
    category: "plans",
    q: "Can I compound my earnings automatically?",
    a: "Yes. All active contracts include an optional 'Auto-Renew' setting in your dashboard. Enabling this feature automatically rolls over your principal and accrued return into a consecutive maturity cycle for exponential compound growth.",
  },
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const filteredFaqs = FAQS.filter((item) => {
    const matchesCat = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.a.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#080C12] text-[#F1F5F9] selection:bg-[#4C8DFF]/30">
      <PublicNav />

      {/* Header Banner */}
      <section className="pt-20 pb-16 border-b border-[#263345] bg-[#0D131C] relative overflow-hidden">
        <div className="hero-grid opacity-30 pointer-events-none" />
        <div className="container-page max-w-4xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#111A26] border border-[#263345] text-xs font-mono text-[#A0AEC0] mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-[#4C8DFF]" />
            <span>KNOWLEDGE BASE &amp; FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h1 className="t-page text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 font-mono">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-[#A0AEC0] max-w-2xl mx-auto font-sans leading-relaxed">
            Everything you need to know about our multi-asset execution, 4-tier structured investment plans, cold-vault custody, and automated settlements.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto mt-8 relative">
            <Search className="w-4 h-4 text-[#718096] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keyword, asset, or plan tier..."
              className="input w-full pl-10 pr-4 py-3 bg-[#111A26] border-[#263345] text-sm font-mono placeholder:text-[#718096]"
            />
          </div>
        </div>
      </section>

      {/* Content Section */}
      <main className="section py-16">
        <div className="container-page max-w-4xl">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {[
              { id: "all", label: "All Questions" },
              { id: "plans", label: "Investment Tiers" },
              { id: "assets", label: "Asset Classes" },
              { id: "security", label: "Security & Cold Vaults" },
              { id: "funding", label: "Deposits & Withdrawals" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-2 rounded text-xs font-mono transition-colors ${
                  activeCategory === tab.id
                    ? "bg-[#4C8DFF] text-white font-semibold shadow-md"
                    : "bg-[#111A26] border border-[#263345] text-[#A0AEC0] hover:text-white hover:border-[#4C8DFF]/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Accordion List */}
          {filteredFaqs.length === 0 ? (
            <div className="panel p-10 text-center bg-[#111A26] border border-[#263345]">
              <p className="text-sm text-[#A0AEC0] font-mono">
                No matching answers found for &ldquo;{searchTerm}&rdquo;. Try another search term.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq, idx) => {
                const isOpen = openIdx === idx;
                return (
                  <div
                    key={idx}
                    className="panel bg-[#111A26] border border-[#263345] overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIdx(isOpen ? null : idx)}
                      className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <span className="text-sm sm:text-base font-bold text-white font-mono">
                        {faq.q}
                      </span>
                      <div className="p-1 rounded bg-[#172333] border border-[#263345] shrink-0 text-[#4C8DFF]">
                        {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-[#A0AEC0] leading-relaxed border-t border-[#263345]/50 animate-rise">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Help Strip */}
          <div className="mt-16 panel p-6 sm:p-8 bg-[#0D131C] border border-[#263345] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-base font-bold text-white font-mono mb-1">
                Have a specialized or high-volume inquiry?
              </h3>
              <p className="text-xs text-[#A0AEC0]">
                Our quantitative desk can provide detailed algorithmic audit reports and bespoke institutional contracts.
              </p>
            </div>
            <Link
              href="/contact"
              className="btn btn-primary btn-sm font-mono shrink-0 font-semibold"
            >
              <span>Contact Support Desk</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
