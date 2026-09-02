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
  Sparkles,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { api } from "@/lib/api";

interface WalletItem {
  id: string;
  currency: string;
  balance: number;
  frozen_balance: number;
  total_deposited: number;
  total_withdrawn: number;
}

interface InvestmentItem {
  id: string;
  amount: number;
  currency: string;
  expected_return: number;
  status: string;
  start_date: string;
  maturity_date: string;
  plan: {
    name: string;
    duration_days: number;
  };
}

export default function DashboardOverview() {
  const { user } = useAuthStore();
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [investments, setInvestments] = useState<InvestmentItem[]>([]);
  const [referralCode, setReferralCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState(0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Exchange rates for visual USD total calculation
  const cryptoRates: Record<string, number> = {
    BTC: 95000,
    ETH: 3200,
    USDT: 1,
    SOL: 180,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletsRes, investmentsRes, referralsRes] = await Promise.all([
          api.get("/wallets"),
          api.get("/investments?status=active"),
          api.get("/referrals/stats"),
        ]);
        
        setWallets(walletsRes.data);
        setInvestments(investmentsRes.data);
        
        setReferralCode(referralsRes.data.referral_code);
        setReferralCount(referralsRes.data.referral_count);
        setReferralEarnings(referralsRes.data.referral_earnings);
      } catch (e) {
        console.error("Error loading dashboard data:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate total portfolio value in USD
  const totalBalanceUsd = wallets.reduce((sum, w) => {
    const rate = cryptoRates[w.currency.toUpperCase()] || 0;
    return sum + (w.balance + w.frozen_balance) * rate;
  }, 0);

  const copyReferralLink = () => {
    if (!referralCode) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const link = `${origin}/register?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to calculate progress percentage for active investments
  const getProgressPercentage = (startStr: string, endStr: string) => {
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    const now = Date.now();

    if (now >= end) return 100;
    if (now <= start) return 0;

    const total = end - start;
    const elapsed = now - start;
    return Math.min(Math.round((elapsed / total) * 100), 99);
  };

  const getDaysLeft = (endStr: string) => {
    const end = new Date(endStr).getTime();
    const diff = end - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : "Matured";
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold-300" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 stagger-1 animate-slide-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome back, {user?.full_name}</h1>
          <p className="text-sm text-text-secondary mt-1">Here is your crypto portfolio performance overview.</p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard/wallets" className="btn-secondary py-2 px-4 text-xs font-semibold">
            Deposit Funds
          </Link>
          <Link href="/dashboard/investments" className="btn-primary py-2 px-4 text-xs font-semibold">
            Invest Now <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Portfolio valuation card */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-2 animate-slide-up">
        {/* Total Assets Balance Card */}
        <div className="stat-card bg-gradient-to-tr from-[#0D2D4A] via-[#0D2D4A] to-gold-500/5 relative overflow-hidden flex flex-col gap-2">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Wallet className="h-20 w-20" />
          </div>
          <span className="text-xs text-text-secondary">Estimated Total Assets</span>
          <span className="text-3xl font-extrabold tracking-tight mt-1 text-gradient">
            ${totalBalanceUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-text-muted mt-1 uppercase tracking-wide">
            Aggregated Wallet Balances
          </span>
        </div>

        {/* Total Earnings Card */}
        <div className="stat-card flex flex-col gap-2">
          <span className="text-xs text-text-secondary">Referral Earnings</span>
          <span className="text-3xl font-extrabold tracking-tight mt-1 text-white">
            ${referralEarnings.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-text-muted mt-1 uppercase tracking-wide">
            Earned via {referralCount} Referees
          </span>
        </div>

        {/* Active Investments Count Card */}
        <div className="stat-card flex flex-col gap-2">
          <span className="text-xs text-text-secondary">Active Contracts</span>
          <span className="text-3xl font-extrabold tracking-tight mt-1 text-white">
            {investments.length}
          </span>
          <span className="text-[10px] text-text-muted mt-1 uppercase tracking-wide">
            Accruing yield compounds
          </span>
        </div>

        {/* Support Tickets Open Card */}
        <div className="stat-card flex flex-col gap-2">
          <span className="text-xs text-text-secondary">KYC Status</span>
          <span className={`text-xl font-bold tracking-tight mt-3 uppercase ${
            user?.kyc_status === "verified" ? "text-green-400" : user?.kyc_status === "pending" ? "text-gold-300 animate-pulse" : "text-[#ff6b6b]"
          }`}>
            {user?.kyc_status || "Unverified"}
          </span>
          <span className="text-[10px] text-text-muted mt-1 uppercase tracking-wide">
            Identity verification details
          </span>
        </div>
      </div>

      {/* Individual Cryptocurrencies grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-3 animate-slide-up">
        {["BTC", "ETH", "USDT", "SOL"].map((curr) => {
          const w = wallets.find((item) => item.currency.toUpperCase() === curr);
          const balance = w ? w.balance : 0;
          const frozen = w ? w.frozen_balance : 0;
          
          let colorClass = "text-white";
          if (curr === "BTC") colorClass = "text-btc";
          else if (curr === "ETH") colorClass = "text-eth";
          else if (curr === "USDT") colorClass = "text-usdt";
          else if (curr === "SOL") colorClass = "text-sol";

          return (
            <div key={curr} className="card p-5 flex flex-col justify-between border-white/5 bg-white/[0.01]">
              <div className="flex justify-between items-center">
                <span className={`font-extrabold text-sm ${colorClass}`}>{curr} Wallet</span>
                <span className="badge badge-gold uppercase text-[9px] py-0.5 px-2">{curr}</span>
              </div>
              <div className="mt-4 flex flex-col">
                <span className="text-xl font-bold">{balance.toFixed(6)}</span>
                {frozen > 0 && (
                  <span className="text-[10px] text-text-muted mt-0.5">
                    Frozen: {frozen.toFixed(6)} {curr}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Investments & Referrals columns */}
      <div className="grid lg:grid-cols-12 gap-8 stagger-4 animate-slide-up">
        {/* Active Investments lists */}
        <div className="lg:col-span-7 card bg-[#0D2D4A]/80 border-white/10 p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-gold-300" /> Active Yield Contracts
            </h3>
            <Link href="/dashboard/investments" className="text-xs font-semibold text-gold-300 hover:text-gold-200 flex items-center gap-1">
              View All Tiers <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {investments.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-muted border border-dashed border-white/5 rounded-xl">
                No active investment contracts currently accruing yield.
              </div>
            ) : (
              investments.map((inv) => {
                const percentage = getProgressPercentage(inv.start_date, inv.maturity_date);
                const daysText = getDaysLeft(inv.maturity_date);
                return (
                  <div key={inv.id} className="p-4 border border-white/5 bg-white/[0.01] rounded-xl flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-white">{inv.plan.name} Tier</span>
                        <span className="text-[10px] text-text-muted mt-0.5">
                          Amount: {inv.amount} {inv.currency}
                        </span>
                      </div>
                      <span className="badge badge-gold py-0.5 px-2 text-[9px] font-bold uppercase">
                        {daysText}
                      </span>
                    </div>

                    {/* Progress slider bar */}
                    <div className="flex flex-col gap-1.5 mt-1">
                      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-gold-500 to-gold-300 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-text-muted">
                        <span>Started: {new Date(inv.start_date).toLocaleDateString()}</span>
                        <span>Maturity: {percentage}%</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5 mt-1">
                      <span className="text-text-secondary">Expected Total Settlement:</span>
                      <span className="font-bold text-gold-300">
                        {inv.expected_return.toFixed(5)} {inv.currency}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Affiliate Copy Card */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="card bg-[#0D2D4A]/80 border-white/10 p-6 flex flex-col gap-5">
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-gold-300" /> Referral Program
            </h3>
            
            <p className="text-xs text-text-secondary leading-relaxed">
              Earn direct commissions when your friends register and purchase investment tiers. Payouts are made instantly to your wallet.
            </p>

            <div className="flex flex-col gap-1.5 mt-2">
              <span className="input-label text-[10px] uppercase tracking-wider">Your Referral Code</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralCode || "Generating code..."}
                  className="input text-xs font-mono select-all bg-white/[0.02]"
                />
                <button
                  onClick={copyReferralLink}
                  className="h-10 px-3 bg-gold-300 text-[#0A2540] hover:bg-gold-200 font-semibold rounded-lg flex items-center justify-center gap-1 flex-shrink-0 transition-colors"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center mt-3 pt-4 border-t border-white/5 bg-white/[0.01] rounded-xl p-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-text-muted uppercase">Registered Users</span>
                <span className="text-lg font-bold text-white mt-0.5">{referralCount}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-text-muted uppercase">Earnings Match</span>
                <span className="text-lg font-bold text-gold-300 mt-0.5">${referralEarnings.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
