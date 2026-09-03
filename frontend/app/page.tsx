"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  TrendingUp,
  ShieldCheck,
  Users,
  Layers,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Zap,
  Crown,
  Award,
  Clock,
  Gift,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Menu,
  X,
  Building2,
  Coins,
  Flame,
  Globe,
  Gem,
  Lock,
  Briefcase,
  UserPlus,
  Wallet,
  BarChart3,
  CheckCircle2,
  Eye,
  Headphones,
} from "lucide-react";

/* ──────────────────────────────────────────
   STATIC DATA
   ────────────────────────────────────────── */

const tickerItems = [
  { symbol: "SPX", name: "S&P 500", price: "5,432.10", change: "+0.85%", up: true },
  { symbol: "GOLD", name: "Gold Spot", price: "$2,510.40", change: "+1.20%", up: true },
  { symbol: "BTC", name: "Bitcoin", price: "$97,243.50", change: "+2.41%", up: true },
  { symbol: "ETH", name: "Ethereum", price: "$3,412.18", change: "-0.45%", up: false },
  { symbol: "SOL", name: "Solana", price: "$184.62", change: "+5.12%", up: true },
  { symbol: "EUR/USD", name: "EUR/USD", price: "1.0924", change: "+0.15%", up: true },
  { symbol: "AAPL", name: "Apple Inc.", price: "$198.50", change: "+0.92%", up: true },
  { symbol: "TSLA", name: "Tesla Inc.", price: "$267.30", change: "-1.24%", up: false },
  { symbol: "OIL", name: "Crude Oil", price: "$74.80", change: "-0.80%", up: false },
];

const mockDeposits = [
  { user: "J***n D.", amount: "0.245", currency: "BTC", time: "2 mins ago" },
  { user: "S***a K.", amount: "$5,000", currency: "USDT", time: "5 mins ago" },
  { user: "M***s R.", amount: "12.5", currency: "ETH", time: "8 mins ago" },
  { user: "A***e L.", amount: "$3,200", currency: "USDT", time: "12 mins ago" },
  { user: "R***t P.", amount: "0.087", currency: "BTC", time: "18 mins ago" },
  { user: "L***a W.", amount: "45.2", currency: "SOL", time: "23 mins ago" },
  { user: "D***d H.", amount: "$8,500", currency: "USDT", time: "31 mins ago" },
  { user: "C***e B.", amount: "1.82", currency: "ETH", time: "38 mins ago" },
];

const mockWithdrawals = [
  { user: "K***n M.", amount: "0.156", currency: "BTC", time: "4 mins ago" },
  { user: "E***a T.", amount: "$2,800", currency: "USDT", time: "9 mins ago" },
  { user: "P***l S.", amount: "7.3", currency: "ETH", time: "14 mins ago" },
  { user: "N***a F.", amount: "$1,500", currency: "USDT", time: "19 mins ago" },
  { user: "T***s G.", amount: "22.8", currency: "SOL", time: "25 mins ago" },
  { user: "B***n J.", amount: "0.041", currency: "BTC", time: "33 mins ago" },
  { user: "H***y V.", amount: "$4,200", currency: "USDT", time: "40 mins ago" },
  { user: "W***m C.", amount: "3.15", currency: "ETH", time: "47 mins ago" },
];

// Pool of 200 names for the dynamic transaction ticker
const poolNames = [
  "J***n D.", "S***a K.", "M***s R.", "A***e L.", "R***t P.", "L***a W.", "D***d H.", "C***e B.",
  "K***n M.", "E***a T.", "P***l S.", "N***a F.", "T***s G.", "B***n J.", "H***y V.", "W***m C.",
  "A***x O.", "O***r W.", "M***a L.", "I***h M.", "S***h C.", "G***e N.", "E***n P.", "F***a R.",
  "H***n K.", "L***s J.", "Z***e Y.", "V***t F.", "Y***n S.", "X***r B.", "U***h G.", "Q***n D.",
  "R***a E.", "O***d H.", "T***y A.", "J***s L.", "P***a C.", "K***e W.", "L***n R.", "J***d H.",
  "F***k M.", "C***l B.", "A***n T.", "R***h Y.", "N***h P.", "D***l S.", "J***e V.", "S***n G.",
  "A***t K.", "M***y C.", "E***d W.", "R***o Q.", "T***a O.", "N***i P.", "L***i D.", "E***s M.",
  "J***n S.", "O***a F.", "L***m H.", "A***a Z.", "W***t B.", "K***a C.", "D***o R.", "P***r T.",
  "M***n W.", "R***a G.", "S***u L.", "B***t P.", "G***a K.", "F***n M.", "C***a D.", "A***d S.",
  "J***o H.", "K***t B.", "E***e C.", "L***y R.", "T***r V.", "D***a O.", "N***n M.", "M***k G.",
  "H***a Y.", "V***a F.", "W***e L.", "S***y S.", "B***y B.", "C***n K.", "A***u P.", "R***n J.",
  "J***a T.", "K***n A.", "E***r M.", "L***a R.", "T***m D.", "D***n S.", "N***y B.", "M***e H.",
  "H***d G.", "V***r K.", "W***r M.", "S***a Q.", "B***a O.", "C***o V.", "A***i L.", "R***t F.",
  "J***m Y.", "K***h W.", "E***n D.", "L***s C.", "T***d P.", "D***y R.", "N***o B.", "M***n J.",
  "H***s S.", "V***i T.", "W***n G.", "S***o K.", "B***n M.", "C***u A.", "A***a R.", "R***y H.",
  "J***e B.", "K***y E.", "E***d G.", "L***n N.", "T***s M.", "D***a C.", "N***e T.", "M***s O.",
  "H***y K.", "V***n D.", "W***a F.", "S***e H.", "B***r W.", "C***l M.", "A***n G.", "R***o S.",
  "J***n P.", "K***a L.", "E***a C.", "L***o Y.", "T***a B.", "D***l H.", "N***i R.", "M***y T.",
  "H***e M.", "V***t B.", "W***y O.", "S***n N.", "B***t C.", "C***n L.", "A***t G.", "R***a F.",
  "J***o R.", "K***y P.", "E***e K.", "L***y T.", "T***r D.", "D***a M.", "N***n G.", "M***k S.",
  "H***a W.", "V***a L.", "W***e J.", "S***y B.", "B***y C.", "C***n O.", "A***u F.", "R***n K.",
  "J***a M.", "K***n N.", "E***r L.", "L***a D.", "T***m S.", "D***n T.", "N***y G.", "M***e P.",
  "H***d R.", "V***r H.", "W***r F.", "S***a J.", "B***a B.", "C***o K.", "A***i S.", "R***t D.",
  "J***m G.", "K***h O.", "E***n R.", "L***s T.", "T***d B.", "D***y W.", "N***o A.", "M***n K.",
  "H***s M.", "V***i L.", "W***n Y.", "S***o C.", "B***n P.", "C***u H.", "A***a D.", "R***y S."
];

