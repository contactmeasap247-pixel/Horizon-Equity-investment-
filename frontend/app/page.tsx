"use client";

import { useState, useId } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Coins,
  Globe,
  Users,
  CheckCircle2,
  Lock,
  Zap,
  Headphones,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Flame,
  Building2,
} from "lucide-react";
import PublicNav from "@/app/components/PublicNav";
import PublicFooter from "@/app/components/PublicFooter";
import { useLanguage } from "@/lib/language-context";
import { useMarketPrices } from "@/lib/use-market-prices";

/* ---------------------------------------------------------------------
   DATA DEFINITIONS
   --------------------------------------------------------------------- */



const INVESTMENT_PLANS = [
  {
    id: "silver",
    name: "Silver Tier",
    badge: "Entry Tier",
    rate: 8.0,
    dailyRate: 8.0 / 2,
    durationDays: 2,
    minDeposit: 100,
    maxDeposit: 499,
    popular: false,
    features: [
      "8.0% fixed contract return",
      "2-day maturity period",
      "Automatic principal return on maturity",
      "Supported: BTC, ETH, USDT, SOL",
      "Standard email & ticketing liaison",
    ],
  },
  {
    id: "gold",
    name: "Gold Tier",
    badge: "Most Popular",
    rate: 16.0,
    dailyRate: 16.0 / 3,
    durationDays: 3,
    minDeposit: 500,
    maxDeposit: 999,
    popular: true,
    features: [
      "16.0% fixed contract return",
      "3-day maturity period",
      "Daily automated yield compounding",
      "Priority automated withdrawal channel",
      "Dedicated account portfolio strategist",
      "Zero management or performance exit fees",
    ],
  },
  {
    id: "platinum",
    name: "Platinum Tier",
    badge: "Institutional",
    rate: 28.0,
    dailyRate: 28.0 / 7,
    durationDays: 7,
    minDeposit: 1000,
    maxDeposit: 4999,
    popular: false,
    features: [
      "28.0% fixed contract return",
      "7-day maturity period (1 week)",
      "Institutional orderbook routing",
      "Direct VIP communication desk",
      "Multi-asset algorithmic hedging protocol",
      "Principal insurance protection guarantee",
    ],
  },
  {
    id: "diamond",
    name: "Diamond Tier",
    badge: "VIP Unlimited",
    rate: 45.0,
    dailyRate: 45.0 / 7,
    durationDays: 7,
    minDeposit: 5000,
    maxDeposit: 100000, // Slider ceiling
    isUnlimited: true,
    popular: false,
    features: [
      "45.0% fixed contract return",
      "7-day maximum compounding cycle (1 week)",
      "Unlimited capital allocation ceiling",
      "Bespoke private wealth management",
      "Priority on-chain & wire settlements",
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
  const { rates, categories } = useMarketPrices();
  const [calcPlan, setCalcPlan] = useState(INVESTMENT_PLANS[1]);
  const [calcAmount, setCalcAmount] = useState(750);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const calcAmountId = useId();

  // Real-time dynamic ticker items from live streaming rates
  const liveTickerItems = categories.length > 0
    ? categories.flatMap((c) => c.items)
    : [
        { symbol: "BTC/USD", name: "Bitcoin", price: `$${rates.BTC.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: "+1.84%", up: true },
        { symbol: "ETH/USD", name: "Ethereum", price: `$${rates.ETH.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: "-0.42%", up: false },
        { symbol: "SOL/USD", name: "Solana", price: `$${rates.SOL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: "+3.15%", up: true },
        { symbol: "GOLD", name: "Gold Spot", price: `$${rates.GOLD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: "+0.85%", up: true },
        { symbol: "SILVER", name: "Silver Spot", price: `$${rates.SILVER.toFixed(2)}`, change: "+1.12%", up: true },
        { symbol: "EUR/USD", name: "Euro / USD", price: rates.EUR_USD.toFixed(4), change: "+0.18%", up: true },
        { symbol: "CRUDE", name: "Brent Crude", price: `$${rates.CRUDE.toFixed(2)}`, change: "-0.65%", up: false },
        { symbol: "SPX", name: "S&P 500", price: rates.SPX.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), change: "+0.72%", up: true },
      ];

  // Dynamic yields
  const totalProfit = calcAmount * (calcPlan.rate / 100);
  const dailyProfit = totalProfit / calcPlan.durationDays;
  const totalReturn = calcAmount + totalProfit;
  const netPercentage = calcPlan.rate.toFixed(1);

  return (
    <div dir={dir} className="min-h-screen bg-[#080C12] text-[#F1F5F9] selection:bg-[#4C8DFF]/30">
      {/* ──────────────────────────────────────────
          GLOBAL NAVIGATION
          ────────────────────────────────────────── */}
      <PublicNav />

      {/* ──────────────────────────────────────────
          HERO SECTION (MULTI-ASSET TRADING)
          ────────────────────────────────────────── */}
      <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center overflow-hidden border-b border-[#263345]">
        {/* Background image & deep directional navy gradient overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center lg:bg-right pointer-events-none"
          style={{ backgroundImage: "url('/hero-multi-asset.jpg')" }}
        />
        {/* Left 55-60% clean contrast gradient: 080C12 -> 080C12/95 via 60% -> 080C12/35 */}
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#080C12] via-[#080C12]/95 via-[55%] md:via-[60%] to-[#080C12]/40"
        />
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#080C12] via-transparent to-[#080C12]/70"
        />

        <div className="container-page relative z-10 py-16 md:py-24">
          <div className="max-w-2xl lg:max-w-3xl text-left">
            {/* Supporting kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#111A26] border border-[#263345] text-xs font-mono text-[#A0AEC0] mb-6 animate-fade">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4C8DFF] animate-pulse" />
              <span className="tracking-wider uppercase font-semibold text-[11px]">
                METALS · CRYPTO · FOREX · ENERGY · REAL ESTATE
              </span>
            </div>

            {/* Heading */}
            <h1 className="t-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.08] animate-rise">
              Trade Beyond<br />
              <span className="text-[#4C8DFF]">a Single Market.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#A0AEC0] max-w-xl leading-relaxed mb-8 animate-rise delay-1 font-sans">
              Explore opportunities across precious metals, crypto, forex, energy, and real estate through one connected investment platform.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-14 animate-rise delay-2">
              <Link
                href="/register"
                className="btn btn-primary btn-lg justify-center shadow-lg font-mono text-sm tracking-wide"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>

              <Link
                href="/markets"
                className="btn btn-secondary btn-lg justify-center font-mono text-sm tracking-wide text-[#F1F5F9]"
              >
                <span>Explore Markets</span>
                <ChevronRight className="w-4 h-4 ml-0.5 text-[#718096]" />
              </Link>
            </div>

            {/* Key Metrics Strip */}
            <div className="w-full max-w-2xl metric-strip text-left animate-rise delay-3">
              <div className="metric">
                <span className="metric-label">Aggregated Volume</span>
                <span className="metric-value font-mono">$2.48B+</span>
                <span className="metric-sub text-[#31C48D] font-mono">+24% YoY</span>
              </div>

              <div className="metric">
                <span className="metric-label">Active Desks</span>
                <span className="metric-value font-mono">142,500+</span>
                <span className="metric-sub font-mono">140+ Jurisdictions</span>
              </div>

              <div className="metric">
                <span className="metric-label">Yield Ceiling</span>
                <span className="metric-value font-mono">Up to 45%</span>
                <span className="metric-sub text-[#31C48D] font-mono">Fixed Maturity</span>
              </div>

              <div className="metric">
                <span className="metric-label">Execution Latency</span>
                <span className="metric-value font-mono">&lt; 12ms</span>
                <span className="metric-sub font-mono">London / Tokyo</span>
              </div>
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
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7D8998] shrink-0 pr-4 border-r border-white/10 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#27C58B] animate-pulse" />
            <span>LIVE MARKETS</span>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            {liveTickerItems.map((item, idx) => (
              <Link
                key={idx}
                href="/markets"
                className="inline-flex items-center gap-2.5 text-xs font-medium hover:text-white transition-colors"
              >
                <span className="font-semibold text-[#F5F7FA] font-mono">{item.symbol}</span>
                <span className="num text-[#A6B0BE] font-mono">{item.price}</span>
                <span
                  className={`num font-semibold inline-flex items-center gap-0.5 font-mono ${
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
            {/* 1. Precious Metals & Bullion */}
            <div className="panel p-6 sm:p-7 flex flex-col justify-between hover:border-[#4C8DFF]/30 transition-colors bg-[#111A26] border border-[#263345]">
              <div>
                <div className="icon-tile mb-5 text-[#4C8DFF] bg-[#172333]">
                  <Coins className="w-5 h-5" />
                </div>
                <h3 className="t-card mb-2 font-mono text-white">Precious Metals &amp; Bullion</h3>
                <p className="t-small text-[#A0AEC0] leading-relaxed mb-6">
                  Physical gold and silver allocations vaulted in Zurich and London with spot liquidity, instant settlement, and audit guarantees.
                </p>
              </div>
              <Link
                href="/markets"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#4C8DFF] hover:text-[#6AA3FF]"
              >
                <span>Spot Metals Orderbook</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 2. Crypto Perpetuals */}
            <div className="panel p-6 sm:p-7 flex flex-col justify-between hover:border-[#4C8DFF]/30 transition-colors bg-[#111A26] border border-[#263345]">
              <div>
                <div className="icon-tile mb-5 text-[#4C8DFF] bg-[#172333]">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="t-card mb-2 font-mono text-white">Cryptocurrency Perpetuals</h3>
                <p className="t-small text-[#A0AEC0] leading-relaxed mb-6">
                  Sub-millisecond execution across BTC, ETH, SOL, and 120+ digital asset pairs backed by cold multi-sig custody.
                </p>
              </div>
              <Link
                href="/markets"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#4C8DFF] hover:text-[#6AA3FF]"
              >
                <span>Digital Asset Orderbooks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 3. Global Forex Hub */}
            <div className="panel p-6 sm:p-7 flex flex-col justify-between hover:border-[#4C8DFF]/30 transition-colors bg-[#111A26] border border-[#263345]">
              <div>
                <div className="icon-tile mb-5 text-[#4C8DFF] bg-[#172333]">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="t-card mb-2 font-mono text-white">Global Forex Desks</h3>
                <p className="t-small text-[#A0AEC0] leading-relaxed mb-6">
                  Institutional pricing across G10 and emerging currency pairs with micro-pip spreads and aggregated Tier-1 liquidity.
                </p>
              </div>
              <Link
                href="/markets"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#4C8DFF] hover:text-[#6AA3FF]"
              >
                <span>G10 Currency Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 4. Oil, Gas & Energy */}
            <div className="panel p-6 sm:p-7 flex flex-col justify-between hover:border-[#4C8DFF]/30 transition-colors bg-[#111A26] border border-[#263345]">
              <div>
                <div className="icon-tile mb-5 text-[#4C8DFF] bg-[#172333]">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="t-card mb-2 font-mono text-white">Oil, Gas &amp; Energy</h3>
                <p className="t-small text-[#A0AEC0] leading-relaxed mb-6">
                  Exposure to global benchmark Brent crude, West Texas Intermediate, natural gas, and sustainable energy infrastructure yield.
                </p>
              </div>
              <Link
                href="/markets"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#4C8DFF] hover:text-[#6AA3FF]"
              >
                <span>Energy Contracts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 5. Real Estate & Property */}
            <div className="panel p-6 sm:p-7 flex flex-col justify-between hover:border-[#4C8DFF]/30 transition-colors bg-[#111A26] border border-[#263345]">
              <div>
                <div className="icon-tile mb-5 text-[#4C8DFF] bg-[#172333]">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="t-card mb-2 font-mono text-white">Real Estate Syndicates</h3>
                <p className="t-small text-[#A0AEC0] leading-relaxed mb-6">
                  Commercial property debt and fractional ownership of premium metropolitan developments with quarterly rent yield distributions.
                </p>
              </div>
              <Link
                href="/markets"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#4C8DFF] hover:text-[#6AA3FF]"
              >
                <span>Property Portfolios</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 6. Mirror Trading Protocol */}
            <div className="panel p-6 sm:p-7 flex flex-col justify-between hover:border-[#4C8DFF]/30 transition-colors bg-[#111A26] border border-[#263345]">
              <div>
                <div className="icon-tile mb-5 text-[#4C8DFF] bg-[#172333]">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="t-card mb-2 font-mono text-white">Mirror Trading Protocol</h3>
                <p className="t-small text-[#A0AEC0] leading-relaxed mb-6">
                  Replicate verified master quantitative traders automatically in real-time with customizable stop-loss rules and transparent win-rates.
                </p>
              </div>
              <Link
                href="/copy-trading"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#4C8DFF] hover:text-[#6AA3FF]"
              >
                <span>View Trader Leaderboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          STRUCTURED INVESTMENT PLANS
          ────────────────────────────────────────── */}
      <section className="section bg-[#0D131C] border-y border-[#263345]" id="plans">
        <div className="container-page">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="max-w-2xl">
              <span className="t-eyebrow mb-2 block font-mono text-[#4C8DFF]">
                STRUCTURED CAPITAL STRATEGIES
              </span>
              <h2 className="t-section mb-3 font-mono text-white">
                Fixed-Yield Investment Tiers
              </h2>
              <p className="t-body text-[#A0AEC0]">
                Four distinct allocation tiers engineered for capital preservation, institutional arbitrage, and guaranteed maturity payouts.
              </p>
            </div>

            <Link
              href="/plans"
              className="inline-flex items-center gap-1.5 text-sm font-mono font-semibold text-[#4C8DFF] hover:text-[#6AA3FF] shrink-0"
            >
              <span>Compare All Plan Specifications</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {INVESTMENT_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`panel p-6 sm:p-7 flex flex-col justify-between relative border ${
                  plan.popular
                    ? "border-[#4C8DFF] bg-[#131B26] shadow-xl"
                    : "border-[#263345] bg-[#111A26] hover:border-[#4C8DFF]/40"
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-4">
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

                  {/* Rate */}
                  <div className="mb-6 flex items-baseline gap-2">
                    <span className="num font-mono text-3xl sm:text-4xl font-bold text-white">
                      {plan.rate.toFixed(1)}%
                    </span>
                    <span className="text-xs text-[#718096] font-mono">Net Fixed ROI</span>
                  </div>

                  {/* Conditions List */}
                  <div className="inset p-3.5 mb-6 text-xs flex flex-col gap-2 bg-[#0D131C] border border-[#263345] rounded">
                    <div className="flex justify-between">
                      <span className="text-[#718096]">Min Entry:</span>
                      <span className="num font-mono font-semibold text-white">
                        ${plan.minDeposit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#718096]">Max Entry:</span>
                      <span className="num font-mono font-semibold text-white">
                        {plan.isUnlimited ? "Unlimited" : `$${plan.maxDeposit.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-[#263345] pt-2">
                      <span className="text-[#718096]">Cycle Duration:</span>
                      <span className="num font-mono font-semibold text-[#4C8DFF]">
                        {plan.durationDays} Days
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="flex flex-col gap-2.5 mb-8 text-xs text-[#A0AEC0]">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
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
        </div>
      </section>

      {/* ──────────────────────────────────────────
          INTERACTIVE GROWTH CALCULATOR
          ────────────────────────────────────────── */}
      <section className="section bg-[#080C12]" id="calculator">
        <div className="container-page">
          <div className="panel max-w-4xl mx-auto p-7 sm:p-10 lg:p-12 bg-[#111A26] border border-[#263345]">
            <div className="max-w-xl mx-auto text-center mb-10">
              <span className="t-eyebrow mb-2 block font-mono text-[#4C8DFF]">SIMULATOR</span>
              <h2 className="t-section mb-3 font-mono text-white">
                Project Your Investment Yield
              </h2>
              <p className="t-small text-[#A0AEC0]">
                Select your preferred structured tier and principal amount to simulate anticipated maturity settlement and returns.
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
                    className={`p-3.5 rounded-md border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#172333] border-[#4C8DFF] text-white shadow-md"
                        : "bg-[#0D131C] border-[#263345] text-[#A0AEC0] hover:border-[#4C8DFF]/40 hover:text-white"
                    }`}
                  >
                    <span className="block text-xs font-mono font-semibold text-white">
                      {p.name.split(" ")[0]}
                    </span>
                    <span className="num font-mono text-[11px] text-[#31C48D] mt-0.5 block font-medium">
                      +{p.rate}% Net ROI
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
                  className="text-xs font-mono uppercase tracking-wider text-[#A0AEC0]"
                >
                  Investment Capital (USD)
                </label>
                <span className="num font-mono text-xl sm:text-2xl font-bold text-white bg-[#0D131C] px-3 py-1 rounded border border-[#263345]">
                  ${calcAmount.toLocaleString()}
                </span>
              </div>

              <input
                id={calcAmountId}
                type="range"
                min={calcPlan.minDeposit}
                max={calcPlan.maxDeposit}
                step={calcPlan.minDeposit >= 1000 ? 250 : 25}
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

              <div className="flex justify-between text-xs text-[#718096] mt-2 num font-mono">
                <span>Min: ${calcPlan.minDeposit.toLocaleString()}</span>
                <span>
                  {calcPlan.isUnlimited ? "Unlimited ($5,000+ Permitted)" : `Max: $${calcPlan.maxDeposit.toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 sm:p-6 rounded-lg bg-[#0D131C] border border-[#263345] mb-8">
              <div className="metric">
                <span className="metric-label">{t("calc_daily_profit") || "Daily Return"}</span>
                <span className="num font-mono text-xl sm:text-2xl font-bold text-[#31C48D]">
                  +${dailyProfit.toFixed(2)}
                </span>
              </div>

              <div className="metric">
                <span className="metric-label">{t("calc_duration") || "Duration"}</span>
                <span className="num font-mono text-xl sm:text-2xl font-bold text-white">
                  {calcPlan.durationDays} Days
                </span>
              </div>

              <div className="metric">
                <span className="metric-label">{t("calc_net_profit") || "Net Yield"}</span>
                <span className="num font-mono text-xl sm:text-2xl font-bold text-[#4C8DFF]">
                  +{netPercentage}%
                </span>
              </div>

              <div className="metric">
                <span className="metric-label">{t("calc_total_payout") || "Total Settlement"}</span>
                <span className="num font-mono text-xl sm:text-2xl font-bold text-white">
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
