"use client";

import { useState, useId } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Percent,
  Coins,
  Globe,
  BarChart3,
  Users,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Zap,
  Headphones,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from "lucide-react";
import PublicNav from "@/app/components/PublicNav";
import PublicFooter from "@/app/components/PublicFooter";
import { useLanguage } from "@/lib/language-context";

/* ---------------------------------------------------------------------
   DATA DEFINITIONS
   --------------------------------------------------------------------- */

const TICKER_ITEMS = [
  { symbol: "BTC/USD", name: "Bitcoin", price: "$97,243.50", change: "+2.41%", up: true },
  { symbol: "ETH/USD", name: "Ethereum", price: "$3,412.18", change: "-0.45%", up: false },
  { symbol: "SOL/USD", name: "Solana", price: "$184.62", change: "+5.12%", up: true },
  { symbol: "SPX", name: "S&P 500", price: "5,432.10", change: "+0.85%", up: true },
  { symbol: "GOLD", name: "Gold Spot", price: "$2,510.40", change: "+1.20%", up: true },
  { symbol: "EUR/USD", name: "Euro / USD", price: "1.0924", change: "+0.15%", up: true },
  { symbol: "NVDA", name: "Nvidia Corp", price: "$128.40", change: "+3.85%", up: true },
  { symbol: "AAPL", name: "Apple Inc.", price: "$198.50", change: "+0.92%", up: true },
  { symbol: "USDT", name: "Tether USD", price: "$1.0001", change: "+0.01%", up: true },
];

const INVESTMENT_PLANS = [
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
      "Automatic principal return on maturity",
      "Automated portfolio rebalancing",
      "Multi-currency support (BTC, ETH, USDT, SOL)",
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
      "Zero management or performance exit fees",
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
      "Institutional orderbook matching",
      "Direct VIP communication desk",
      "Multi-asset algorithmic hedging protocol",
      "Principal insurance protection guarantee",
    ],
  },
  {
    id: "executive",
    name: "Executive Syndicate",
    badge: "VIP Allocation",
    dailyRate: 4.0,
    durationDays: 60,
    minDeposit: 50000,
    maxDeposit: 250000,
    popular: false,
    features: [
      "4.0% daily automated return",
      "60-day maximum compounding cycle",
      "Bespoke private wealth management",
      "Priority on-chain & wire settlements",
      "Direct algorithmic hedging protocol",
      "Quarterly institutional audit certificates",
    ],
  },
];

const MASTER_TRADERS = [
  {
    name: "Alexandre Vance",
    handle: "@vance_alpha",
    winRate: "98.4%",
    monthlyRoi: "+184.2%",
    copiers: 1420,
    strategy: "Arbitrage & Perpetual Futures",
    badge: "Top Performer",
    initials: "AV",
  },
  {
    name: "Elena Rostova",
    handle: "@elena_quant",
    winRate: "96.8%",
    monthlyRoi: "+142.6%",
    copiers: 980,
    strategy: "Quantitative Forex & Macro",
    badge: "Consistent Yield",
    initials: "ER",
  },
  {
    name: "Marcus Thorne",
    handle: "@thorne_hedge",
    winRate: "95.2%",
    monthlyRoi: "+119.8%",
    copiers: 2150,
    strategy: "Global Equities & Breakouts",
    badge: "High Volume",
    initials: "MT",
  },
];

const FAQ_ITEMS = [
  {
    q: "How does Horizon Equity generate yield on managed allocations?",
    a: "Yields are generated through automated cross-market statistical arbitrage, market-making liquidity provision on digital asset and forex perpetuals, and structured fixed-income allocations backed by institutional counterparties.",
  },
  {
    q: "What deposit and withdrawal methods are supported?",
    a: "We natively support Bitcoin (BTC), Ethereum (ETH), Tether (USDT on ERC-20 / TRC-20), and Solana (SOL). Withdrawals are processed automatically through dedicated private node clusters with zero artificial holding delays.",
  },
  {
    q: "How is principal capital secured against market volatility?",
    a: "Over 98% of reserves are stored in geographically distributed, air-gapped cold vaults. Algorithmic hedging models dynamically adjust delta-neutral positions to protect capital during sharp market downturns.",
  },
  {
    q: "Can I compound my earnings automatically?",
    a: "Yes. All active investment tiers allow optional auto-renew and automated daily compounding, enabling your returns to compound seamlessly across consecutive maturity cycles.",
  },
  {
    q: "What regulatory and compliance standards are maintained?",
    a: "Horizon Equity operates under strict AML/KYC guidelines, performs regular internal and third-party smart contract audits, and maintains complete segregation between client deposits and operational treasury capital.",
  },
];