const executives = [
  { name: "Jonathan Hale", role: "Founder & Chief Executive Officer", photo: "/team-jonathan.jpg" },
  { name: "Sophia Reynolds", role: "Chief Investment Officer", photo: "/team-sophia.jpg" },
  { name: "Marcus Ellison", role: "Chief Technology Officer", photo: "/team-marcus.jpg" },
  { name: "Priya Sharma", role: "Chief Financial Officer", photo: "/team-priya.jpg" },
  { name: "David Okonkwo", role: "Head of Risk & Compliance", photo: "/team-david.jpg" },
];

const timeframeData: Record<string, { price: string; change: string; up: boolean; points: number[] }> = {
  "1H": {
    price: "$97,243.50",
    change: "+0.41%",
    up: true,
    points: [96800, 96920, 96750, 97100, 96980, 97050, 97243, 97150, 97243],
  },
  "24H": {
    price: "$97,243.50",
    change: "+2.41%",
    up: true,
    points: [94800, 95100, 94600, 95800, 96100, 95900, 96800, 96700, 97243],
  },
  "7D": {
    price: "$98,110.20",
    change: "+8.62%",
    up: true,
    points: [90200, 91500, 89400, 92800, 94100, 93500, 96400, 95800, 98110],
  },
  "30D": {
    price: "$101,450.80",
    change: "+18.75%",
    up: true,
    points: [85000, 87200, 84300, 89500, 91200, 89800, 94500, 93800, 101450],
  },
};

const legalContents: Record<string, { title: string; content: string }> = {
  terms: {
    title: "Terms & Conditions",
    content: "By accessing this platform, you agree that you are solely responsible for any and all investment decisions and capital allocations. Horizon Equity and its founders, operators, affiliates, and representatives shall not be liable for any direct, indirect, incidental, special, or consequential losses, including but not limited to loss of capital, digital asset depreciation, real estate devaluation, or resource clearing failures. All services and portfolios are provided on an 'as-is' and 'as-available' basis. The platform reserves the right to modify investment terms, return schedules, and payout options at its absolute discretion without prior notification. User agrees to defend, indemnify, and hold harmless the platform and its operators from any claims, regulatory actions, liabilities, or losses."
  },
  privacy: {
    title: "Privacy Policy",
    content: "We collect personal and transactional data to maintain compliance audits and clear ledgers. By registering, you consent to the storage and auditing of your identifiers. While we implement security protocols, Horizon Equity is not responsible for database compromises, cyber breaches, unauthorized modifications, or regulatory disclosures. User acknowledges that data transmission is at their own risk. The platform does not guarantee absolute privacy, and all actions arising from database breaches are absorbed entirely by the user."
  },
  risk: {
    title: "Risk Disclosure",
    content: "All investment activities are highly speculative and carry substantial risk of total loss. Past performance does not guarantee future results. User agrees that they are fully capable of absorbing complete capital loss. By depositing assets or funds, User waives all claims to refunds, capital reclamation, legal recourse, or regulatory complaints against the platform, its founders, and custodian networks. Horizon Equity is not an advisory service, and all market indicators represent raw data cleared at the user's sole risk."
  },
  investment: {
    title: "Investment Terms",
    content: "Each investment plan operates on structural clearing terms defined by the platform. Payouts and yield releases are subject to network confirmations and liquidity conditions. The platform reserves the right to freeze capital, restrict withdrawals, or offset ledger balances in the event of compliance checks, market instability, or custodial adjustments. All transactions are cleared based on user's acceptance of these terms. Any loss resulting from network delays or balance offsets is borne entirely by the user."
  },
  contact: {
    title: "Contact Relations",
    content: "Official institutional communications must be directed through our verified clearing relation desk. General support tickets do not constitute binding agreements, legal advice, or guaranteed support. Relations and advisory parameters may be adjusted by the platform at any time. By initiating contact, you agree that all correspondence is private and subject to the platform's non-disclosure and limitation of liability clauses."
  }
};

const currencyBadgeClass: Record<string, string> = {
  BTC: "badge-btc",
  ETH: "badge-eth",
  USDT: "badge-usdt",
  SOL: "badge-sol",
};

/* ──────────────────────────────────────────
   SVG CHART COMPONENT (Demo Mode)
   ────────────────────────────────────────── */

interface ChartProps {
  points: number[];
}

