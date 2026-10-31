"use client";

import { useState, useId } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Plus,
  Flame,
  Building2,
} from "lucide-react";
import PublicNav from "@/app/components/PublicNav";
import PublicFooter from "@/app/components/PublicFooter";
import MarketTicker from "@/app/components/MarketTicker";
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
    rate: 15.0,
    dailyRate: 15.0 / 2,
    durationDays: 2,
    minDeposit: 100,
    maxDeposit: 499,
    popular: false,
    features: [
      "15.0% fixed contract return",
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
    rate: 20.0,
    dailyRate: 20.0 / 3,
    durationDays: 3,
    minDeposit: 500,
    maxDeposit: 999,
    popular: true,
    features: [
      "20.0% fixed contract return",
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
    rate: 35.0,
    dailyRate: 35.0 / 7,
    durationDays: 7,
    minDeposit: 1000,
    maxDeposit: 4999,
    popular: false,
    features: [
      "35.0% fixed contract return",
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
  const { categories, ticker, isStale } = useMarketPrices();
  const [calcPlan, setCalcPlan] = useState(INVESTMENT_PLANS[1]);
  const [calcAmount, setCalcAmount] = useState(750);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const calcAmountId = useId();

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
        {/* Desktop full-bleed visual backdrop (lg and above) */}
        <div
          className="hidden lg:block absolute inset-y-0 right-0 w-[55%] xl:w-[60%] bg-cover bg-[center_right] pointer-events-none"
          style={{ backgroundImage: "url('/hero-multi-asset.jpg')" }}
        />
        {/* Directional desktop gradients preserving left-side text clarity while leaving right visual vibrant */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none bg-gradient-to-r from-[#080C12] via-[#080C12]/85 via-[45%] to-transparent" />
        <div className="hidden lg:block absolute inset-0 pointer-events-none bg-gradient-to-t from-[#080C12] via-transparent to-[#080C12]/60" />

        <div className="container-page relative z-10 py-12 sm:py-16 md:py-24">
          <div className="max-w-2xl lg:max-w-3xl text-left">
            {/* Supporting kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#111A26] border border-[#263345] text-xs font-mono text-[#A0AEC0] mb-5 sm:mb-6 animate-fade">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4C8DFF] animate-pulse" />
              <span className="tracking-wider uppercase font-semibold text-[11px]">
                {t("hero_kicker")}
              </span>
            </div>

            {/* Heading */}
            <h1 className="t-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 leading-[1.08] animate-rise">
              {t("hero_title_1")}<br />
              <span className="text-[#4C8DFF]">{t("hero_title_2")}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#A0AEC0] max-w-xl leading-relaxed mb-6 sm:mb-8 animate-rise delay-1 font-sans">
              {t("hero_subtitle")}
            </p>

            {/* Mobile & Tablet Dedicated Hero Visual Frame (Visible on mobile/tablet, never obscured by text) */}
            <div className="block lg:hidden my-6 w-full relative rounded-2xl overflow-hidden border border-[#263345] bg-[#0E1520] shadow-[0_12px_40px_rgba(0,0,0,0.6)] animate-rise delay-2 group">
              <div className="relative w-full aspect-[16/10] sm:aspect-[16/9]">
                <Image
                  src="/hero-multi-asset.jpg"
                  alt="Diversified Multi-Asset Institutional Markets - Gold Bullion, Digital Assets, Global Equities, Energy"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 50vw"
                  className="object-cover object-[72%_center]"
                />
                {/* Subtle vignette border gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080C12]/90 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />

                {/* Floating asset badge pills */}
                <div className="absolute bottom-2.5 inset-x-2.5 sm:bottom-3 sm:inset-x-3 flex items-center justify-between text-[11px] font-mono text-[#F1F5F9] pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#080C12]/85 backdrop-blur-md border border-[#263345] shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#31C48D] animate-pulse" />
                    <span className="text-[10px] sm:text-[11px] tracking-wide font-medium text-[#E2E8F0]">
                      Bullion · Crypto · Real Estate · Energy
                    </span>
                  </span>
                  <span className="hidden xs:inline-flex items-center px-2 py-0.5 rounded bg-[#080C12]/80 backdrop-blur-md text-[10px] text-[#A0AEC0] border border-white/5">
                    Multi-Asset Prime
                  </span>
                </div>
              </div>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-10 sm:mb-14 animate-rise delay-2">
              <Link
                href="/register"
                className="btn btn-primary btn-lg justify-center shadow-lg font-mono text-sm tracking-wide"
              >
                <span>{t("hero_cta_invest")}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>

              <Link
                href="/markets"
                className="btn btn-secondary btn-lg justify-center font-mono text-sm tracking-wide text-[#F1F5F9]"
              >
                <span>{t("hero_cta_explore")}</span>
                <ChevronRight className="w-4 h-4 ml-0.5 text-[#718096]" />
              </Link>
            </div>

            {/* Key Metrics Strip */}
            <div className="w-full max-w-2xl metric-strip text-left animate-rise delay-3">
              <div className="metric">
                <span className="metric-label">{t("hero_stat_vol_label")}</span>
                <span className="metric-value font-mono">{t("hero_stat_vol")}</span>
                <span className="metric-sub text-[#31C48D] font-mono">{t("hero_stat_vol_sub")}</span>
              </div>

              <div className="metric">
                <span className="metric-label">{t("hero_stat_investors_label")}</span>
                <span className="metric-value font-mono">{t("hero_stat_investors")}</span>
                <span className="metric-sub font-mono">{t("hero_stat_investors_sub")}</span>
              </div>

              <div className="metric">
                <span className="metric-label">{t("hero_stat_roi_label")}</span>
                <span className="metric-value font-mono">{t("hero_stat_roi")}</span>
                <span className="metric-sub text-[#31C48D] font-mono">{t("hero_stat_roi_sub")}</span>
              </div>

              <div className="metric">
                <span className="metric-label">{t("hero_stat_speed_label")}</span>
                <span className="metric-value font-mono">{t("hero_stat_speed")}</span>
                <span className="metric-sub font-mono">{t("hero_stat_speed_sub")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          REAL-TIME MARKET TICKER TAPE (CONTINUOUS SCROLLING)
          ────────────────────────────────────────── */}
      <MarketTicker
        items={ticker.length > 0 ? ticker : categories.flatMap((c) => c.items)}
        isStale={isStale}
      />

      {/* ──────────────────────────────────────────
          CORE CAPABILITIES / ECOSYSTEM PILLARS
          ────────────────────────────────────────── */}
      <section className="section" id="capabilities">
        <div className="container-page">
          <div className="max-w-2xl mb-14">
            <span className="t-eyebrow mb-2 block">{t("feat_badge")}</span>
            <h2 className="t-section mb-3">
              {t("feat_title")}
            </h2>
            <p className="t-body">
              {t("feat_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Precious Metals & Bullion */}
            <div className="panel p-6 sm:p-7 flex flex-col justify-between hover:border-[#4C8DFF]/30 transition-colors bg-[#111A26] border border-[#263345]">
              <div>
                <div className="icon-tile mb-5 text-[#4C8DFF] bg-[#172333]">
                  <Coins className="w-5 h-5" />
                </div>
                <h3 className="t-card mb-2 font-mono text-white">{t("feat_metals_title")}</h3>
                <p className="t-small text-[#A0AEC0] leading-relaxed mb-6">
                  {t("feat_metals_desc")}
                </p>
              </div>
              <Link
                href="/markets"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#4C8DFF] hover:text-[#6AA3FF]"
              >
                <span>{t("feat_metals_link")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 2. Crypto Perpetuals */}
            <div className="panel p-6 sm:p-7 flex flex-col justify-between hover:border-[#4C8DFF]/30 transition-colors bg-[#111A26] border border-[#263345]">
              <div>
                <div className="icon-tile mb-5 text-[#4C8DFF] bg-[#172333]">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="t-card mb-2 font-mono text-white">{t("feat_crypto_title")}</h3>
                <p className="t-small text-[#A0AEC0] leading-relaxed mb-6">
                  {t("feat_crypto_desc")}
                </p>
              </div>
              <Link
                href="/markets"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#4C8DFF] hover:text-[#6AA3FF]"
              >
                <span>{t("feat_crypto_link")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 3. Global Forex Hub */}
            <div className="panel p-6 sm:p-7 flex flex-col justify-between hover:border-[#4C8DFF]/30 transition-colors bg-[#111A26] border border-[#263345]">
              <div>
                <div className="icon-tile mb-5 text-[#4C8DFF] bg-[#172333]">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="t-card mb-2 font-mono text-white">{t("feat_forex_title")}</h3>
                <p className="t-small text-[#A0AEC0] leading-relaxed mb-6">
                  {t("feat_forex_desc")}
                </p>
              </div>
              <Link
                href="/markets"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#4C8DFF] hover:text-[#6AA3FF]"
              >
                <span>{t("feat_forex_link")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 4. Oil, Gas & Energy */}
            <div className="panel p-6 sm:p-7 flex flex-col justify-between hover:border-[#4C8DFF]/30 transition-colors bg-[#111A26] border border-[#263345]">
              <div>
                <div className="icon-tile mb-5 text-[#4C8DFF] bg-[#172333]">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="t-card mb-2 font-mono text-white">{t("feat_energy_title")}</h3>
                <p className="t-small text-[#A0AEC0] leading-relaxed mb-6">
                  {t("feat_energy_desc")}
                </p>
              </div>
              <Link
                href="/markets"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#4C8DFF] hover:text-[#6AA3FF]"
              >
                <span>{t("feat_energy_link")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 5. Real Estate & Property */}
            <div className="panel p-6 sm:p-7 flex flex-col justify-between hover:border-[#4C8DFF]/30 transition-colors bg-[#111A26] border border-[#263345]">
              <div>
                <div className="icon-tile mb-5 text-[#4C8DFF] bg-[#172333]">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="t-card mb-2 font-mono text-white">{t("feat_realestate_title")}</h3>
                <p className="t-small text-[#A0AEC0] leading-relaxed mb-6">
                  {t("feat_realestate_desc")}
                </p>
              </div>
              <Link
                href="/markets"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#4C8DFF] hover:text-[#6AA3FF]"
              >
                <span>{t("feat_realestate_link")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 6. Mirror Trading Protocol */}
            <div className="panel p-6 sm:p-7 flex flex-col justify-between hover:border-[#4C8DFF]/30 transition-colors bg-[#111A26] border border-[#263345]">
              <div>
                <div className="icon-tile mb-5 text-[#4C8DFF] bg-[#172333]">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="t-card mb-2 font-mono text-white">{t("feat_copy_title")}</h3>
                <p className="t-small text-[#A0AEC0] leading-relaxed mb-6">
                  {t("feat_copy_desc")}
                </p>
              </div>
              <Link
                href="/copy-trading"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#4C8DFF] hover:text-[#6AA3FF]"
              >
                <span>{t("feat_copy_link")}</span>
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
                {t("plans_badge")}
              </span>
              <h2 className="t-section mb-3 font-mono text-white">
                {t("plans_title")}
              </h2>
              <p className="t-body text-[#A0AEC0]">
                {t("plans_subtitle")}
              </p>
            </div>

            <Link
              href="/plans"
              className="inline-flex items-center gap-1.5 text-sm font-mono font-semibold text-[#4C8DFF] hover:text-[#6AA3FF] shrink-0"
            >
              <span>{t("plans_compare_link")}</span>
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
                      {t(plan.name)}
                    </span>
                    <span
                      className={`badge text-[10px] font-mono ${
                        plan.popular
                          ? "badge-accent font-semibold"
                          : "bg-[#172333] text-[#A0AEC0] border border-[#263345]"
                      }`}
                    >
                      {t(plan.badge)}
                    </span>
                  </div>

                  {/* Rate */}
                  <div className="mb-6 flex items-baseline gap-2">
                    <span className="num font-mono text-3xl sm:text-4xl font-bold text-white">
                      {plan.rate.toFixed(1)}%
                    </span>
                    <span className="text-xs text-[#718096] font-mono">{t("plans_net_roi")}</span>
                  </div>

                  {/* Conditions List */}
                  <div className="inset p-3.5 mb-6 text-xs flex flex-col gap-2 bg-[#0D131C] border border-[#263345] rounded">
                    <div className="flex justify-between">
                      <span className="text-[#718096]">{t("plans_min")}</span>
                      <span className="num font-mono font-semibold text-white">
                        ${plan.minDeposit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#718096]">{t("plans_max")}</span>
                      <span className="num font-mono font-semibold text-white">
                        {plan.isUnlimited ? t("plans_unlimited") : `$${plan.maxDeposit.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-[#263345] pt-2">
                      <span className="text-[#718096]">{t("plans_duration")}</span>
                      <span className="num font-mono font-semibold text-[#4C8DFF]">
                        {plan.durationDays} {t("plans_days")}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="flex flex-col gap-2.5 mb-8 text-xs text-[#A0AEC0]">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#31C48D] shrink-0 mt-0.5" />
                        <span>{t(feat)}</span>
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
                  <span>{t(`Select ${plan.name.split(" ")[0]}`)}</span>
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
              <span className="t-eyebrow mb-2 block font-mono text-[#4C8DFF]">{t("calc_badge")}</span>
              <h2 className="t-section mb-3 font-mono text-white">
                {t("calc_title")}
              </h2>
              <p className="t-small text-[#A0AEC0]">
                {t("calc_subtitle")}
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
                      {t(p.name)}
                    </span>
                    <span className="num font-mono text-[11px] text-[#31C48D] mt-0.5 block font-medium">
                      +{p.rate}% {t("plans_net_roi")}
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
                  {t("calc_capital")}
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
                  ["--fill" as string]: `${
                    ((calcAmount - calcPlan.minDeposit) /
                      (calcPlan.maxDeposit - calcPlan.minDeposit)) *
                    100
                  }%`,
                }}
              />

              <div className="flex justify-between text-xs text-[#718096] mt-2 num font-mono">
                <span>{t(`Min: $${calcPlan.minDeposit.toLocaleString()}`)}</span>
                <span>
                  {calcPlan.isUnlimited
                    ? t("Unlimited ($5,000+ Permitted)")
                    : t(`Max: $${calcPlan.maxDeposit.toLocaleString()}`)}
                </span>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 sm:p-6 rounded-lg bg-[#0D131C] border border-[#263345] mb-8">
              <div className="metric">
                <span className="metric-label">{t("calc_daily_profit")}</span>
                <span className="num font-mono text-xl sm:text-2xl font-bold text-[#31C48D]">
                  +${dailyProfit.toFixed(2)}
                </span>
              </div>

              <div className="metric">
                <span className="metric-label">{t("calc_duration")}</span>
                <span className="num font-mono text-xl sm:text-2xl font-bold text-white">
                  {calcPlan.durationDays} {t("plans_days")}
                </span>
              </div>

              <div className="metric">
                <span className="metric-label">{t("calc_net_profit")}</span>
                <span className="num font-mono text-xl sm:text-2xl font-bold text-[#4C8DFF]">
                  +{netPercentage}%
                </span>
              </div>

              <div className="metric">
                <span className="metric-label">{t("calc_total_payout")}</span>
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
                <span>{t("calc_cta")}</span>
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
              <span className="t-eyebrow mb-2 block">{t("copy_badge")}</span>
              <h2 className="t-section mb-3">
                {t("copy_title")}
              </h2>
              <p className="t-body">
                {t("copy_subtitle")}
              </p>
            </div>

            <Link
              href="/copy-trading"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4388F5] hover:text-[#5A9AFF] shrink-0"
            >
              <span>{t("copy_explore_all")}</span>
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
                      {t(trader.badge)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-md bg-[#0B0F14] border border-white/10 mb-5">
                    <div>
                      <span className="text-[10px] text-[#7D8998] uppercase font-semibold block">
                        {t("copy_win_rate")}
                      </span>
                      <span className="num text-base font-bold text-[#27C58B]">
                        {trader.winRate}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7D8998] uppercase font-semibold block">
                        {t("copy_return")}
                      </span>
                      <span className="num text-base font-bold text-[#4388F5]">
                        {trader.monthlyRoi}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#A6B0BE] mb-6">
                    <span className="truncate pr-2">
                      {t("copy_strategy_label")}{" "}
                      <strong className="text-white font-medium">{t(trader.strategy)}</strong>
                    </span>
                    <span className="num shrink-0 text-[#7D8998]">
                      {trader.copiers.toLocaleString()} {t("copy_copiers")}
                    </span>
                  </div>
                </div>

                <Link
                  href="/register"
                  className="btn btn-secondary btn-block text-xs font-semibold"
                >
                  <span>{t("copy_mirror_btn")}</span>
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
            <span className="t-eyebrow mb-2 block">{t("sec_badge")}</span>
            <h2 className="t-section mb-3">
              {t("sec_title")}
            </h2>
            <p className="t-body">
              {t("sec_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="panel p-6 sm:p-7">
              <div className="icon-tile mb-5 text-[#4388F5]">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="t-card mb-2">{t("sec_card1_title")}</h3>
              <p className="t-small text-[#A6B0BE] leading-relaxed">
                {t("sec_card1_desc")}
              </p>
            </div>

            <div className="panel p-6 sm:p-7">
              <div className="icon-tile mb-5 text-[#4388F5]">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="t-card mb-2">{t("sec_card2_title")}</h3>
              <p className="t-small text-[#A6B0BE] leading-relaxed">
                {t("sec_card2_desc")}
              </p>
            </div>

            <div className="panel p-6 sm:p-7">
              <div className="icon-tile mb-5 text-[#4388F5]">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="t-card mb-2">{t("sec_card3_title")}</h3>
              <p className="t-small text-[#A6B0BE] leading-relaxed">
                {t("sec_card3_desc")}
              </p>
            </div>
          </div>

          <div className="panel p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-[#0E141B]">
            <div>
              <h4 className="t-title mb-1 text-white">{t("sec_segregation_title")}</h4>
              <p className="t-small text-[#A6B0BE]">
                {t("sec_segregation_desc")}
              </p>
            </div>
            <Link
              href="/security"
              className="btn btn-secondary btn-sm shrink-0 font-semibold"
            >
              <span>{t("sec_segregation_btn")}</span>
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
            <span className="t-eyebrow mb-2 block">{t("faq_badge")}</span>
            <h2 className="t-section mb-3">{t("faq_title")}</h2>
            <p className="t-body">
              {t("faq_subtitle")}
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
                    <span>{t(item.q)}</span>
                    <Plus className="w-4 h-4 shrink-0 transition-transform duration-200" />
                  </button>
                  {isOpen && (
                    <div className="accordion-panel animate-rise">
                      <p>{t(item.a)}</p>
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
              {t("cta_title")}
            </h2>
            <p className="t-body max-w-xl mx-auto mb-8 text-[#A6B0BE]">
              {t("cta_subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="btn btn-primary btn-lg w-full sm:w-auto font-semibold shadow-md"
              >
                <span>{t("cta_primary")}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
              <Link
                href="/plans"
                className="btn btn-secondary btn-lg w-full sm:w-auto font-semibold"
              >
                <span>{t("cta_secondary")}</span>
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
