"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Wallet,
  Users,
  Copy,
  Check,
  ChevronRight,
  ArrowUpRight,
  Clock,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { api } from "@/lib/api";
import { toNum, formatCrypto, formatUsd } from "@/lib/format";
import { useMarketPrices } from "@/lib/use-market-prices";

interface WalletItem {
  id: string;
  currency: string;
  balance: number | string;
  frozen_balance: number | string;
  total_deposited?: number | string;
  total_withdrawn?: number | string;
}

interface InvestmentItem {
  id: string;
  amount: number | string;
  currency: string;
  expected_return: number | string;
  status: string;
  start_date: string;
  maturity_date: string;
  plan?: {
    name?: string;
    duration_days?: number;
  };
}

const DEFAULT_CRYPTO_RATES: Record<string, number> = {
  BTC: 96450,
  ETH: 3380,
  USDT: 1.0,
  SOL: 184,
};

export default function DashboardOverview() {
  const { user } = useAuthStore();
  const { rates: liveRates } = useMarketPrices();
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [investments, setInvestments] = useState<InvestmentItem[]>([]);
  const [referralCode, setReferralCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [walletsRes, investmentsRes, referralsRes] = await Promise.all([
          api.get("/wallets").catch(() => ({ data: [] })),
          api.get("/investments?status=active").catch(() => ({ data: [] })),
          api.get("/referrals/stats").catch(() => ({ data: {} })),
        ]);

        if (isMounted) {
          setWallets(Array.isArray(walletsRes.data) ? walletsRes.data : []);
          setInvestments(Array.isArray(investmentsRes.data) ? investmentsRes.data : []);

          if (referralsRes.data) {
            setReferralCode(referralsRes.data.referral_code || "");
            setReferralCount(toNum(referralsRes.data.referral_count));
            setReferralEarnings(toNum(referralsRes.data.referral_earnings));
          }
        }
      } catch (e) {
        console.error("Error loading dashboard data:", e);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate total portfolio value safely in USD using real live market rates
  const totalBalanceUsd = wallets.reduce((sum, w) => {
    const curr = w.currency?.toUpperCase() || "";
    const rate = liveRates[curr] || DEFAULT_CRYPTO_RATES[curr] || 0;
    const bal = toNum(w.balance) + toNum(w.frozen_balance);
    return sum + bal * rate;
  }, 0);

  const copyReferralLink = () => {
    if (!referralCode) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const link = `${origin}/register?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getProgressPercentage = (startStr?: string, endStr?: string) => {
    if (!startStr || !endStr) return 0;
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    const now = Date.now();

    if (isNaN(start) || isNaN(end) || end <= start) return 0;
    if (now >= end) return 100;
    if (now <= start) return 0;

    const total = end - start;
    const elapsed = now - start;
    return Math.min(Math.round((elapsed / total) * 100), 99);
  };

  const getDaysLeft = (endStr?: string) => {
    if (!endStr) return "Active";
    const end = new Date(endStr).getTime();
    if (isNaN(end)) return "Active";
    const diff = end - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : "Matured";
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#4388F5]" />
        <p className="text-xs text-[#7D8998]">Loading portfolio telemetry...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Welcome back, {user?.full_name || "Valued Investor"}
          </h2>
          <p className="text-xs text-[#A6B0BE] mt-1">
            Real-time multi-asset liquidity reserves and daily yield compounding performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/wallets" className="btn btn-secondary btn-sm font-semibold">
            <span>Deposit Funds</span>
          </Link>
          <Link href="/dashboard/investments" className="btn btn-primary btn-sm font-semibold shadow-sm">
            <span>Invest Now</span>
            <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </div>
      </div>

      {/* Top 4 Key Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assets */}
        <div className="panel p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7D8998] text-xs font-medium">
            <span>Estimated Total Assets</span>
            <Wallet className="h-4 w-4 text-[#4388F5]" />
          </div>
          <div className="my-2.5">
            <span className="num text-2xl sm:text-3xl font-bold text-white tracking-tight">
              ${formatUsd(totalBalanceUsd)}
            </span>
          </div>
          <span className="text-[11px] text-[#A6B0BE]">
            Aggregated Live Balances (USD)
          </span>
        </div>

        {/* Active Yield Contracts */}
        <div className="panel p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7D8998] text-xs font-medium">
            <span>Active Contracts</span>
            <TrendingUp className="h-4 w-4 text-[#4388F5]" />
          </div>
          <div className="my-2.5">
            <span className="num text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {investments.length}
            </span>
          </div>
          <span className="text-[11px] text-[#27C58B]">
            Accruing yield daily
          </span>
        </div>

        {/* Referral Earnings */}
        <div className="panel p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7D8998] text-xs font-medium">
            <span>Referral Earnings</span>
            <Users className="h-4 w-4 text-[#27C58B]" />
          </div>
          <div className="my-2.5">
            <span className="num text-2xl sm:text-3xl font-bold text-[#27C58B] tracking-tight">
              ${formatUsd(referralEarnings)}
            </span>
          </div>
          <span className="text-[11px] text-[#A6B0BE]">
            {referralCount} affiliated members
          </span>
        </div>

        {/* Compliance Standing */}
        <div className="panel p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7D8998] text-xs font-medium">
            <span>KYC Compliance</span>
            <Clock className="h-4 w-4 text-[#7D8998]" />
          </div>
          <div className="my-2.5">
            <span
              className={`text-lg font-bold uppercase tracking-wider ${
                user?.kyc_status === "verified"
                  ? "text-[#27C58B]"
                  : user?.kyc_status === "pending"
                  ? "text-[#F3B94F]"
                  : "text-[#F06464]"
              }`}
            >
              {user?.kyc_status || "Verified"}
            </span>
          </div>
          <span className="text-[11px] text-[#7D8998]">
            Tier-1 Regulatory Standing
          </span>
        </div>
      </div>

      {/* Individual Cryptocurrencies Grid */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7D8998] mb-3">
          Liquid Asset Reserves
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {["BTC", "ETH", "USDT", "SOL"].map((curr) => {
            const w = wallets.find((item) => item.currency?.toUpperCase() === curr);
            const balance = w ? toNum(w.balance) : 0;
            const frozen = w ? toNum(w.frozen_balance) : 0;

            return (
              <div key={curr} className="panel p-4 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-white">{curr} Wallet</span>
                  <span className="badge badge-accent text-[10px] font-bold">{curr}</span>
                </div>
                <div className="my-3 flex flex-col">
                  <span className="num font-mono text-xl font-bold text-white">
                    {formatCrypto(balance, 6)}
                  </span>
                  {frozen > 0 && (
                    <span className="num text-[11px] text-[#7D8998] mt-0.5">
                      Locked: {formatCrypto(frozen, 6)} {curr}
                    </span>
                  )}
                </div>
                <Link
                  href="/dashboard/wallets"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4388F5] hover:text-[#5A9AFF] pt-2 border-t border-white/5"
                >
                  <span>Deposit / Withdraw</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Yield Contracts & Referral Columns */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Active Contracts */}
        <div className="lg:col-span-7 panel p-6 flex flex-col gap-5">
          <div className="flex justify-between items-center pb-4 border-b border-white/10">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#4388F5]" /> Active Yield Contracts
            </h3>
            <Link
              href="/dashboard/investments"
              className="text-xs font-semibold text-[#4388F5] hover:text-[#5A9AFF] inline-flex items-center gap-0.5"
            >
              <span>Explore Tiers</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {investments.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#7D8998] border border-dashed border-white/10 rounded-md">
                No active yield contracts running. Explore our structured tiers to start earning.
              </div>
            ) : (
              investments.map((inv) => {
                const percentage = getProgressPercentage(inv.start_date, inv.maturity_date);
                const daysText = getDaysLeft(inv.maturity_date);
                const planName = inv.plan?.name || "Horizon Yield";
                return (
                  <div key={inv.id} className="p-4 rounded-md bg-[#0B0F14] border border-white/10 flex flex-col gap-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-semibold text-xs text-white block">{planName} Tier</span>
                        <span className="num text-[11px] text-[#7D8998] mt-0.5 block">
                          Principal: {formatCrypto(inv.amount, 4)} {inv.currency}
                        </span>
                      </div>
                      <span className="badge badge-accent text-[10px] font-bold">
                        {daysText}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="progress">
                        <span style={{ width: `${percentage}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-[#7D8998] num">
                        <span>Started: {inv.start_date ? new Date(inv.start_date).toLocaleDateString() : "Active"}</span>
                        <span>Maturity: {percentage}%</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5 mt-1">
                      <span className="text-[#7D8998]">Expected Total Settlement:</span>
                      <span className="num font-bold text-white font-mono">
                        {formatCrypto(inv.expected_return, 5)} {inv.currency}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Referral Card */}
        <div className="lg:col-span-5 panel p-6 flex flex-col gap-5">
          <h3 className="font-semibold text-sm text-white flex items-center gap-2 pb-4 border-b border-white/10">
            <Users className="h-4 w-4 text-[#4388F5]" /> Partner Program
          </h3>

          <p className="text-xs text-[#A6B0BE] leading-relaxed">
            Earn direct compounding commissions when your partners register and fund investment tiers. Commissions credit immediately to your liquid balance.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-[#7D8998] uppercase tracking-wider">
              Your Referral Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={referralCode ? `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${referralCode}` : "Generating..."}
                className="input text-xs font-mono select-all"
              />
              <button
                type="button"
                onClick={copyReferralLink}
                className="btn btn-primary px-3 text-xs shrink-0"
                aria-label="Copy referral link"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center pt-3 border-t border-white/10">
            <div className="p-3 rounded bg-[#0B0F14] border border-white/5">
              <span className="text-[10px] text-[#7D8998] uppercase block font-medium">Referred Members</span>
              <span className="num text-xl font-bold text-white mt-0.5 block">{referralCount}</span>
            </div>
            <div className="p-3 rounded bg-[#0B0F14] border border-white/5">
              <span className="text-[10px] text-[#7D8998] uppercase block font-medium">Earned Rewards</span>
              <span className="num text-xl font-bold text-[#27C58B] mt-0.5 block">${formatUsd(referralEarnings)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