function MarketOverviewChart({ points }: ChartProps) {
  const width = 800;
  const height = 220;
  const maxVal = Math.max(...points);
  const minVal = Math.min(...points);

  const pathData = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - minVal) / (maxVal - minVal)) * (height - 30) - 15;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const areaPath = `${pathData} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(201,162,39,0.15)" />
          <stop offset="100%" stopColor="rgba(7,17,31,0)" />
        </linearGradient>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C9A227" />
          <stop offset="100%" stopColor="#E0BE52" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0.2, 0.4, 0.6, 0.8].map((pct) => (
        <line
          key={pct}
          x1={0}
          y1={height * pct}
          x2={width}
          y2={height * pct}
          stroke="rgba(30, 53, 82, 0.25)"
          strokeDasharray="4 4"
        />
      ))}
      <path d={areaPath} fill="url(#chartGradient)" />
      <path d={pathData} fill="none" stroke="url(#lineGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ──────────────────────────────────────────
   TRADINGVIEW WIDGET COMPONENT
   ────────────────────────────────────────── */

function TradingViewWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // Clear any existing content
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: "BINANCE:BTCUSDT",
      interval: "60",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "rgba(7, 17, 31, 1)",
      gridColor: "rgba(30, 53, 82, 0.2)",
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: true,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
    });

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="tradingview-container" style={{ height: "420px" }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}

/* ──────────────────────────────────────────
   MAIN PAGE
   ────────────────────────────────────────── */

export default function LandingPage() {
  const [chartTimeframe, setChartTimeframe] = useState("24H");
  const [chartMode, setChartMode] = useState<"live" | "demo">("live");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic Transaction Lists
  const [deposits, setDeposits] = useState(mockDeposits);
  const [withdrawals, setWithdrawals] = useState(mockWithdrawals);

  // Modal active content state
  const [activeLegalKey, setActiveLegalKey] = useState<string | null>(null);

  const activeChart = timeframeData[chartTimeframe] || timeframeData["24H"];

  // Constantly update transaction list every 2.5s with a random name from the 200 pool
  useEffect(() => {
    const currencies = ["BTC", "USDT", "ETH", "SOL"];
    
    const interval = setInterval(() => {
      const isDeposit = Math.random() > 0.4;
      const isWithdrawal = Math.random() > 0.4;
      
      const getRandomAmount = (curr: string) => {
        if (curr === "BTC") return (Math.random() * 0.5 + 0.01).toFixed(3);
        if (curr === "ETH") return (Math.random() * 5 + 0.1).toFixed(2);
        if (curr === "SOL") return (Math.random() * 50 + 1).toFixed(1);
        return "$" + Math.floor(Math.random() * 15000 + 100).toLocaleString();
      };
      
      const getRandomName = () => {
        return poolNames[Math.floor(Math.random() * poolNames.length)];
      };

      if (isDeposit) {
        setDeposits((prev) => {
          const curr = currencies[Math.floor(Math.random() * currencies.length)];
          const newTx = {
            user: getRandomName(),
            amount: getRandomAmount(curr),
            currency: curr,
            time: "just now",
          };
          const updated = prev.map((tx, idx) => {
            const minutes = idx + 1;
            return { ...tx, time: `${minutes} min${minutes > 1 ? "s" : ""} ago` };
          });
          return [newTx, ...updated.slice(0, 7)];
        });
      }
      
      if (isWithdrawal) {
        setWithdrawals((prev) => {
          const curr = currencies[Math.floor(Math.random() * currencies.length)];
          const newTx = {
            user: getRandomName(),
            amount: getRandomAmount(curr),
            currency: curr,
            time: "just now",
          };
          const updated = prev.map((tx, idx) => {
            const minutes = idx + 1;
            return { ...tx, time: `${minutes} min${minutes > 1 ? "s" : ""} ago` };
          });
          return [newTx, ...updated.slice(0, 7)];
        });
      }
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#07111F] text-[#F8FAFC] flex flex-col selection:bg-[#C9A227] selection:text-[#07111F]">

      {/* ═══════ TOP REAL-TIME PRICE TICKER ═══════ */}
      <div className="ticker-bar">
        <div className="ticker-track">
          {/* Simulated data label */}
          <div className="ticker-item flex-shrink-0">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#64748b] border border-[#1E3552] rounded px-1.5 py-0.5">⚡ Simulated</span>
          </div>
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <div key={i} className="ticker-item">
              <span className="symbol">{item.symbol}</span>
              <span className="price">{item.price}</span>
              <span className={item.up ? "change-up" : "change-down"}>
                {item.up ? <ArrowUpRight className="inline h-3 w-3" /> : <ArrowDownRight className="inline h-3 w-3" />}
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════ HEADER / NAVIGATION ═══════ */}
      <header className="sticky top-0 z-50 border-b border-[#1E3552] bg-[#07111F]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="h-14 w-14 rounded-xl bg-white p-1 flex items-center justify-center shadow-md relative overflow-hidden flex-shrink-0">
              <Image 
                src="/logo.jpg" 
                alt="Horizon Equity Logo" 
                width={50} 
                height={50} 
                className="object-contain" 
                priority 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-wider text-gradient">HORIZON</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#94A3B8] -mt-1">EQUITY</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#94A3B8]">
            <Link href="/" className="hover:text-[#F8FAFC] transition-colors">Home</Link>
            <a href="#plans" className="hover:text-[#F8FAFC] transition-colors">Investments</a>
            <a href="#market" className="hover:text-[#F8FAFC] transition-colors">Markets</a>
            <a href="#team" className="hover:text-[#F8FAFC] transition-colors">About</a>
          </nav>

          {/* User actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-[#C9A227] hover:text-[#E0BE52] px-4 py-2 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary text-sm py-2.5 px-6 font-bold">
              Get Started
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-[#94A3B8] hover:text-[#F8FAFC] p-1.5 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-72 bg-[#07111F] border-l border-[#1E3552] h-full p-6 flex flex-col justify-between animate-slide-up">
            <div className="flex flex-col gap-8">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-white p-0.5 flex items-center justify-center shadow-sm relative overflow-hidden flex-shrink-0">
                    <Image src="/logo.jpg" alt="Horizon Equity Logo" width={36} height={36} className="object-contain" />
                  </div>
                  <span className="font-extrabold text-sm tracking-wider text-gradient">HORIZON</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#94A3B8] hover:text-[#F8FAFC] p-1 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Links */}
              <nav className="flex flex-col gap-4 text-base font-semibold text-[#94A3B8]">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F8FAFC] py-1 border-b border-white/5 transition-colors">Home</Link>
                <a href="#plans" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F8FAFC] py-1 border-b border-white/5 transition-colors">Investments</a>
                <a href="#market" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F8FAFC] py-1 border-b border-white/5 transition-colors">Markets</a>
                <a href="#team" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F8FAFC] py-1 border-b border-white/5 transition-colors">About</a>
              </nav>
            </div>

            {/* CTA Auth links */}
            <div className="flex flex-col gap-3 pt-6 border-t border-[#1E3552]">
              <Link 
                href="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-center font-bold text-[#C9A227] hover:text-[#E0BE52] py-2.5 rounded-lg border border-[#C9A227]/20 transition-all"
              >
                Sign In
              </Link>
              <Link 
                href="/register" 
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary justify-center text-center py-2.5 font-bold"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ HERO SECTION ═══════ */}
      <section className="relative py-28 lg:py-44 overflow-hidden border-b border-[#1E3552]">
        {/* Background gradient */}
        <div className="absolute top-0 inset-x-0 h-full pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0A2540]/40 via-[#07111F] to-[#07111F]" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-center">
          {/* Left — Copy */}
          <div className="lg:col-span-7 flex flex-col gap-8 text-left animate-slide-up">
            <div className="inline-flex self-start items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#1E3552] bg-[#0A2540]/40 text-[#C9A227] text-xs font-bold tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5" /> Multi-Asset Investment Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Invest Beyond the <span className="text-gradient">Horizon.</span>
            </h1>

            <div className="flex flex-col gap-4">
              <p className="text-base sm:text-lg text-[#94A3B8] max-w-lg leading-relaxed font-medium">
                Access institutional-grade allocations across digital assets, real estate, energy, currencies, and mineral resources — all through one unified dashboard.
              </p>
              <div className="inline-flex self-start items-center gap-3 px-5 py-2 rounded-full border border-[#C9A227]/30 bg-[#C9A227]/5">
                <span className="text-xs font-bold tracking-widest uppercase text-[#C9A227]">Crypto Investments</span>
                <span className="text-[#C9A227]/40">|</span>
                <span className="text-xs font-bold tracking-widest uppercase text-[#C9A227]">Real Returns</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a href="#plans" className="btn-primary px-8 py-3.5 font-bold text-sm">
                Explore Investments <ChevronRight className="h-4 w-4" />
              </a>
              <Link href="/register" className="btn-secondary px-8 py-3.5 font-bold text-sm">
                Get Started
              </Link>
            </div>
          </div>

          {/* Right — Hero Visual */}
          <div className="lg:col-span-5 relative w-full h-[420px] rounded-2xl overflow-hidden border border-[#1E3552] animate-fade-in animate-hero-float">
            <Image 
              src="/hero-bg.jpg" 
              alt="Multi-Asset Investment Platform — Digital Assets, Real Estate, Energy, Currencies, Minerals" 
              fill 
              className="object-cover" 
              priority 
            />
            {/* Dark vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#07111F] via-[#07111F]/20 to-transparent opacity-70" />
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-[#07111F]/80 backdrop-blur-md border border-[#1E3552]/50 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#C9A227] tracking-wider uppercase">Institutional Allocations</span>
              <span className="text-xs text-[#94A3B8]">Multi-ledger clearing engines</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ TRUST / VALUE STRIP ═══════ */}
      <section className="py-10 border-b border-[#1E3552] bg-[#050d18]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col gap-1.5 md:border-r border-[#1E3552]/30 md:last:border-none md:px-6">
              <span className="text-xs font-bold text-[#C9A227] tracking-wider uppercase">Multi-Asset Access</span>
              <span className="text-xs text-[#94A3B8]">Digital, real estate, energy, metals</span>
            </div>
            <div className="flex flex-col gap-1.5 md:border-r border-[#1E3552]/30 md:last:border-none md:px-6">
              <span className="text-xs font-bold text-[#C9A227] tracking-wider uppercase">Transparent Info</span>
              <span className="text-xs text-[#94A3B8]">Clear investment terms</span>
            </div>
            <div className="flex flex-col gap-1.5 md:border-r border-[#1E3552]/30 md:last:border-none md:px-6">
              <span className="text-xs font-bold text-[#C9A227] tracking-wider uppercase">Secure Infrastructure</span>
              <span className="text-xs text-[#94A3B8]">Platform security architecture</span>
            </div>
            <div className="flex flex-col gap-1.5 md:px-6">
              <span className="text-xs font-bold text-[#C9A227] tracking-wider uppercase">Centralized Platform</span>
              <span className="text-xs text-[#94A3B8]">One console for management</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ EXPLORE INVESTMENT CATEGORIES ═══════ */}
      <section id="about" className="py-28 md:py-36 border-b border-[#1E3552]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-left flex flex-col gap-2 mb-16 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C9A227]">Diverse Portfolio Allocation</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Explore Investment Opportunities</h2>
            <p className="text-[#94A3B8] text-sm leading-relaxed mt-2 max-w-md">
              One platform. Multiple markets. Allocate across asset classes under balanced frameworks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {/* Category 1: Digital Assets */}
            <div className="card flex flex-col p-7 h-[240px] justify-between group hover:border-[#C9A227]/20 transition-all duration-300">
              <div className="h-10 w-10 rounded-lg bg-[#C9A227]/5 border border-[#C9A227]/10 flex items-center justify-center text-[#C9A227]">
                <Coins className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="font-extrabold text-xs text-[#F8FAFC] tracking-wider uppercase">Digital Assets</h4>
                <p className="text-xs text-[#94A3B8] leading-relaxed">Cryptocurrency and blockchain opportunities.</p>
              </div>
            </div>

            {/* Category 2: Real Estate */}
            <div className="card flex flex-col p-7 h-[240px] justify-between group hover:border-[#C9A227]/20 transition-all duration-300">
              <div className="h-10 w-10 rounded-lg bg-[#C9A227]/5 border border-[#C9A227]/10 flex items-center justify-center text-[#C9A227]">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="font-extrabold text-xs text-[#F8FAFC] tracking-wider uppercase">Real Estate</h4>
                <p className="text-xs text-[#94A3B8] leading-relaxed">Property and real-estate opportunities.</p>
              </div>
            </div>

            {/* Category 3: Energy */}
            <div className="card flex flex-col p-7 h-[240px] justify-between group hover:border-[#C9A227]/20 transition-all duration-300">
              <div className="h-10 w-10 rounded-lg bg-[#C9A227]/5 border border-[#C9A227]/10 flex items-center justify-center text-[#C9A227]">
                <Flame className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="font-extrabold text-xs text-[#F8FAFC] tracking-wider uppercase">Energy</h4>
                <p className="text-xs text-[#94A3B8] leading-relaxed">Oil, gas and energy opportunities.</p>
              </div>
            </div>

            {/* Category 4: Currencies */}
            <div className="card flex flex-col p-7 h-[240px] justify-between group hover:border-[#C9A227]/20 transition-all duration-300">
              <div className="h-10 w-10 rounded-lg bg-[#C9A227]/5 border border-[#C9A227]/10 flex items-center justify-center text-[#C9A227]">
                <Globe className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="font-extrabold text-xs text-[#F8FAFC] tracking-wider uppercase">Currencies</h4>
                <p className="text-xs text-[#94A3B8] leading-relaxed">Global currency opportunities.</p>
              </div>
            </div>

            {/* Category 5: Mineral Resources */}
            <div className="card flex flex-col p-7 h-[240px] justify-between group hover:border-[#C9A227]/20 transition-all duration-300">
              <div className="h-10 w-10 rounded-lg bg-[#C9A227]/5 border border-[#C9A227]/10 flex items-center justify-center text-[#C9A227]">
                <Gem className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="font-extrabold text-xs text-[#F8FAFC] tracking-wider uppercase">Mineral Resources</h4>
                <p className="text-xs text-[#94A3B8] leading-relaxed">Gold, precious metals and strategic resources.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ INVESTMENT PLANS ═══════ */}
      <section id="plans" className="py-28 md:py-36 border-b border-[#1E3552] section-alt">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="text-center flex flex-col items-center gap-3 mb-20">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C9A227]">Investment Portfolios</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Choose Your Investment Plan</h2>
            <p className="text-[#94A3B8] max-w-xl text-sm leading-relaxed mt-1">
              Select an investment plan based on your capital and preferred investment duration.
            </p>
          </div>

          <div className="plans-grid">
            {/* 1. Horizon Starter */}
            <div className="plan-card tier-starter flex flex-col gap-5">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Tier 01</span>
                  <h3 className="text-sm font-extrabold mt-1 text-white">Horizon Starter</h3>
                </div>
                <span className="plan-badge">Popular</span>
              </div>
              <div className="flex items-baseline gap-1.5 py-4 border-y border-[#1E3552]/30">
                <span className="text-4xl font-black text-[#C9A227] tracking-tight">2.5%</span>
                <span className="text-[#64748b] text-xs font-bold">Return</span>
              </div>
              <div className="flex flex-col gap-2 text-xs text-[#94A3B8]">
                <div className="plan-detail-row"><span className="label"><Clock className="inline h-3.5 w-3.5 mr-1.5" />Duration</span><span className="value">7 Days</span></div>
                <div className="plan-detail-row"><span className="label">Min Investment</span><span className="value">$50</span></div>
                <div className="plan-detail-row"><span className="label">Max Investment</span><span className="value">$499</span></div>
                <div className="plan-detail-row"><span className="label"><Gift className="inline h-3.5 w-3.5 mr-1.5" />Referral</span><span className="value-gold">3%</span></div>
              </div>
              <Link href="/register" className="btn-secondary w-full justify-center mt-auto text-xs py-3 font-bold">
                Invest Now
              </Link>
            </div>

            {/* 2. Horizon Rise */}
            <div className="plan-card tier-rise flex flex-col gap-5">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Tier 02</span>
                  <h3 className="text-sm font-extrabold mt-1 text-white">Horizon Rise</h3>
                </div>
                <span className="plan-badge">Best Value</span>
              </div>
              <div className="flex items-baseline gap-1.5 py-4 border-y border-[#1E3552]/30">
                <span className="text-4xl font-black text-[#C9A227] tracking-tight">4%</span>
                <span className="text-[#64748b] text-xs font-bold">Return</span>
              </div>
              <div className="flex flex-col gap-2 text-xs text-[#94A3B8]">
                <div className="plan-detail-row"><span className="label"><Clock className="inline h-3.5 w-3.5 mr-1.5" />Duration</span><span className="value">14 Days</span></div>
                <div className="plan-detail-row"><span className="label">Min Investment</span><span className="value">$500</span></div>
                <div className="plan-detail-row"><span className="label">Max Investment</span><span className="value">$1,999</span></div>
                <div className="plan-detail-row"><span className="label"><Gift className="inline h-3.5 w-3.5 mr-1.5" />Referral</span><span className="value-gold">4%</span></div>
              </div>
              <Link href="/register" className="btn-secondary w-full justify-center mt-auto text-xs py-3 font-bold">
                Invest Now
              </Link>
            </div>

            {/* 3. Horizon Peak */}
            <div className="plan-card tier-peak flex flex-col gap-5">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A227]">Tier 03</span>
                  <h3 className="text-sm font-extrabold mt-1 text-white">Horizon Peak</h3>
                </div>
                <span className="plan-badge bg-[#E0BE52]/15 border-[#E0BE52]/25 text-[#E0BE52]"><Sparkles className="h-2.5 w-2.5 mr-0.5" />Recommended</span>
              </div>
              <div className="flex items-baseline gap-1.5 py-4 border-y border-[#1E3552]/30">
                <span className="text-4xl font-black text-[#E0BE52] tracking-tight">6%</span>
                <span className="text-[#64748b] text-xs font-bold">Return</span>
              </div>
              <div className="flex flex-col gap-2 text-xs text-[#94A3B8]">
                <div className="plan-detail-row"><span className="label"><Clock className="inline h-3.5 w-3.5 mr-1.5" />Duration</span><span className="value">30 Days</span></div>
                <div className="plan-detail-row"><span className="label">Min Investment</span><span className="value">$2,000</span></div>
                <div className="plan-detail-row"><span className="label">Max Investment</span><span className="value">$9,999</span></div>
                <div className="plan-detail-row"><span className="label"><Gift className="inline h-3.5 w-3.5 mr-1.5" />Referral</span><span className="value-gold">5%</span></div>
              </div>
              <Link href="/register" className="btn-primary w-full justify-center mt-auto text-xs py-3 font-bold">
                Invest Now <Zap className="h-3.5 w-3.5 fill-current" />
              </Link>
            </div>

            {/* 4. Horizon Apex */}
            <div className="plan-card tier-apex flex flex-col gap-5">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A227]">Tier 04</span>
                  <h3 className="text-sm font-extrabold mt-1 text-white">Horizon Apex</h3>
                </div>
                <span className="plan-badge border-[#C9A227]/30 text-[#C9A227]"><Award className="h-2.5 w-2.5 mr-0.5" />Premium</span>
              </div>
              <div className="flex items-baseline gap-1.5 py-4 border-y border-[#1E3552]/30">
                <span className="text-4xl font-black text-[#C9A227] tracking-tight">8%</span>
                <span className="text-[#64748b] text-xs font-bold">Return</span>
              </div>
              <div className="flex flex-col gap-2 text-xs text-[#94A3B8]">
                <div className="plan-detail-row"><span className="label"><Clock className="inline h-3.5 w-3.5 mr-1.5" />Duration</span><span className="value">60 Days</span></div>
                <div className="plan-detail-row"><span className="label">Min Investment</span><span className="value">$10,000</span></div>
                <div className="plan-detail-row"><span className="label">Max Investment</span><span className="value">$49,999</span></div>
                <div className="plan-detail-row"><span className="label"><Gift className="inline h-3.5 w-3.5 mr-1.5" />Referral</span><span className="value-gold">6%</span></div>
              </div>
              <Link href="/register" className="btn-secondary w-full justify-center mt-auto text-xs py-3 font-bold">
                Invest Now
              </Link>
            </div>

            {/* 5. Horizon Legacy */}
            <div className="plan-card tier-legacy flex flex-col gap-5">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A7841B]">Tier 05</span>
                  <h3 className="text-sm font-extrabold mt-1 text-white">Horizon Legacy</h3>
                </div>
                <span className="plan-badge elite-badge"><Crown className="h-2.5 w-2.5 mr-0.5" />Elite</span>
              </div>
              <div className="flex items-baseline gap-1.5 py-4 border-y border-[#1E3552]/30">
                <span className="text-4xl font-black text-[#E0BE52] tracking-tight">10%</span>
                <span className="text-[#64748b] text-xs font-bold">Return</span>
              </div>
              <div className="flex flex-col gap-2 text-xs text-[#94A3B8]">
                <div className="plan-detail-row"><span className="label"><Clock className="inline h-3.5 w-3.5 mr-1.5" />Duration</span><span className="value">90 Days</span></div>
                <div className="plan-detail-row"><span className="label">Min Investment</span><span className="value">$50,000</span></div>
                <div className="plan-detail-row"><span className="label">Max Investment</span><span className="value">Unlimited</span></div>
                <div className="plan-detail-row"><span className="label"><Gift className="inline h-3.5 w-3.5 mr-1.5" />Referral</span><span className="value-gold">8%</span></div>
              </div>
              <Link href="/register" className="btn-primary w-full justify-center mt-auto text-xs py-3 font-bold bg-[#A7841B] hover:bg-[#C9A227] border-[#A7841B]">
                Invest Now <Crown className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ MARKET OVERVIEW / CHART ═══════ */}
      <section id="market" className="py-28 md:py-36 border-b border-[#1E3552]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="chart-container">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-[#C9A227]" />
                  <h2 className="text-xl font-bold tracking-wide">Market Overview</h2>
                </div>
                {chartMode === "demo" && (
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-3xl font-black text-white tracking-tight transition-all duration-300">{activeChart.price}</span>
                    <span className="text-xs font-bold text-[#00d4aa] flex items-center gap-0.5 py-0.5 px-2.5 rounded-full bg-[#00d4aa]/10">
                      <ArrowUpRight className="h-3.5 w-3.5" />{activeChart.change}
                    </span>
                    <span className="text-xs text-[#64748b] font-bold uppercase tracking-wider">BTC/USD</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Mode Toggle */}
                <div className="chart-mode-toggle">
                  <button
                    onClick={() => setChartMode("live")}
                    className={`chart-mode-btn ${chartMode === "live" ? "active" : ""}`}
                  >
                    <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> Live Trading</span>
                  </button>
                  <button
                    onClick={() => setChartMode("demo")}
                    className={`chart-mode-btn ${chartMode === "demo" ? "active" : ""}`}
                  >
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> Demo Simulated</span>
                  </button>
                </div>

                {/* Timeframe buttons — only for demo mode */}
                {chartMode === "demo" && (
                  <div className="flex gap-1 p-1 bg-[#07111F] rounded-lg border border-[#1E3552]">
                    {["1H", "24H", "7D", "30D"].map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setChartTimeframe(tf)}
                        className={`chart-timeframe-btn px-3 py-1.5 text-xs rounded transition-all duration-200 ${chartTimeframe === tf ? "active" : ""}`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chart Area */}
            {chartMode === "live" ? (
              <TradingViewWidget />
            ) : (
              <div className="h-56 sm:h-64 w-full">
                <MarketOverviewChart points={activeChart.points} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════ FEATURED OPPORTUNITIES ═══════ */}
      <section className="py-28 md:py-36 border-b border-[#1E3552] section-alt">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-left flex flex-col gap-2 mb-14 max-w-md">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C9A227]">Private Placements</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Featured Opportunities</h2>
            <p className="text-[#94A3B8] text-sm leading-relaxed mt-2">
              Access dynamic private investment opportunities tailored to strategic asset growth.
            </p>
          </div>

          <div className="card p-14 text-center flex flex-col items-center justify-center max-w-xl mx-auto gap-6 border border-dashed border-[#1E3552]">
            <div className="h-14 w-14 rounded-full bg-[#0A2540] border border-[#1E3552] flex items-center justify-center text-[#64748b]">
              <Lock className="h-6 w-6" />
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Private Access Required</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed max-w-md">
                Public offerings are currently fully subscribed. Sign in to your dashboard to review private placements, or contact your portfolio manager to request allocation terms.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Link href="/login" className="btn-primary text-xs py-2.5 px-6 font-bold">
                Access Dashboard
              </Link>
              <a href="#plans" className="btn-secondary text-xs py-2.5 px-6 font-bold">
                View All Plans
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="py-28 md:py-36 border-b border-[#1E3552]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center flex flex-col items-center gap-3 mb-20">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C9A227]">Getting Started</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">How It Works</h2>
            <p className="text-[#94A3B8] max-w-lg text-sm leading-relaxed mt-1">
              Four simple steps to begin your investment journey with Horizon Equity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="h-10 w-10 flex items-center justify-center text-[#C9A227]">
                <UserPlus className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Create Account</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">Register and verify your identity in under 5 minutes.</p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="h-10 w-10 flex items-center justify-center text-[#C9A227]">
                <Layers className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Choose a Plan</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">Select from five structured investment tiers.</p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="h-10 w-10 flex items-center justify-center text-[#C9A227]">
                <Wallet className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Fund Your Wallet</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">Deposit via crypto or fiat with instant confirmation.</p>
            </div>

            <div className="step-card">
              <div className="step-number">4</div>
              <div className="h-10 w-10 flex items-center justify-center text-[#C9A227]">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Earn Returns</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">Track growth and withdraw earnings at maturity.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ LATEST DEPOSITS & WITHDRAWALS ═══════ */}
      <section id="activity" className="py-28 md:py-36 border-b border-[#1E3552] section-alt">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center flex flex-col items-center gap-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C9A227]">Global Flow</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Transaction Feeds</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b] mt-2 border border-[#1E3552] rounded-full px-3 py-1">
              ⚡ Simulated Activity
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Deposits Feed */}
            <div className="chart-container">
              <div className="flex items-center justify-between mb-6 border-b border-[#1E3552]/30 pb-4">
                <h3 className="font-extrabold text-xs tracking-wider uppercase flex items-center gap-2 text-white">
                  <ArrowDownRight className="h-4.5 w-4.5 text-[#00d4aa]" /> Latest Deposits
                </h3>
                <div className="live-indicator"><span className="live-dot" /> LIVE</div>
              </div>
              <div className="flex flex-col divide-y divide-[#1E3552]/15">
                {deposits.map((tx, idx) => (
                  <div key={idx} className="py-3 flex flex-row items-center justify-between text-xs sm:text-sm animate-row-slide-in" style={{ animationDelay: `${idx * 50}ms` }}>
                    <span className="text-[#94A3B8] font-semibold">{tx.user}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{tx.amount}</span>
                      <span className={`text-[10px] font-bold uppercase py-0.5 px-2 rounded ${currencyBadgeClass[tx.currency] || "badge-gold"}`}>
                        {tx.currency}
                      </span>
                    </div>
                    <span className="text-[#64748b] text-[10px] font-semibold">{tx.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Withdrawals Feed */}
            <div className="chart-container">
              <div className="flex items-center justify-between mb-6 border-b border-[#1E3552]/30 pb-4">
                <h3 className="font-extrabold text-xs tracking-wider uppercase flex items-center gap-2 text-white">
                  <ArrowUpRight className="h-4.5 w-4.5 text-[#ff6b6b]" /> Latest Withdrawals
                </h3>
                <div className="live-indicator"><span className="live-dot" /> LIVE</div>
              </div>
              <div className="flex flex-col divide-y divide-[#1E3552]/15">
                {withdrawals.map((tx, idx) => (
                  <div key={idx} className="py-3 flex flex-row items-center justify-between text-xs sm:text-sm animate-row-slide-in" style={{ animationDelay: `${idx * 50}ms` }}>
                    <span className="text-[#94A3B8] font-semibold">{tx.user}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{tx.amount}</span>
                      <span className={`text-[10px] font-bold uppercase py-0.5 px-2 rounded ${currencyBadgeClass[tx.currency] || "badge-gold"}`}>
                        {tx.currency}
                      </span>
                    </div>
                    <span className="text-[#64748b] text-[10px] font-semibold">{tx.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ WHY HORIZON EQUITY ═══════ */}
      <section className="py-28 md:py-36 border-b border-[#1E3552]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center flex flex-col items-center gap-3 mb-20">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C9A227]">Our Advantages</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Why Horizon Equity</h2>
            <p className="text-[#94A3B8] max-w-lg text-sm leading-relaxed mt-1">
              Built for investors who demand institutional quality with personal service.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-8 flex flex-col gap-4 text-left">
              <div className="h-10 w-10 rounded-lg bg-[#C9A227]/5 border border-[#C9A227]/10 flex items-center justify-center text-[#C9A227]">
                <Layers className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Multi-Asset Access</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">Diversify across digital assets, real estate, energy, currencies, and mineral resources through one platform.</p>
            </div>

            <div className="card p-8 flex flex-col gap-4 text-left">
              <div className="h-10 w-10 rounded-lg bg-[#C9A227]/5 border border-[#C9A227]/10 flex items-center justify-center text-[#C9A227]">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Transparent Terms</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">Clear investment terms, visible return structures, and no hidden fees across all tier plans.</p>
            </div>

            <div className="card p-8 flex flex-col gap-4 text-left">
              <div className="h-10 w-10 rounded-lg bg-[#C9A227]/5 border border-[#C9A227]/10 flex items-center justify-center text-[#C9A227]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Secure Infrastructure</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">Multi-signature vaults, encrypted communications, and institutional-grade security protocols.</p>
            </div>

            <div className="card p-8 flex flex-col gap-4 text-left">
              <div className="h-10 w-10 rounded-lg bg-[#C9A227]/5 border border-[#C9A227]/10 flex items-center justify-center text-[#C9A227]">
                <Headphones className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">24/7 Support</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">Dedicated portfolio managers and round-the-clock support for all account tiers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ EXECUTIVE TEAM ═══════ */}
      <section id="team" className="py-28 md:py-36 border-b border-[#1E3552] section-alt">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center flex flex-col items-center gap-3 mb-20">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C9A227]">Corporate Governance</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Our Leadership</h2>
            <p className="text-[#94A3B8] max-w-lg text-sm leading-relaxed mt-1">
              Experienced professionals driving innovation across global asset management.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {executives.map((exec) => (
              <div key={exec.name} className="team-card">
                <div className="relative w-full overflow-hidden bg-[#0A2540]" style={{ aspectRatio: "3 / 4" }}>
                  <Image
                    src={exec.photo}
                    alt={exec.name}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 20vw"
                  />
                </div>
                <div className="team-card-info">
                  <h4>{exec.name}</h4>
                  <div className="gold-line" />
                  <p>{exec.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CINEMATIC BRAND SECTION ═══════ */}
      <section className="relative py-36 overflow-hidden border-b border-[#1E3552] bg-gradient-to-tr from-[#07111F] via-[#0A2540]/20 to-[#07111F]">
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] rounded-full bg-[#C9A227]/3 blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-8">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C9A227]">Global Outlook</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
            Look Beyond the Obvious.
          </h2>
          <p className="text-base text-[#94A3B8] max-w-xl leading-relaxed">
            Opportunities exist across markets. Horizon Equity brings them together in one institutional investment experience.
          </p>
          <a href="#market" className="btn-primary mt-2 px-8 py-3.5 font-bold text-sm">
            Explore Markets
          </a>
        </div>
      </section>

      {/* ═══════ TRUST / CREDIBILITY ═══════ */}
      <section className="py-28 md:py-36 border-b border-[#1E3552]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-16 items-center">
          <div className="md:col-span-6 flex flex-col gap-6 text-left">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C9A227]">Verified Quality</span>
            <h2 className="text-3xl font-bold tracking-tight text-white">Institutional Credibility</h2>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              We employ strict risk frameworks, regulatory alignments, and secure custodian partnerships to deliver capital stability. Focus is given to asset growth with absolute clarity.
            </p>
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-center gap-3 text-xs text-[#F8FAFC]">
                <ShieldCheck className="h-4.5 w-4.5 text-[#C9A227] flex-shrink-0" />
                <span>Multi-signature vaults and custodian security.</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#F8FAFC]">
                <ShieldCheck className="h-4.5 w-4.5 text-[#C9A227] flex-shrink-0" />
                <span>Strict risk controls managed by compliance boards.</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#F8FAFC]">
                <ShieldCheck className="h-4.5 w-4.5 text-[#C9A227] flex-shrink-0" />
                <span>Comprehensive auditing tracking all plan maturities.</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-6 grid grid-cols-2 gap-5">
            <div className="card p-8 flex flex-col gap-1.5 text-left">
              <span className="text-3xl font-black text-[#C9A227] tracking-tight">100%</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Audit Transparency</span>
            </div>
            <div className="card p-8 flex flex-col gap-1.5 text-left">
              <span className="text-3xl font-black text-[#C9A227] tracking-tight">24/7</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Support Response</span>
            </div>
            <div className="card p-8 flex flex-col gap-1.5 text-left">
              <span className="text-3xl font-black text-[#C9A227] tracking-tight">5 Categories</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Diversified Range</span>
            </div>
            <div className="card p-8 flex flex-col gap-1.5 text-left">
              <span className="text-3xl font-black text-[#C9A227] tracking-tight">5 Tiers</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Structured Plans</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FINAL CTA SECTION ═══════ */}
      <section className="py-28 md:py-36 section-alt">
        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-8">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Your Next Opportunity May Be Beyond Your Usual Market.
          </h2>
          <p className="text-sm text-[#94A3B8] max-w-xl leading-relaxed">
            Explore investment opportunities across multiple markets through Horizon Equity. Start mapping your capital path today.
          </p>
          <div className="flex items-center gap-4">
            <a href="#plans" className="btn-primary py-3.5 px-8 text-sm font-bold">
              Explore Investments
            </a>
            <Link href="/register" className="btn-secondary py-3.5 px-8 text-sm font-bold">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="mt-auto border-t border-[#1E3552] bg-[#050d18] py-16 text-sm text-[#94A3B8]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <div className="h-12 w-12 rounded-xl bg-white p-1 flex items-center justify-center shadow-md relative overflow-hidden flex-shrink-0">
                <Image src="/logo.jpg" alt="Horizon Equity Logo" width={40} height={40} className="object-contain" />
              </div>
              <span className="font-extrabold text-white text-sm">Horizon Equity</span>
            </div>
            <p className="text-xs leading-relaxed max-w-xs text-[#94A3B8]/80">
              Horizon Equity is a premium multi-asset investment platform. Access diversified capital opportunities seamlessly.
            </p>
          </div>
          <div>
            <h5 className="font-extrabold text-white mb-5 text-xs uppercase tracking-wider">Investments</h5>
            <div className="flex flex-col gap-3 text-xs font-semibold">
              <a href="#plans" className="hover:text-white transition-colors">Horizon Starter</a>
              <a href="#plans" className="hover:text-white transition-colors">Horizon Rise</a>
              <a href="#plans" className="hover:text-white transition-colors">Horizon Peak</a>
              <a href="#plans" className="hover:text-white transition-colors">Horizon Apex</a>
              <a href="#plans" className="hover:text-white transition-colors">Horizon Legacy</a>
            </div>
          </div>
          <div>
            <h5 className="font-extrabold text-white mb-5 text-xs uppercase tracking-wider">Navigation</h5>
            <div className="flex flex-col gap-3 text-xs font-semibold">
              <a href="#market" className="hover:text-white transition-colors">Markets Overview</a>
              <a href="#team" className="hover:text-white transition-colors">Leadership Team</a>
              <Link href="/login" className="hover:text-white transition-colors">Sign In Portal</Link>
            </div>
          </div>
          <div>
            <h5 className="font-extrabold text-white mb-5 text-xs uppercase tracking-wider">Legal & Compliance</h5>
            <div className="flex flex-col gap-3 text-xs font-semibold">
              <span onClick={() => setActiveLegalKey("terms")} className="hover:text-white cursor-pointer transition-colors">Terms & Conditions</span>
              <span onClick={() => setActiveLegalKey("privacy")} className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              <span onClick={() => setActiveLegalKey("risk")} className="hover:text-white cursor-pointer transition-colors">Risk Disclosure</span>
              <span onClick={() => setActiveLegalKey("investment")} className="hover:text-white cursor-pointer transition-colors">Investment Terms</span>
              <span onClick={() => setActiveLegalKey("contact")} className="hover:text-white cursor-pointer transition-colors">Contact Relations</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-[#1E3552]/30 flex flex-col gap-6 text-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[#94A3B8]/50 font-bold">
            <span>&copy; {new Date().getFullYear()} Horizon Equity. All rights reserved.</span>
            <span>Secure multi-ledger clearing</span>
          </div>
        </div>
      </footer>

      {/* ═══════ DYNAMIC LEGAL MODAL DIALOG ═══════ */}
      {activeLegalKey && legalContents[activeLegalKey] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-[#0A2540] border border-[#1E3552] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
            <div className="p-6 border-b border-[#1E3552] flex justify-between items-center bg-[#07111F]/50">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">
                {legalContents[activeLegalKey].title}
              </h3>
              <button 
                onClick={() => setActiveLegalKey(null)}
                className="text-[#94A3B8] hover:text-white p-1 rounded-lg border border-[#1E3552] hover:bg-[#07111F] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-8 max-h-[400px] overflow-y-auto text-sm text-[#94A3B8] leading-relaxed space-y-4">
              <p className="font-semibold">{legalContents[activeLegalKey].content}</p>
            </div>
            <div className="p-6 border-t border-[#1E3552] bg-[#07111F]/30 flex justify-end">
              <button 
                onClick={() => setActiveLegalKey(null)}
                className="btn-primary py-2.5 px-6 text-xs font-bold"
              >
                Acknowledge and Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