export default function HomePage() {
  const { t, dir } = useLanguage();
  const [calcPlan, setCalcPlan] = useState(INVESTMENT_PLANS[1]);
  const [calcAmount, setCalcAmount] = useState(5000);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const calcAmountId = useId();

  // Dynamic yields
  const dailyProfit = calcAmount * (calcPlan.dailyRate / 100);
  const totalProfit = dailyProfit * calcPlan.durationDays;
  const totalReturn = calcAmount + totalProfit;
  const netPercentage = ((totalProfit / calcAmount) * 100).toFixed(1);

  return (
    <div dir={dir} className="min-h-screen bg-[#0B0F14] text-[#F5F7FA] selection:bg-[#4388F5]/30">
      {/* ──────────────────────────────────────────
          GLOBAL NAVIGATION
          ────────────────────────────────────────── */}
      <PublicNav />

      {/* ──────────────────────────────────────────
          HERO SECTION
          ────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden border-b border-white/5">
        <div className="hero-backdrop" />
        <div className="hero-grid" />

        <div className="container-page relative z-10 flex flex-col items-center text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151F2B] border border-white/10 text-xs font-semibold text-[#A6B0BE] mb-6 animate-fade">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4388F5]" />
            <span>{t("hero_badge") || "Institutional Multi-Asset Financial Ecosystem"}</span>
          </div>

          {/* Heading */}
          <h1 className="t-display max-w-4xl font-semibold mb-6 animate-rise">
            {t("hero_title_1") || "One Platform."}{" "}
            <span className="text-[#4388F5]">{t("hero_title_2") || "Every Market."}</span>
          </h1>

          {/* Subtitle */}
          <p className="t-lead text-center mb-10 text-[#A6B0BE] animate-rise delay-1">
            {t("hero_subtitle") ||
              "Institutional execution across crypto perpetuals, automated fixed-yield allocations, forex liquidity, and sovereign securities. Transparent compounding returns backed by air-gapped custody."}
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mb-16 animate-rise delay-2">
            <Link
              href="/register"
              className="btn btn-primary btn-lg w-full sm:w-auto shadow-md"
            >
              <span>{t("hero_cta_invest") || "Start Investing"}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/plans"
              className="btn btn-secondary btn-lg w-full sm:w-auto"
            >
              <span>{t("hero_cta_explore") || "Explore Allocation Plans"}</span>
              <ChevronRight className="w-4 h-4 ml-0.5 text-[#7D8998]" />
            </Link>
          </div>

          {/* Key Metrics Strip (One unified container, crisp dividers) */}
          <div className="w-full max-w-5xl metric-strip text-left animate-rise delay-3">
            <div className="metric">
              <span className="metric-label">{t("hero_stat_vol") || "Aggregated Volume"}</span>
              <span className="metric-value">$2.48B+</span>
              <span className="metric-sub text-[#27C58B]">
                {t("hero_stat_vol_sub") || "+24% Year-over-Year"}
              </span>
            </div>

            <div className="metric">
              <span className="metric-label">{t("hero_stat_investors") || "Active Accounts"}</span>
              <span className="metric-value">142,500+</span>
              <span className="metric-sub">
                {t("hero_stat_investors_sub") || "140+ Global Jurisdictions"}
              </span>
            </div>

            <div className="metric">
              <span className="metric-label">{t("hero_stat_roi") || "Daily Yield Cap"}</span>
              <span className="metric-value">Up to 4.0%</span>
              <span className="metric-sub text-[#27C58B]">
                {t("hero_stat_roi_sub") || "Daily Automated Payouts"}
              </span>
            </div>

            <div className="metric">
              <span className="metric-label">{t("hero_stat_speed") || "Execution Latency"}</span>
              <span className="metric-value">&lt; 12ms</span>
              <span className="metric-sub">
                {t("hero_stat_speed_sub") || "Tier-1 Frankfurt / London"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          REAL-TIME MARKET TICKER TAPE
          ────────────────────────────────────────── */}
      <section
        className="py-3 bg-[#0B0F14] border-b border-white/10 overflow-hidden"
        aria-label="Market Data"
      >
        <div className="flex gap-4 items-center whitespace-nowrap overflow-x-auto scrollbar-none px-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7D8998] shrink-0 pr-4 border-r border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#27C58B] animate-pulse" />
            <span>Markets</span>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            {TICKER_ITEMS.map((item, idx) => (
              <Link
                key={idx}
                href="/markets"
                className="inline-flex items-center gap-2.5 text-xs font-medium hover:text-white transition-colors"
              >
                <span className="font-semibold text-[#F5F7FA]">{item.symbol}</span>
                <span className="num text-[#A6B0BE]">{item.price}</span>
                <span
                  className={`num font-semibold inline-flex items-center gap-0.5 ${
                    item.up ? "text-[#27C58B]" : "text-[#F06464]"
                  }`}
                >
                  {item.up ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {item.change}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          CORE CAPABILITIES / ECOSYSTEM PILLARS
          ────────────────────────────────────────── */}
      <section className="section" id="capabilities">
        <div className="container-page">
          <div className="max-w-2xl mb-14">
            <span className="t-eyebrow mb-2 block">{t("feat_badge") || "Architecture"}</span>
            <h2 className="t-section mb-3">
              {t("feat_title") || "Why and How We Stand Out"}
            </h2>
            <p className="t-body">
              {t("feat_subtitle") ||
                "Institutional financial engineering packaged into a seamless, high-yield digital environment."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Fixed Return */}
            <div className="panel p-6 sm:p-7 flex flex-col justify-between hover:border-white/20 transition-colors">
              <div>
                <div className="icon-tile mb-5 text-[#4388F5]">
                  <Percent className="w-5 h-5" />
                </div>
                <h3 className="t-card mb-2">{t("feat_fixed_title") || "Fixed Return Investment"}</h3>
                <p className="t-small text-[#A6B0BE] leading-relaxed mb-6">
                  {t("feat_fixed_desc") ||
                    "Automated capital allocation into non-correlated yield strategies with guaranteed daily compounding."}
                </p>
              </div>
              <Link
                href="/plans"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4388F5] hover:text-[#5A9AFF]"
              >
                <span>View Allocation Tiers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 2. Crypto Perpetuals */}
            <div className="panel p-6 sm:p-7 flex flex-col justify-between hover:border-white/20 transition-colors">
              <div>
                <div className="icon-tile mb-5 text-[#4388F5]">
                  <Coins className="w-5 h-5" />
                </div>
                <h3 className="t-card mb-2">{t("feat_crypto_title") || "Crypto Perpetuals"}</h3>
                <p className="t-small text-[#A6B0BE] leading-relaxed mb-6">
                  {t("feat_crypto_desc") ||
                    "Deep liquidity books for BTC, ETH, SOL, and 120+ pairs with zero slippage and sub-millisecond settlement."}
                </p>
              </div>
              <Link
                href="/markets"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4388F5] hover:text-[#5A9AFF]"
              >
                <span>Explore Orderbooks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 3. Global Forex Hub */}
            <div className="panel p-6 sm:p-7 flex flex-col justify-between hover:border-white/20 transition-colors">
              <div>
                <div className="icon-tile mb-5 text-[#4388F5]">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="t-card mb-2">{t("feat_forex_title") || "Global Forex Hub"}</h3>
                <p className="t-small text-[#A6B0BE] leading-relaxed mb-6">
                  {t("feat_forex_desc") ||
                    "Institutional pricing on G10 currency pairs with micro-pip spreads and automated liquidity aggregation."}
                </p>
              </div>
              <Link
                href="/markets"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4388F5] hover:text-[#5A9AFF]"
              >
                <span>Forex Liquidity</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 4. Global Equities */}
            <div className="panel p-6 sm:p-7 flex flex-col justify-between hover:border-white/20 transition-colors">
              <div>
                <div className="icon-tile mb-5 text-[#4388F5]">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="t-card mb-2">{t("feat_stocks_title") || "Global Equities"}</h3>
                <p className="t-small text-[#A6B0BE] leading-relaxed mb-6">
                  {t("feat_stocks_desc") ||
                    "Direct exposure to top global tech conglomerates, blue chips, and dividend-yielding industrial leaders."}
                </p>
              </div>
              <Link
                href="/markets"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4388F5] hover:text-[#5A9AFF]"
              >
                <span>Index Allocations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 5. Mirror Trading Protocol */}
            <div className="panel p-6 sm:p-7 flex flex-col justify-between hover:border-white/20 transition-colors">
              <div>
                <div className="icon-tile mb-5 text-[#4388F5]">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="t-card mb-2">{t("feat_copy_title") || "Mirror Trading Protocol"}</h3>
                <p className="t-small text-[#A6B0BE] leading-relaxed mb-6">
                  {t("feat_copy_desc") ||
                    "Follow verified master algorithmic traders and automatically mirror profitable execution signals in real-time."}
                </p>
              </div>
              <Link
                href="/copy-trading"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4388F5] hover:text-[#5A9AFF]"
              >
                <span>View Trader Leaderboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 6. Sovereign Bonds */}
            <div className="panel p-6 sm:p-7 flex flex-col justify-between hover:border-white/20 transition-colors">
              <div>
                <div className="icon-tile mb-5 text-[#4388F5]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="t-card mb-2">{t("feat_bonds_title") || "Sovereign Bonds"}</h3>
                <p className="t-small text-[#A6B0BE] leading-relaxed mb-6">
                  {t("feat_bonds_desc") ||
                    "Treasury-backed sovereign debt vehicles safeguarding your portfolio capital against market drawdowns."}
                </p>
              </div>
              <Link
                href="/security"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4388F5] hover:text-[#5A9AFF]"
              >
                <span>Compliance & Safeguards</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          STRUCTURED INVESTMENT PLANS
          ────────────────────────────────────────── */}
      <section className="section bg-[#0E141B] border-y border-white/5" id="plans">
        <div className="container-page">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="max-w-2xl">
              <span className="t-eyebrow mb-2 block">{t("plans_badge") || "Capital Strategies"}</span>
              <h2 className="t-section mb-3">
                {t("plans_title") || "Managed Intelligence."}
              </h2>
              <p className="t-body">
                {t("plans_subtitle") ||
                  "Structured investment tiers engineered for sustainable growth, daily liquidity, and full principal protection."}
              </p>
            </div>

            <Link
              href="/plans"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4388F5] hover:text-[#5A9AFF] shrink-0"
            >
              <span>Compare All Plan Specifications</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {INVESTMENT_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`panel p-6 sm:p-7 flex flex-col justify-between relative ${
                  plan.popular
                    ? "border-[#4388F5]/40 bg-[#131B26] shadow-lg"
                    : "bg-[#111821]"
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#A6B0BE]">
                      {plan.name}
                    </span>
                    <span
                      className={`badge ${
                        plan.popular ? "badge-accent font-semibold" : ""
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>

                  {/* Rate */}
                  <div className="mb-6 flex items-baseline gap-2">
                    <span className="num text-3xl sm:text-4xl font-bold text-[#F5F7FA]">
                      {plan.dailyRate}%
                    </span>
                    <span className="text-xs text-[#7D8998] font-medium">/ daily</span>
                  </div>

                  {/* Conditions List */}
                  <div className="inset p-3.5 mb-6 text-xs flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="text-[#7D8998]">Min Entry:</span>
                      <span className="num font-semibold text-white">
                        ${plan.minDeposit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7D8998]">Max Entry:</span>
                      <span className="num font-semibold text-white">
                        ${plan.maxDeposit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-2">
                      <span className="text-[#7D8998]">Cycle Duration:</span>
                      <span className="num font-semibold text-[#4388F5]">
                        {plan.durationDays} Days
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="flex flex-col gap-2.5 mb-8 text-xs text-[#A6B0BE]">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
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
        </div>
      </section>

      {/* ──────────────────────────────────────────
          INTERACTIVE GROWTH CALCULATOR
          ────────────────────────────────────────── */}
      <section className="section" id="calculator">
        <div className="container-page">
          <div className="panel max-w-4xl mx-auto p-7 sm:p-10 lg:p-12">
            <div className="max-w-xl mx-auto text-center mb-10">
              <span className="t-eyebrow mb-2 block">{t("calc_badge") || "Simulator"}</span>
              <h2 className="t-section mb-3">
                {t("calc_title") || "Project Your Financial Growth"}
              </h2>
              <p className="t-small text-[#A6B0BE]">
                {t("calc_subtitle") ||
                  "Select your preferred allocation tier and capital to simulate anticipated daily compounding returns."}
              </p>
            </div>

            {/* Plan Tier Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8">
              {INVESTMENT_PLANS.map((p) => {
                const isSelected = calcPlan.id === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => {
                      setCalcPlan(p);
                      if (calcAmount < p.minDeposit) setCalcAmount(p.minDeposit);
                      if (calcAmount > p.maxDeposit) setCalcAmount(p.maxDeposit);
                    }}
                    className={`p-3 rounded-md border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#151F2B] border-[#4388F5] text-white"
                        : "bg-[#111821] border-white/10 text-[#A6B0BE] hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <span className="block text-xs font-semibold text-white">
                      {p.name.split(" ")[0]}
                    </span>
                    <span className="num text-[11px] text-[#27C58B] mt-0.5 block font-medium">
                      {p.dailyRate}% Daily
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Capital Slider */}
            <div className="mb-10">
              <div className="flex justify-between items-baseline mb-3">
                <label
                  htmlFor={calcAmountId}
                  className="text-xs font-semibold uppercase tracking-wider text-[#A6B0BE]"
                >
                  {t("calc_capital") || "Investment Capital (USD)"}
                </label>
                <span className="num text-xl sm:text-2xl font-bold text-white bg-[#151F2B] px-3 py-1 rounded border border-white/10">
                  ${calcAmount.toLocaleString()}
                </span>
              </div>

              <input
                id={calcAmountId}
                type="range"
                min={calcPlan.minDeposit}
                max={calcPlan.maxDeposit}
                step={50}
                value={calcAmount}
                onChange={(e) => setCalcAmount(Number(e.target.value))}
                className="range"
                style={{
                  ["--fill" as any]: `${
                    ((calcAmount - calcPlan.minDeposit) /
                      (calcPlan.maxDeposit - calcPlan.minDeposit)) *
                    100
                  }%`,
                }}
              />

              <div className="flex justify-between text-xs text-[#7D8998] mt-2 num">
                <span>Min: ${calcPlan.minDeposit.toLocaleString()}</span>
                <span>Max: ${calcPlan.maxDeposit.toLocaleString()}</span>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 sm:p-6 rounded-lg bg-[#0B0F14] border border-white/10 mb-8">
              <div className="metric">
                <span className="metric-label">{t("calc_daily_profit") || "Daily Return"}</span>
                <span className="num text-xl sm:text-2xl font-bold text-[#27C58B]">
                  +${dailyProfit.toFixed(2)}
                </span>
              </div>

              <div className="metric">
                <span className="metric-label">{t("calc_duration") || "Duration"}</span>
                <span className="num text-xl sm:text-2xl font-bold text-white">
                  {calcPlan.durationDays} Days
                </span>
              </div>

              <div className="metric">
                <span className="metric-label">{t("calc_net_profit") || "Net Yield"}</span>
                <span className="num text-xl sm:text-2xl font-bold text-[#4388F5]">
                  +{netPercentage}%
                </span>
              </div>

              <div className="metric">
                <span className="metric-label">{t("calc_total_payout") || "Total Settlement"}</span>
                <span className="num text-xl sm:text-2xl font-bold text-white">
                  ${totalReturn.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action */}
            <div className="text-center">
              <Link
                href="/register"
                className="btn btn-primary btn-lg px-8 font-semibold shadow-md"
              >
                <span>{t("calc_cta") || "Proceed to Fund With This Allocation"}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          COPY TRADING SHOWCASE
          ────────────────────────────────────────── */}
      <section className="section bg-[#0E141B] border-y border-white/5" id="copy-trading">
        <div className="container-page">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="max-w-2xl">
              <span className="t-eyebrow mb-2 block">{t("copy_badge") || "Mirror Protocol"}</span>
              <h2 className="t-section mb-3">
                {t("copy_title") || "Mirror Verified Pros. Zero Manual Overhead."}
              </h2>
              <p className="t-body">
                {t("copy_subtitle") ||
                  "Follow elite quantitative traders with verified on-chain track records. Replicate trades automatically with customized stop-loss rules."}
              </p>
            </div>

            <Link
              href="/copy-trading"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4388F5] hover:text-[#5A9AFF] shrink-0"
            >
              <span>Explore All Verified Masters</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MASTER_TRADERS.map((trader, idx) => (
              <div key={idx} className="panel p-6 sm:p-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-[#151F2B] border border-white/10 flex items-center justify-center font-bold text-white text-sm">
                        {trader.initials}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-white">{trader.name}</h3>
                        <span className="text-xs text-[#7D8998]">{trader.handle}</span>
                      </div>
                    </div>
                    <span className="badge badge-accent text-[11px]">
                      {trader.badge}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-md bg-[#0B0F14] border border-white/10 mb-5">
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
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#A6B0BE] mb-6">
                    <span className="truncate pr-2">
                      Strategy: <strong className="text-white font-medium">{trader.strategy}</strong>
                    </span>
                    <span className="num shrink-0 text-[#7D8998]">
                      {trader.copiers.toLocaleString()} Copiers
                    </span>
                  </div>
                </div>

                <Link
                  href="/register"
                  className="btn btn-secondary btn-block text-xs font-semibold"
                >
                  <span>Mirror Strategy</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          SECURITY, COLD CUSTODY & GOVERNANCE
          ────────────────────────────────────────── */}
      <section className="section" id="security">
        <div className="container-page">
          <div className="max-w-2xl mb-14">
            <span className="t-eyebrow mb-2 block">{t("sec_badge") || "Governance"}</span>
            <h2 className="t-section mb-3">
              {t("sec_title") || "Regulated, Compliant, Trusted."}
            </h2>
            <p className="t-body">
              {t("sec_subtitle") ||
                "Multi-layer cryptography, rigorous custody audits, and redundant institutional security safeguards."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="panel p-6 sm:p-7">
              <div className="icon-tile mb-5 text-[#4388F5]">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="t-card mb-2">{t("sec_card1_title") || "Military AES-256 Storage"}</h3>
              <p className="t-small text-[#A6B0BE] leading-relaxed">
                {t("sec_card1_desc") ||
                  "98% of digital client reserves are held in geographically distributed, air-gapped cold vaults."}
              </p>
            </div>

            <div className="panel p-6 sm:p-7">
              <div className="icon-tile mb-5 text-[#4388F5]">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="t-card mb-2">{t("sec_card2_title") || "Instant Automated Clearings"}</h3>
              <p className="t-small text-[#A6B0BE] leading-relaxed">
                {t("sec_card2_desc") ||
                  "Withdrawals are audited and dispatched automatically across our dedicated nodes with zero manual delays."}
              </p>
            </div>

            <div className="panel p-6 sm:p-7">
              <div className="icon-tile mb-5 text-[#4388F5]">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="t-card mb-2">{t("sec_card3_title") || "24/7 Concierge Support"}</h3>
              <p className="t-small text-[#A6B0BE] leading-relaxed">
                {t("sec_card3_desc") ||
                  "Personalized portfolio assistance and round-the-clock priority ticketing available 24/7/365."}
              </p>
            </div>
          </div>

          <div className="panel p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-[#0E141B]">
            <div>
              <h4 className="t-title mb-1 text-white">Full Custodial Segregation Standards</h4>
              <p className="t-small text-[#A6B0BE]">
                Client capital is never co-mingled with platform operational reserves.
              </p>
            </div>
            <Link
              href="/security"
              className="btn btn-secondary btn-sm shrink-0 font-semibold"
            >
              <span>Review Custody Documentation</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          INSTITUTIONAL FAQ ACCORDION
          ────────────────────────────────────────── */}
      <section className="section bg-[#0E141B] border-t border-white/5" id="faq">
        <div className="container-page max-w-4xl">
          <div className="max-w-2xl mb-12">
            <span className="t-eyebrow mb-2 block">Knowledge Base</span>
            <h2 className="t-section mb-3">Frequently Asked Questions</h2>
            <p className="t-body">
              Clear answers regarding institutional execution, account tiers, and capital preservation.
            </p>
          </div>

          <div className="accordion">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="accordion-item">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="accordion-trigger"
                  >
                    <span>{item.q}</span>
                    <Plus className="w-4 h-4 shrink-0 transition-transform duration-200" />
                  </button>
                  {isOpen && (
                    <div className="accordion-panel animate-rise">
                      <p>{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          FINAL CALL TO ACTION
          ────────────────────────────────────────── */}
      <section className="section bg-[#0B0F14] border-t border-white/5">
        <div className="container-page text-center">
          <div className="panel max-w-3xl mx-auto p-8 sm:p-12 lg:p-14 bg-gradient-to-b from-[#111821] to-[#0D131A] border-white/10">
            <h2 className="t-section mb-4 font-semibold text-white">
              Ready to Allocate Capital With Institutional Rigor?
            </h2>
            <p className="t-body max-w-xl mx-auto mb-8 text-[#A6B0BE]">
              Open your multi-currency account in under two minutes. Access automated compounding yields and deep market liquidity.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="btn btn-primary btn-lg w-full sm:w-auto font-semibold shadow-md"
              >
                <span>Open Protected Account</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
              <Link
                href="/plans"
                className="btn btn-secondary btn-lg w-full sm:w-auto font-semibold"
              >
                <span>Review Terms &amp; Comparison</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          GLOBAL FOOTER
          ────────────────────────────────────────── */}
      <PublicFooter />
    </div>
  );
}
